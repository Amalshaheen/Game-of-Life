
export type Grid = number[][];
export type BoundaryCondition = 'bounded' | 'circular';

export interface SeedPattern {
  name: string;
  pattern: number[][];
  description?: string;
}

// Renamed to PREDEFINED_SEED_PATTERNS to distinguish from custom seeds
export const PREDEFINED_SEED_PATTERNS: SeedPattern[] = [
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

// Character patterns (approx 5 rows high)
export const CHARACTER_PATTERNS: Record<string, number[][]> = {
  'A': [
    [0,1,1,0],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  'B': [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
  ],
  'C': [
    [0,1,1,1],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [0,1,1,1],
  ],
  'D': [
    [1,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,0],
  ],
  'E': [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  'F': [
    [1,1,1,1],
    [1,0,0,0],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  'G': [
    [0,1,1,1],
    [1,0,0,0],
    [1,0,1,1],
    [1,0,0,1],
    [0,1,1,1],
  ],
  'H': [
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  'I': [
    [1,1,1],
    [0,1,0],
    [0,1,0],
    [0,1,0],
    [1,1,1],
  ],
  'J': [
    [0,0,1,1],
    [0,0,0,1],
    [0,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  'K': [
    [1,0,0,1],
    [1,0,1,0],
    [1,1,0,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  'L': [
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  'M': [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'N': [
    [1,0,0,1],
    [1,1,0,1],
    [1,0,1,1],
    [1,0,0,1],
    [1,0,0,1],
  ],
  'O': [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  'P': [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,0,0],
    [1,0,0,0],
  ],
  'Q': [
    [0,1,1,0],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,1,0],
    [0,1,0,1],
  ],
  'R': [
    [1,1,1,0],
    [1,0,0,1],
    [1,1,1,0],
    [1,0,1,0],
    [1,0,0,1],
  ],
  'S': [
    [0,1,1,1],
    [1,0,0,0],
    [0,1,1,0],
    [0,0,0,1],
    [1,1,1,0],
  ],
  'T': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  'U': [
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,0,0,1],
    [0,1,1,0],
  ],
  'V': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,1,0,1,0],
    [0,0,1,0,0],
  ],
  'W': [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [1,0,0,0,1],
  ],
  'X': [
    [1,0,0,1],
    [0,1,1,0],
    [0,1,1,0],
    [0,1,1,0],
    [1,0,0,1],
  ],
  'Y': [
    [1,0,0,1],
    [0,1,1,0],
    [0,0,1,0],
    [0,0,1,0],
    [0,0,1,0],
  ],
  'Z': [
    [1,1,1,1],
    [0,0,1,0],
    [0,1,0,0],
    [1,0,0,0],
    [1,1,1,1],
  ],
  ' ': [ 
    [0,0],
    [0,0],
    [0,0],
    [0,0],
    [0,0],
  ]
};
const DEFAULT_CHAR_HEIGHT = 5;
const CHAR_SPACING = 1; 


export const createGrid = (rows: number, cols: number, randomize: boolean = false): Grid => {
  const grid: Grid = [];
  for (let i = 0; i < rows; i++) {
    grid[i] = [];
    for (let j = 0; j < cols; j++) {
      if (randomize) {
        grid[i][j] = Math.random() > 0.75 ? 1 : 0; 
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

export const renderTextToGrid = (
  text: string,
  gridRows: number,
  gridCols: number
): { grid: Grid | null; error?: string } => {
  const inputText = text.toUpperCase();
  let totalWidth = 0;
  const charPatternsToRender: number[][][] = [];

  for (const char of inputText) {
    const pattern = CHARACTER_PATTERNS[char];
    if (pattern) {
      charPatternsToRender.push(pattern);
      totalWidth += (pattern[0]?.length || 0) + CHAR_SPACING;
    } else {
      const spacePattern = CHARACTER_PATTERNS[' '];
      if (spacePattern) {
         charPatternsToRender.push(spacePattern);
         totalWidth += (spacePattern[0]?.length || 0) + CHAR_SPACING;
      }
    }
  }
  if (totalWidth > 0) totalWidth -= CHAR_SPACING; 

  if (totalWidth === 0) {
    return { grid: createGrid(gridRows, gridCols, false) }; 
  }

  if (totalWidth > gridCols || DEFAULT_CHAR_HEIGHT > gridRows) {
    return { grid: null, error: "Text is too large for the current grid size." };
  }

  const newGrid = createGrid(gridRows, gridCols, false);
  const startRow = Math.floor((gridRows - DEFAULT_CHAR_HEIGHT) / 2);
  let currentX = Math.floor((gridCols - totalWidth) / 2);

  for (const pattern of charPatternsToRender) {
    const charHeight = pattern.length;
    const charWidth = pattern[0]?.length || 0;

    for (let r = 0; r < charHeight; r++) {
      for (let c = 0; c < charWidth; c++) {
        if (pattern[r][c] === 1) {
          const gridRow = startRow + r;
          const gridCol = currentX + c;
          if (gridRow >= 0 && gridRow < gridRows && gridCol >= 0 && gridCol < gridCols) {
            newGrid[gridRow][gridCol] = 1;
          }
        }
      }
    }
    currentX += charWidth + CHAR_SPACING;
  }

  return { grid: newGrid };
};

export const extractPatternFromGrid = (grid: Grid): Grid | null => {
  if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0) {
    return null;
  }

  let minRow = grid.length;
  let maxRow = -1;
  let minCol = grid[0].length;
  let maxCol = -1;
  let hasLiveCells = false;

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === 1) {
        hasLiveCells = true;
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  if (!hasLiveCells) {
    return null; // Return null if no live cells are found
  }

  const patternHeight = maxRow - minRow + 1;
  const patternWidth = maxCol - minCol + 1;
  const extractedPattern: Grid = [];

  for (let r = 0; r < patternHeight; r++) {
    extractedPattern[r] = [];
    for (let c = 0; c < patternWidth; c++) {
      extractedPattern[r][c] = grid[minRow + r][minCol + c];
    }
  }
  return extractedPattern;
};
