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

const INVINCIBLE_DURATION = 5000; // 5 seconds in milliseconds
const GAME_TIME_LIMIT = 60000; // 60 seconds in milliseconds

export interface Star {
  id: string;
  position: Position;
  collected: boolean;
}

export interface Goal {
  id: string;
  position: Position;
  width: number;
  height: number;
  reached: boolean;
}

interface GameStore {
  gameState: GameState;
  player: Player;
  obstacles: Obstacle[];
  stars: Star[];
  goal: Goal | null;
  distance: number;
  scrollSpeed: number;
  timeRemaining: number;
  
  // Actions
  startGame: () => Result<void, string>;
  resetGame: () => void;
  movePlayerUp: () => void;
  movePlayerDown: () => void;
  updatePlayerPosition: (deltaTime: number) => void;
  updateObstacles: (deltaTime: number) => void;
  updateStars: (deltaTime: number) => void;
  updateGoal: (deltaTime: number) => void;
  updateDistance: (deltaTime: number) => void;
  updateTimer: (deltaTime: number) => void;
  updateInvincibility: (deltaTime: number) => void;
  checkCollision: () => boolean;
  checkStarCollection: () => void;
  checkGoalReached: () => boolean;
  gameOver: () => void;
  gameClear: () => void;
  updateObstacleDimensions: (id: string, width: number, height: number) => void;
}

const LANES = [-4.8, -2.4, 0, 2.4, 4.8]; // Y coordinates for 5 lanes (matching background sections)
const LANE_TRANSITION_SPEED = 0.2; // Interpolation speed for lane switching
const INITIAL_SCROLL_SPEED = 3;
const GAME_DISTANCE = 100; // ゴールまでの距離
const GOAL_SPAWN_DISTANCE = 80; // ゴールが出現する距離

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
    goal: null,
    distance: 0,
    scrollSpeed: INITIAL_SCROLL_SPEED,
    timeRemaining: GAME_TIME_LIMIT,

    startGame: () => {
      try {
        set((state) => {
          state.gameState = 'playing';
          state.distance = 0;
          state.goal = null;
          state.timeRemaining = GAME_TIME_LIMIT;
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
        state.goal = null;
        state.timeRemaining = GAME_TIME_LIMIT;
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
          const newObstacle = generateSingleObstacle(rightmostObstacle + 8, state.obstacles);
          if (newObstacle !== null) {
            state.obstacles.push(newObstacle);
          }
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

    updateGoal: (deltaTime: number) => {
      const { scrollSpeed, distance, goal } = get();
      
      set((state) => {
        // Spawn goal at 80m if not already spawned
        if (!state.goal && state.distance >= GOAL_SPAWN_DISTANCE) {
          state.goal = {
            id: 'goal',
            position: { x: 15, y: 0 },
            width: 2,
            height: 12,
            reached: false,
          };
        }
        
        // Move goal if it exists and hasn't been reached
        if (state.goal && !state.goal.reached) {
          state.goal.position.x -= scrollSpeed * deltaTime;
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
        if (state.timeRemaining <= 0 && state.gameState === 'playing') {
          state.gameState = 'gameover';
        }
      });
    },

    updateInvincibility: (deltaTime: number) => {
      set((state) => {
        if (state.player.invincible && state.player.invincibleTimeRemaining > 0) {
          state.player.invincibleTimeRemaining -= deltaTime * 1000;
          if (state.player.invincibleTimeRemaining <= 0) {
            state.player.invincible = false;
            state.player.invincibleTimeRemaining = 0;
          }
        }
      });
    },

    checkCollision: () => {
      const { player, obstacles } = get();

      // Player is invincible, no collision
      if (player.invincible) {
        return false;
      }

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
              state.player.invincible = true;
              state.player.invincibleTimeRemaining = INVINCIBLE_DURATION;
            }
          }
        });
      });
    },

    checkGoalReached: () => {
      const { player, goal } = get();
      
      if (!goal || goal.reached) return false;

      const playerBox = {
        minX: player.position.x - 0.5,
        maxX: player.position.x + 0.5,
        minY: player.position.y - 0.5,
        maxY: player.position.y + 0.5,
      };

      const goalBox = {
        minX: goal.position.x - goal.width / 2,
        maxX: goal.position.x + goal.width / 2,
        minY: goal.position.y - goal.height / 2,
        maxY: goal.position.y + goal.height / 2,
      };

      // AABB collision check
      if (
        playerBox.maxX > goalBox.minX &&
        playerBox.minX < goalBox.maxX &&
        playerBox.maxY > goalBox.minY &&
        playerBox.minY < goalBox.maxY
      ) {
        set((state) => {
          if (state.goal) {
            state.goal.reached = true;
          }
        });
        get().gameClear();
        return true;
      }

      return false;
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
  }))
);

// Helper functions
function generateObstacles(): Obstacle[] {
  const obstacles: Obstacle[] = [];
  for (let i = 0; i < 10; i++) {
    const newObstacle = generateSingleObstacle(5 + i * 8, obstacles);
    if (newObstacle !== null) {
      obstacles.push(newObstacle);
    }
  }
  return obstacles;
}

function generateSingleObstacle(xPosition: number, existingObstacles: Obstacle[] = []): Obstacle | null {
  // Find obstacles at the same X position (within ±0.5 units)
  const obstaclesAtSameX = existingObstacles.filter(
    (obs) => Math.abs(obs.position.x - xPosition) < 0.5
  );
  
  // Get occupied lane indices
  const occupiedLanes = new Set(
    obstaclesAtSameX.map((obs) => {
      // Find which lane this obstacle is in
      return LANES.findIndex((laneY) => Math.abs(laneY - obs.position.y) < 0.1);
    })
  );
  
  // If 3 or more lanes are occupied at this X position, find available lanes
  if (occupiedLanes.size >= 3) {
    const availableLanes = Array.from(
      { length: LANES.length },
      (_, i) => i
    ).filter((i) => !occupiedLanes.has(i));
    
    // If no lanes available, skip generation
    if (availableLanes.length === 0) {
      return null;
    }
    
    // Pick random available lane
    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const height = Math.random() * 2 + 1.5;
    
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
      width: 1,
      height,
      type: pattern.type,
      text: pattern.text,
    };
  }
  
  // Less than 3 obstacles at this position, proceed normally
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
