import { BOARD_HEIGHT, BOARD_WIDTH } from "./constants";
import { CellData, PlacedTile, TileColor, ResourceType } from "./types";

export const rotateMatrix = (matrix: number[][], rotation: 0 | 90 | 180 | 270): number[][] => {
  let newMatrix = matrix;
  const times = rotation / 90;
  for (let i = 0; i < times; i++) {
    newMatrix = newMatrix[0].map((val, index) => newMatrix.map(row => row[index]).reverse());
  }
  return newMatrix;
};

// Check if a tile can be placed at x,y
export const canPlaceTile = (
  board: CellData[][],
  placedTiles: PlacedTile[],
  matrix: number[][],
  x: number,
  y: number,
  newColor: TileColor
): { valid: boolean; reason?: string } => {
  const height = matrix.length;
  const width = matrix[0].length;

  // 1. Check Bounds
  if (x < 0 || y < 0 || x + width > BOARD_WIDTH || y + height > BOARD_HEIGHT) {
    return { valid: false, reason: "Out of bounds" };
  }

  // 2. Check Overlaps
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      if (matrix[r][c] === 1) {
        if (board[y + r][x + c].isCovered) {
          return { valid: false, reason: "Overlaps existing tile" };
        }
      }
    }
  }

  // 3. Adjacency Rules (Green cannot touch Green orthagonally)
  if (newColor === TileColor.GREEN) {
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // Down, Up, Right, Left
    
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (matrix[r][c] === 1) {
          const globalX = x + c;
          const globalY = y + r;

          for (const [dy, dx] of directions) {
            const checkY = globalY + dy;
            const checkX = globalX + dx;

            if (checkX >= 0 && checkX < BOARD_WIDTH && checkY >= 0 && checkY < BOARD_HEIGHT) {
               const neighbor = placedTiles.find(t => {
                 if(checkX < t.x || checkX >= t.x + t.matrix[0].length || checkY < t.y || checkY >= t.y + t.matrix.length) return false;
                 const localX = checkX - t.x;
                 const localY = checkY - t.y;
                 return t.matrix[localY] && t.matrix[localY][localX] === 1;
               });

               if (neighbor && neighbor.color === TileColor.GREEN) {
                 return { valid: false, reason: "Green cannot touch Green" };
               }
            }
          }
        }
      }
    }
  }

  // 4. Must touch existing tile or starting zone (Simplified: just needs to not fly? No, home board rule is strict)
  // For this implementation, we will trust the user or stick to the basic rules above to keep gameplay fluid.

  return { valid: true };
};

export const calculateIncome = (board: CellData[][]): number => {
  // Income rule: The income is determined by the lowest-valued UNCOVERED space on the diagonal.
  // We assume the diagonal track is at (3,0), (4,1), (5,2), etc.
  // Values: 1, 2, 3...
  
  let currentIncome = 0;
  let x = 3; 
  let y = 0;
  
  while(y < BOARD_HEIGHT && x < BOARD_WIDTH) {
      if (board[y][x].isCovered && board[y][x].bonus === 'income') {
          currentIncome++;
      } else {
          // If the sequence is broken (e.g., 1 covered, 2 open, 3 covered), income stops at 1.
          // The rule is strictly "lowest uncovered number", so if 2 is open, income is 1.
          break;
      }
      x++;
      y++;
  }
  
  return currentIncome; // If 0 spaces covered, income 0.
};

export const getSurroundedBonuses = (board: CellData[][]): ResourceType[] => {
  const bonuses: ResourceType[] = [];
  const height = board.length;
  const width = board[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = board[y][x];
      // Check if it has a resource bonus (not income) and is NOT covered
      if (cell.bonus && cell.bonus !== 'income' && !cell.isCovered) {
        let surrounded = true;
        
        // Check 8 neighbors (orth + diag)
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const ny = y + dy;
            const nx = x + dx;
            
            // If neighbor is out of bounds, it counts as "covering" the border (so it's good for surrounding)
            if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
                // If neighbor is on board, it MUST be covered to count as surrounding
                if (!board[ny][nx].isCovered) {
                    surrounded = false;
                    break;
                }
            }
          }
          if (!surrounded) break;
        }
        
        if (surrounded) {
            bonuses.push(cell.bonus as ResourceType);
        }
      }
    }
  }
  return bonuses;
};

export const calculateScore = (board: CellData[][]): number => {
  let score = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (!cell.isCovered && cell.penalty) {
        score += cell.penalty;
      }
    });
  });
  return score;
};