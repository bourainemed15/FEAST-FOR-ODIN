import React, { useState, useMemo } from 'react';
import { CellData, PlacedTile, TileColor, TileShape } from '../types';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../constants';
import { Coins, Hexagon, Gem, Trees, Pickaxe, Hammer } from 'lucide-react';
import { canPlaceTile, rotateMatrix } from '../utils';

interface GridBoardProps {
  board: CellData[][];
  placedTiles: PlacedTile[];
  onCellClick: (x: number, y: number) => void;
  selectedTile: TileShape | null;
  rotation: 0 | 90 | 180 | 270;
}

const BonusIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'silver': return <Coins size={14} className="text-gray-400" />;
    case 'mead': return <Hexagon size={14} className="text-red-800 fill-red-800" />; // Simplified icon
    case 'rune': return <Gem size={14} className="text-purple-600" />;
    case 'stone': return <Hexagon size={14} className="text-gray-600 bg-gray-300 rounded-full" />;
    case 'ore': return <Hexagon size={14} className="text-black bg-gray-600 rounded-full" />;
    case 'income': return <span className="text-xs font-bold text-yellow-600">$$</span>;
    default: return null;
  }
};

export const GridBoard: React.FC<GridBoardProps> = ({ board, placedTiles, onCellClick, selectedTile, rotation }) => {
  const [hoverPos, setHoverPos] = useState<{x: number, y: number} | null>(null);
  const CELL_SIZE = 32;

  // Memoize the rotated matrix for the selected tile
  const rotatedGhostMatrix = useMemo(() => {
    if (!selectedTile) return null;
    return rotateMatrix(selectedTile.matrix, rotation);
  }, [selectedTile, rotation]);

  // Check validity at hover position
  const ghostValidity = useMemo(() => {
    if (!selectedTile || !rotatedGhostMatrix || !hoverPos) return null;
    return canPlaceTile(board, placedTiles, rotatedGhostMatrix, hoverPos.x, hoverPos.y, selectedTile.color);
  }, [selectedTile, rotatedGhostMatrix, hoverPos, board, placedTiles]);

  return (
    <div 
        className="relative bg-[#f3e5ab] border-4 border-[#5c4033] rounded shadow-2xl p-2 select-none"
        onMouseLeave={() => setHoverPos(null)}
    >
      <h3 className="text-[#5c4033] font-bold text-center mb-1 font-serif">Home Board</h3>
      <div 
        className="grid relative"
        style={{ 
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
            gap: '1px',
            backgroundColor: '#d1c4a0'
        }}
      >
        {board.flat().map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            onClick={() => onCellClick(cell.x, cell.y)}
            onMouseEnter={() => setHoverPos({x: cell.x, y: cell.y})}
            className={`
              relative flex items-center justify-center border-[0.5px] border-[#c0b080] hover:bg-white/20 cursor-pointer
              ${cell.penalty === -1 && !cell.bonus ? 'bg-red-900/10' : ''}
            `}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
          >
            {cell.penalty === -1 && !cell.bonus && (
              <span className="text-[10px] text-red-900 opacity-50 font-bold">-1</span>
            )}
            {cell.bonus && (
              <div className="opacity-80">
                 <BonusIcon type={cell.bonus} />
              </div>
            )}
          </div>
        ))}

        {/* Render Placed Tiles */}
        {placedTiles.map((tile) => {
            const colorClass = 
                tile.color === TileColor.GREEN ? 'bg-green-700 border-green-900' :
                tile.color === TileColor.BLUE ? 'bg-blue-700 border-blue-900' :
                tile.color === TileColor.ORANGE ? 'bg-orange-500 border-orange-700' :
                tile.color === TileColor.RED ? 'bg-red-600 border-red-800' :
                tile.color === TileColor.BUILDING ? 'bg-amber-800 border-amber-950' :
                'bg-gray-500 border-gray-700';

            return (
                <div
                    key={tile.id}
                    className="absolute pointer-events-none"
                    style={{
                        left: tile.x * (CELL_SIZE + 1), // +1 for gap
                        top: tile.y * (CELL_SIZE + 1),
                        width: tile.matrix[0].length * (CELL_SIZE + 1) - 1,
                        height: tile.matrix.length * (CELL_SIZE + 1) - 1,
                    }}
                >
                    {/* Render the matrix of the tile */}
                    {tile.matrix.map((row, r) => (
                        <div key={r} className="flex">
                            {row.map((val, c) => (
                                <div 
                                    key={c}
                                    style={{ width: CELL_SIZE + 1, height: CELL_SIZE + 1}}
                                    className={`${val ? colorClass + ' border border-white/20' : ''}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            );
        })}

        {/* Render Ghost Tile */}
        {selectedTile && rotatedGhostMatrix && hoverPos && (
            <div
                className="absolute pointer-events-none z-20"
                style={{
                    left: hoverPos.x * (CELL_SIZE + 1),
                    top: hoverPos.y * (CELL_SIZE + 1),
                    width: rotatedGhostMatrix[0].length * (CELL_SIZE + 1) - 1,
                    height: rotatedGhostMatrix.length * (CELL_SIZE + 1) - 1,
                }}
            >
                {rotatedGhostMatrix.map((row, r) => (
                    <div key={r} className="flex">
                        {row.map((val, c) => (
                            <div 
                                key={c}
                                style={{ width: CELL_SIZE + 1, height: CELL_SIZE + 1}}
                                className={`${val ? (ghostValidity?.valid ? 'bg-green-400/60 border border-green-200 shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'bg-red-500/60 border border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.5)]') : 'bg-transparent'}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        )}

      </div>
      <div className="mt-2 text-xs text-[#5c4033] italic text-center">
        Cover -1s and Income diagonals. Surround bonuses.
      </div>
    </div>
  );
};