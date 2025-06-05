
export type Grid = number[][];
export type BoundaryCondition = 'bounded' | 'circular';

export interface SeedPattern {
  name: string;
  pattern: number[][];
  description?: string;
}

export const SEED_PATTERNS: SeedPattern[] = [
  {
    name: "Glider",
    pattern: [
      [0, 1, 0],
      [0, 0, 1],
      [1, 1, 1],
    ],
    description: "A simple spaceship that travels diagonally."
  },
  {
    name: "Blinker",
    pattern: [[1, 1, 1]],
    description: "A period 2 oscillator."
  },
  {
    name: "Toad",
    pattern: [
      [0, 1, 1, 1],
      [1, 1, 1, 0],
    ],
    description: "A period 2 oscillator."
  },
  {
    name: "Beacon",
    pattern: [
      [1, 1, 0, 0],
      [1, 1, 0, 0],
      [0, 0, 1, 1],
      [0, 0, 1, 1],
    ],
    description: "A period 2 oscillator."
  },
  {
    name: "LWSS (Light-Weight Spaceship)",
    pattern: [
      [0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0],
    ],
    description: "A common spaceship, moves horizontally."
  },
  {
    name: "R-Pentomino",
    pattern: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 1, 0]
    ],
    description: "A small methuselah that evolves for many generations."
  }
];

export const createGrid = (rows: number, cols: number, randomize: boolean = false): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      if (randomize) {
        grid[i][j] = Math.random() > 0.7 ? 1 : 0; 
      } else {
        grid[i][j] = 0;
      }
    }
  }
  return grid;
};

export const getNextGeneration = (grid: Grid, boundaryCondition: BoundaryCondition = 'bounded'): Grid => {
  if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0) return [[]];
  
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = createGrid(rows, cols, false); 

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let liveNeighbors = 0;
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
          if (xOffset === 0 && yOffset === 0) continue;

          let neighborI = i + xOffset;
          let neighborJ = j + yOffset;

          if (boundaryCondition === 'circular') {
            neighborI = (neighborI + rows) % rows;
            neighborJ = (neighborJ + cols) % cols;
            if (grid[neighborI]?.[neighborJ] === 1) {
              liveNeighbors++;
            }
          } else { 
            if (neighborI >= 0 && neighborI < rows && neighborJ >= 0 && neighborJ < cols && grid[neighborI]?.[neighborJ] === 1) {
              liveNeighbors++;
            }
          }
        }
      }

      if (grid[i]?.[j] === 1) { 
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          newGrid[i][j] = 0; 
        } else {
          newGrid[i][j] = 1; 
        }
      } else { 
        if (liveNeighbors === 3) {
          newGrid[i][j] = 1; 
        } else {
          newGrid[i][j] = 0; 
        }
      }
    }
  }
  return newGrid;
};
