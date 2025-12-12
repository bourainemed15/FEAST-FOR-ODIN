import React from 'react';
import { TileColor } from '../types';

interface TileProps {
  matrix: number[][];
  color: TileColor;
  size?: number; // pixel size of a cell
  className?: string;
  onClick?: () => void;
  isSelected?: boolean;
}

const COLOR_MAP: Record<TileColor, string> = {
  [TileColor.ORANGE]: 'bg-orange-500 border-orange-700',
  [TileColor.RED]: 'bg-red-600 border-red-800',
  [TileColor.GREEN]: 'bg-green-600 border-green-800',
  [TileColor.BLUE]: 'bg-blue-600 border-blue-800',
  [TileColor.SPECIAL]: 'bg-gray-400 border-gray-600',
  [TileColor.BUILDING]: 'bg-amber-800 border-amber-950',
};

export const Tile: React.FC<TileProps> = ({ matrix, color, size = 20, className = '', onClick, isSelected }) => {
  const height = matrix.length;
  const width = matrix[0].length;

  return (
    <div 
      className={`relative inline-block ${className} ${isSelected ? 'ring-4 ring-yellow-400 shadow-lg scale-105' : ''} transition-all cursor-pointer`}
      style={{ width: width * size, height: height * size }}
      onClick={onClick}
    >
      {matrix.map((row, r) => (
        <div key={r} className="flex">
          {row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{ width: size, height: size }}
              className={`${cell ? COLOR_MAP[color] + ' border' : 'bg-transparent'} box-border`}
            />
          ))}
        </div>
      ))}
    </div>
  );
};