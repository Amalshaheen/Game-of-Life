export type Grid = number[][];

export const createGrid = (rows: number, cols: number, randomize: boolean = false): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      if (randomize) {
        grid[i][j] = Math.random() > 0.75 ? 1 : 0; // Adjust randomization factor for sparser initial grids
      } else {
        grid[i][j] = 0;
      }
    }
  }
  return grid;
};

export const getNextGeneration = (grid: Grid): Grid => {
  if (!grid || grid.length === 0 || grid[0].length === 0) return [[]];
  
  const rows = grid.length;
  const cols = grid[0].length;
  const newGrid = createGrid(rows, cols, false); // Initialize with all 0s

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let liveNeighbors = 0;
      for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
          if (xOffset === 0 && yOffset === 0) continue;

          const neighborI = i + xOffset;
          const neighborJ = j + yOffset;

          // Handle boundaries: cells outside the grid are considered dead
          if (neighborI >= 0 && neighborI < rows && neighborJ >= 0 && neighborJ < cols && grid[neighborI][neighborJ] === 1) {
            liveNeighbors++;
          }
        }
      }

      // Apply Conway's Game of Life rules
      if (grid[i][j] === 1) { // If cell is alive
        if (liveNeighbors < 2 || liveNeighbors > 3) {
          newGrid[i][j] = 0; // Dies by underpopulation or overpopulation
        } else {
          newGrid[i][j] = 1; // Survives
        }
      } else { // If cell is dead
        if (liveNeighbors === 3) {
          newGrid[i][j] = 1; // Becomes alive by reproduction
        }
      }
    }
  }
  return newGrid;
};
