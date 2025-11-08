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

export interface Player {
  position: Position;
  velocity: number;
}

interface GameStore {
  gameState: GameState;
  player: Player;
  obstacles: Obstacle[];
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
  updateDistance: (deltaTime: number) => void;
  updateTimer: (deltaTime: number) => void;
  checkCollision: () => boolean;
  gameOver: () => void;
  gameClear: () => void;
}

const PLAYER_MOVE_SPEED = 5;
const INITIAL_SCROLL_SPEED = 3;
const PLAYER_BOUNDS_TOP = 5;
const PLAYER_BOUNDS_BOTTOM = -5;
const TIME_LIMIT = 30000; // 30 seconds in milliseconds

export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    gameState: 'title',
    player: {
      position: { x: -8, y: 0 },
      velocity: 0,
    },
    obstacles: [],
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
            position: { x: -8, y: 0 },
            velocity: 0,
          };
          state.obstacles = generateObstacles();
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
          position: { x: -8, y: 0 },
          velocity: 0,
        };
        state.obstacles = [];
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
      const { scrollSpeed } = get();
      
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
