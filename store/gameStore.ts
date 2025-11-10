import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Result, ok, err } from 'neverthrow';

export type GameState = 'title' | 'playing' | 'gameover' | 'clear';

export interface Position {
  x: number;
  y: number;
}

export type ObstacleType = 'hiragana' | 'katakana' | 'kanji' | 'romaji';

export interface Obstacle {
  id: string;
  position: Position;
  width: number;
  height: number;
  type: ObstacleType;
  text: string;
}

export interface Player {
  position: Position;
  currentLane: number; // 0-4 representing the five lanes
  invincible: boolean;
  invincibleTimeRemaining: number;
}

export interface Star {
  id: string;
  position: Position;
  collected: boolean;
}

interface GameStore {
  gameState: GameState;
  player: Player;
  obstacles: Obstacle[];
  stars: Star[];
  distance: number;
  scrollSpeed: number;
  timeLimit: number;
  timeRemaining: number;
  
  // Actions
  startGame: () => Result<void, string>;
  resetGame: () => void;
  movePlayerUp: () => void;
  movePlayerDown: () => void;
  updatePlayerPosition: (deltaTime: number) => void;
  updateObstacles: (deltaTime: number) => void;
  updateStars: (deltaTime: number) => void;
  updateDistance: (deltaTime: number) => void;
  updateTimer: (deltaTime: number) => void;
  checkCollision: () => boolean;
  checkStarCollection: () => void;
  gameOver: () => void;
  gameClear: () => void;
  updateObstacleDimensions: (id: string, width: number, height: number) => void;
}

const LANES = [-4.8, -2.4, 0, 2.4, 4.8]; // Y coordinates for 5 lanes (matching background sections)
const LANE_TRANSITION_SPEED = 0.2; // Interpolation speed for lane switching
const INITIAL_SCROLL_SPEED = 3;
const TIME_LIMIT = 30000; // 30 seconds in milliseconds
const INVINCIBLE_DURATION = 5000; // 5 seconds
const GAME_DISTANCE = 100; // ゴールまでの距離

