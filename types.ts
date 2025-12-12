
export type ResourceType = 'wood' | 'stone' | 'ore' | 'silver' | 'hacksilver' | 'rune' | 'mead' | 'oil';
export type WeaponType = 'bow' | 'snare' | 'spear' | 'longsword';

export enum TileColor {
  ORANGE = 'orange', // Agricultural Goods (Food) - Cannot touch same
  RED = 'red',       // Animal Products (Food)
  GREEN = 'green',   // Craft Goods - Cannot touch Green
  BLUE = 'blue',     // Luxury Goods
  SPECIAL = 'special', // Grey/Ore/Stone tiles
  BUILDING = 'building' // Sheds, Houses
}

export interface GridCoord {
  x: number;
  y: number;
}

export interface TileShape {
  id: string;
  name: string;
  color: TileColor;
  matrix: number[][]; // 1 for filled, 0 for empty
  width: number;
  height: number;
  value: number; // Point value or size
}

export interface PlacedTile {
  id: string;
  shapeId: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  color: TileColor;
  matrix: number[][];
}

export interface CellData {
  x: number;
  y: number;
  isCovered: boolean;
  bonus?: ResourceType | 'income';
  penalty?: number; // -1
}

export interface PlayerResources {
  wood: number;
  stone: number;
  ore: number;
  silver: number;
  hacksilver: number; // 1 hacksilver = 1 silver usually, keeping distinct for game logic if needed
  mead: number;
  rune: number;
  oil: number;
  // Weapons
  bow: number;
  snare: number;
  spear: number;
  longsword: number;
}

export interface ActionSpace {
  id: string;
  name: string;
  vikingCost: 1 | 2 | 3 | 4;
  category: 'Production' | 'Trade' | 'Mountain' | 'Special' | 'Exploration';
  description: string;
  // Risk Mechanics
  riskType?: 'hunt' | 'raid'; // hunt uses D8, raid uses D12
  baseStrength?: number; // For raiding
  requiredWeapon?: WeaponType;
  rewards?: {
    success: string[]; // List of tile IDs
    fail?: string[];
  };
}

export interface Island {
  id: string;
  name: string;
  grid: CellData[][];
  placedTiles: PlacedTile[];
  incomeStart: number;
  isUnlocked: boolean;
  vp: number; // Victory points for unlocking
}

export interface GameState {
  round: number; // 1 to 7
  activeColor: 'blue' | 'yellow';
  resources: PlayerResources;
  inventory: TileShape[]; // Tiles player holds but hasn't placed
  placedTiles: PlacedTile[]; // Home board tiles
  islands: Island[]; // Discovered islands
  actionsTaken: { id: string; color: 'blue' | 'yellow' }[]; // Track which spaces are blocked
  vikingsAvailable: number;
  vikingsTotal: number;
  phase: 'income' | 'work' | 'feast' | 'bonus' | 'cleanup' | 'gameover';
  selectedTileId: string | null;
  feastFood: TileShape[]; // Food placed on the banquet table
  activeBoardId: 'home' | string; // 'home' or island ID
}
