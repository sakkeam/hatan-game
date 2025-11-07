import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Result, ok, err } from 'neverthrow';

export type GameState = 'title' | 'playing' | 'gameover' | 'clear';

export interface Position {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  position: Position;
  width: number;
  height: number;
}

export interface Star {
  id: string;
  position: Position;
  collected: boolean;
}

export interface Player {
  position: Position;
  velocity: number;
  invincible: boolean;
  invincibleTimeRemaining: number;
}

interface GameStore {
  gameState: GameState;
  player: Player;
  obstacles: Obstacle[];
  stars: Star[];
  score: number;
  scrollSpeed: number;
  
  // Actions
  startGame: () => Result<void, string>;
  resetGame: () => void;
  movePlayerUp: () => void;
  movePlayerDown: () => void;
  updatePlayerPosition: (deltaTime: number) => void;
  updateObstacles: (deltaTime: number) => void;
  updateStars: (deltaTime: number) => void;
  collectStar: (starId: string) => Result<void, string>;
  checkCollision: () => boolean;
  gameOver: () => void;
  gameClear: () => void;
  updateInvincibility: (deltaTime: number) => void;
}

const PLAYER_MOVE_SPEED = 5;
const INITIAL_SCROLL_SPEED = 3;
const INVINCIBLE_DURATION = 5000; // 5 seconds
const PLAYER_BOUNDS_TOP = 5;
const PLAYER_BOUNDS_BOTTOM = -5;
const GAME_DISTANCE = 100; // ゴールまでの距離

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    gameState: 'title',
    player: {
      position: { x: -8, y: 0 },
      velocity: 0,
      invincible: false,
      invincibleTimeRemaining: 0,
    },
    obstacles: [],
    stars: [],
    score: 0,
    scrollSpeed: INITIAL_SCROLL_SPEED,

    startGame: () => {
      try {
        set((state) => {
          state.gameState = 'playing';
          state.score = 0;
          state.player = {
            position: { x: -8, y: 0 },
            velocity: 0,
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
        state.score = 0;
        state.player = {
          position: { x: -8, y: 0 },
          velocity: 0,
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
        state.player.velocity = PLAYER_MOVE_SPEED;
      });
    },

    movePlayerDown: () => {
      set((state) => {
        state.player.velocity = -PLAYER_MOVE_SPEED;
      });
    },

    updatePlayerPosition: (deltaTime: number) => {
      set((state) => {
        const newY = state.player.position.y + state.player.velocity * deltaTime;
        state.player.position.y = Math.max(
          PLAYER_BOUNDS_BOTTOM,
          Math.min(PLAYER_BOUNDS_TOP, newY)
        );
        // Apply friction
        state.player.velocity *= 0.9;
      });
    },

    updateObstacles: (deltaTime: number) => {
      const { scrollSpeed, score } = get();
      
      set((state) => {
        // Move obstacles
        state.obstacles.forEach((obstacle) => {
          obstacle.position.x -= scrollSpeed * deltaTime;
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

        // Check if player reached goal
        if (score >= GAME_DISTANCE) {
          get().gameClear();
        }
      });
    },

    updateStars: (deltaTime: number) => {
      const { scrollSpeed } = get();
      
      set((state) => {
        // Move stars
        state.stars.forEach((star) => {
          if (!star.collected) {
            star.position.x -= scrollSpeed * deltaTime;
          }
        });

        // Remove off-screen stars
        state.stars = state.stars.filter(
          (star) => star.collected || star.position.x > -15
        );

        // Add new stars if needed
        const activeStar = state.stars.find((s) => !s.collected && s.position.x > -15);
        if (!activeStar && Math.random() < 0.02) {
          const newStar = generateSingleStar(15);
          state.stars.push(newStar);
        }
      });
    },

    collectStar: (starId: string) => {
      const star = get().stars.find((s) => s.id === starId);
      if (!star) {
        return err('Star not found');
      }
      if (star.collected) {
        return err('Star already collected');
      }

      set((state) => {
        const targetStar = state.stars.find((s) => s.id === starId);
        if (targetStar) {
          targetStar.collected = true;
          state.player.invincible = true;
          state.player.invincibleTimeRemaining = INVINCIBLE_DURATION;
          state.score += 10;
        }
      });

      return ok(undefined);
    },

    checkCollision: () => {
      const { player, obstacles } = get();
      
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

        if (
          playerBox.maxX > obstacleBox.minX &&
          playerBox.minX < obstacleBox.maxX &&
          playerBox.maxY > obstacleBox.minY &&
          playerBox.minY < obstacleBox.maxY
        ) {
          return true;
        }
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

    updateInvincibility: (deltaTime: number) => {
      set((state) => {
        if (state.player.invincible) {
          state.player.invincibleTimeRemaining -= deltaTime * 1000;
          if (state.player.invincibleTimeRemaining <= 0) {
            state.player.invincible = false;
            state.player.invincibleTimeRemaining = 0;
          }
        }
      });
    },
  }))
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
  const height = Math.random() * 2 + 1.5;
  const yPosition = (Math.random() - 0.5) * 6;
  
  return {
    id: `obstacle-${Date.now()}-${Math.random()}`,
    position: { x: xPosition, y: yPosition },
    width: 1,
    height,
  };
}

function generateStars(): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < 3; i++) {
    stars.push(generateSingleStar(10 + i * 20));
  }
  return stars;
}

function generateSingleStar(xPosition: number): Star {
  const yPosition = (Math.random() - 0.5) * 6;
  
  return {
    id: `star-${Date.now()}-${Math.random()}`,
    position: { x: xPosition, y: yPosition },
    collected: false,
  };
}
