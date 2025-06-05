
export type Grid = number[][];
export type BoundaryCondition = 'bounded' | 'circular';

export const createGrid = (rows: number, cols: number, randomize: boolean = false): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      if (randomize) {
        grid[i][j] = Math.random() > 0.5 ? 1 : 0; // Adjusted density
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
  const newGrid = createGrid(rows, cols, false); // Initialize with all 0s

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
            // In circular mode, the neighbor is always "on the grid" after wrapping
            if (grid[neighborI]?.[neighborJ] === 1) {
              liveNeighbors++;
            }
          } else { // 'bounded' condition
            if (neighborI >= 0 && neighborI < rows && neighborJ >= 0 && neighborJ < cols && grid[neighborI]?.[neighborJ] === 1) {
              liveNeighbors++;
            }
          }
        }
      }

      // Apply Conway's Game of Life rules
      if (grid[i]?.[j] === 1) { // If cell is alive
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          newGrid[i][j] = 0; // Dies by underpopulation or overpopulation
        } else {
          newGrid[i][j] = 1; // Survives
        }
      } else { // If cell is dead
        if (liveNeighbors === 3) {
          newGrid[i][j] = 1; // Becomes alive by reproduction
        } else {
          newGrid[i][j] = 0; // Stays dead
        }
      }
    }
  }
  return newGrid;
};