// Speed multipliers for each obstacle type
const SPEED_MULTIPLIERS: Record<ObstacleType, number> = {
  hiragana: 1.0,   // はたーん - standard speed
  katakana: 1.0,   // ハターン - standard speed
  kanji: 0.7,      // 破綻 - slower than standard
  romaji: 1.3,     // hatan - faster than standard
};

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    gameState: 'title',
    player: {
      position: { x: -8, y: LANES[2] },
      currentLane: 2,
      invincible: false,
      invincibleTimeRemaining: 0,
    },
    obstacles: [],
    stars: [],
    distance: 0,
    scrollSpeed: INITIAL_SCROLL_SPEED,
    timeLimit: TIME_LIMIT,
    timeRemaining: TIME_LIMIT,

    startGame: () => {
      try {
        set((state) => {
          state.gameState = 'playing';
          state.distance = 0;
          state.timeRemaining = TIME_LIMIT;
          state.player = {
            position: { x: -8, y: LANES[2] },
            currentLane: 2,
            invincible: false,
            invincibleTimeRemaining: 0,
          };
          state.obstacles = generateObstacles();
          state.stars = generateStars();
          state.scrollSpeed = INITIAL_SCROLL_SPEED;
        });
        return ok(undefined);
      } catch (error) {
        return err(`Failed to start game: ${error}`);
      }
    },

    resetGame: () => {
      set((state) => {
        state.gameState = 'title';
        state.distance = 0;
        state.timeRemaining = TIME_LIMIT;
        state.player = {
          position: { x: -8, y: LANES[2] },
          currentLane: 2,
          invincible: false,
          invincibleTimeRemaining: 0,
        };
        state.obstacles = [];
        state.stars = [];
        state.scrollSpeed = INITIAL_SCROLL_SPEED;
      });
    },

    movePlayerUp: () => {
      set((state) => {
        if (state.player.currentLane < LANES.length - 2) { // Prevent moving to topmost lane
          state.player.currentLane++;
        }
      });
    },

    movePlayerDown: () => {
      set((state) => {
        if (state.player.currentLane > 0) {
          state.player.currentLane--;
        }
      });
    },

    updatePlayerPosition: (deltaTime: number) => {
      set((state) => {
        const targetY = LANES[state.player.currentLane];
        // Smooth interpolation to target lane
        state.player.position.y += (targetY - state.player.position.y) * LANE_TRANSITION_SPEED;
      });
    },

    updateObstacles: (deltaTime: number) => {
      const { scrollSpeed } = get();
      
      set((state) => {
        // Move obstacles
        state.obstacles.forEach((obstacle) => {
          const speedMultiplier = SPEED_MULTIPLIERS[obstacle.type];
          obstacle.position.x -= scrollSpeed * deltaTime * speedMultiplier;
        });

        // Remove off-screen obstacles
        state.obstacles = state.obstacles.filter(
          (obstacle) => obstacle.position.x > -15
        );

        // Add new obstacles if needed
        const rightmostObstacle = state.obstacles.reduce(
          (max, obs) => (obs.position.x > max ? obs.position.x : max),
          0
        );

        if (rightmostObstacle < 15 && state.obstacles.length < 20) {
          const newObstacle = generateSingleObstacle(rightmostObstacle + 8);
          state.obstacles.push(newObstacle);
        }
      });
    },

    updateStars: (deltaTime: number) => {
      const { scrollSpeed } = get();
      
      set((state) => {
        // Move stars
        state.stars.forEach((star) => {
          star.position.x -= scrollSpeed * deltaTime;
        });

        // Remove off-screen stars
        state.stars = state.stars.filter(
          (star) => star.position.x > -15
        );

        // Add new stars if needed
        const rightmostStar = state.stars.reduce(
          (max, star) => (star.position.x > max ? star.position.x : max),
          0
        );

        if (rightmostStar < 15 && state.stars.length < 10) {
          const newStar = generateSingleStar(rightmostStar + 12);
          state.stars.push(newStar);
        }
      });
    },

    updateDistance: (deltaTime: number) => {
      const { scrollSpeed } = get();
      
      set((state) => {
        state.distance += scrollSpeed * deltaTime * 10;
      });
    },

    updateTimer: (deltaTime: number) => {
      set((state) => {
        state.timeRemaining = Math.max(0, state.timeRemaining - deltaTime * 1000);
      });
    },

    checkCollision: () => {
      const { player, obstacles } = get();

      const playerBox = {
        minX: player.position.x - 0.5,
        maxX: player.position.x + 0.5,
        minY: player.position.y - 0.5,
        maxY: player.position.y + 0.5,
      };

      for (const obstacle of obstacles) {
        const obstacleBox = {
          minX: obstacle.position.x - obstacle.width / 2,
          maxX: obstacle.position.x + obstacle.width / 2,
          minY: obstacle.position.y - obstacle.height / 2,
          maxY: obstacle.position.y + obstacle.height / 2,
        };

        // Check 2D AABB collision
        const xCollision = playerBox.maxX > obstacleBox.minX && playerBox.minX < obstacleBox.maxX;
        const yCollision = playerBox.maxY > obstacleBox.minY && playerBox.minY < obstacleBox.maxY;

        if (xCollision && yCollision) {
          return true;
        }
      }

      return false;
    },

    checkStarCollection: () => {
      const { player } = get();

      const playerBox = {
        minX: player.position.x - 0.5,
        maxX: player.position.x + 0.5,
        minY: player.position.y - 0.5,
        maxY: player.position.y + 0.5,
      };

      set((state) => {
        state.stars.forEach((star) => {
          if (!star.collected) {
            const starBox = {
              minX: star.position.x - 0.4,
              maxX: star.position.x + 0.4,
              minY: star.position.y - 0.4,
              maxY: star.position.y + 0.4,
            };

            if (
              playerBox.maxX > starBox.minX &&
              playerBox.minX < starBox.maxX &&
              playerBox.maxY > starBox.minY &&
              playerBox.minY < starBox.maxY
            ) {
              star.collected = true;
            }
          }
        });
      });
    },

    gameOver: () => {
      set((state) => {
        state.gameState = 'gameover';
      });
    },

    gameClear: () => {
      set((state) => {
        state.gameState = 'clear';
      });
    },

    updateObstacleDimensions: (id: string, width: number, height: number) => {
      set((state) => {
        const obstacle = state.obstacles.find((obs) => obs.id === id);
        if (obstacle) {
          obstacle.width = width;
          obstacle.height = height;
        }
      });
    },
  })
);

// Helper functions
function generateObstacles(): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (let i = 0; i < 10; i++) {
    obstacles.push(generateSingleObstacle(5 + i * 8));
  }
  return obstacles;
}

function generateSingleObstacle(xPosition: number): Obstacle {
  const lane = Math.floor(Math.random() * LANES.length);
  
  // Randomly select one of four hatan patterns
  const patterns: Array<{ type: ObstacleType; text: string }> = [
    { type: 'hiragana', text: 'はたーん' },
    { type: 'katakana', text: 'ハターン' },
    { type: 'kanji', text: '破綻' },
    { type: 'romaji', text: 'hatan' },
  ];
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  return {
    id: `obstacle-${Date.now()}-${Math.random()}`,
    position: { x: xPosition, y: LANES[lane] },
    width: 0.8,
    height: 1.0,
    type: pattern.type,
    text: pattern.text,
  };
}

function generateStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < 5; i++) {
    stars.push(generateSingleStar(10 + i * 12));
  }
  return stars;
}

function generateSingleStar(xPosition: number): Star {
  const lane = Math.floor(Math.random() * LANES.length);
  
  return {
    id: `star-${Date.now()}-${Math.random()}`,
    position: { x: xPosition, y: LANES[lane] },
    collected: false,
  };
}
