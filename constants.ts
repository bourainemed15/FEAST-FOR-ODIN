import { ActionSpace, CellData, PlayerResources, ResourceType, TileColor, TileShape, Island } from "./types";

// Board Dimensions: 7 tall x 13 wide (Simplified Representation of the main zone)
export const BOARD_WIDTH = 13;
export const BOARD_HEIGHT = 7;

// Helper to create grid
const createGrid = (w: number, h: number, bonuses: {x: number, y: number, type: ResourceType | 'income'}[], negatives: boolean = true) => {
  return Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => {
      const bonusDef = bonuses.find(b => b.x === x && b.y === y);
      let bonus = bonusDef ? bonusDef.type : undefined;
      // Simple Income Diagonal
      if (!bonus && x === y + 3) bonus = 'income'; 

      return {
        x,
        y,
        isCovered: false,
        bonus,
        penalty: negatives && !bonus ? -1 : undefined
      };
    })
  );
};

// Main Home Board
export const INITIAL_BOARD: CellData[][] = createGrid(BOARD_WIDTH, BOARD_HEIGHT, [
  {x: 2, y: 2, type: 'mead'},
  {x: 4, y: 4, type: 'rune'},
  {x: 6, y: 1, type: 'silver'},
  {x: 8, y: 5, type: 'stone'},
  {x: 10, y: 3, type: 'ore'}
]);

// Islands Data
export const ISLAND_CONFIGS: Record<string, Omit<Island, 'placedTiles' | 'isUnlocked'>> = {
  'faroe': {
    id: 'faroe',
    name: 'Faroe Islands',
    vp: 2,
    incomeStart: 2,
    grid: createGrid(8, 5, [ // Smaller grid
       {x: 1, y: 1, type: 'silver'},
       {x: 4, y: 3, type: 'ore'},
       {x: 6, y: 2, type: 'wool'} as any
    ], true)
  },
  'iceland': {
    id: 'iceland',
    name: 'Iceland',
    vp: 6,
    incomeStart: 4,
    grid: createGrid(9, 6, [
       {x: 2, y: 2, type: 'mead'},
       {x: 5, y: 1, type: 'stone'},
       {x: 7, y: 4, type: 'pelt'} as any
    ], true)
  }
};

export const TILES: Record<string, TileShape> = {
  // Orange (Food)
  'peas': { id: 'peas', name: 'Peas', color: TileColor.ORANGE, width: 1, height: 1, value: 0, matrix: [[1]] },
  'flax': { id: 'flax', name: 'Flax', color: TileColor.ORANGE, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'beans': { id: 'beans', name: 'Beans', color: TileColor.ORANGE, width: 3, height: 1, value: 0, matrix: [[1, 1, 1]] },
  'grain': { id: 'grain', name: 'Grain', color: TileColor.ORANGE, width: 4, height: 1, value: 0, matrix: [[1, 1, 1, 1]] },
  'cabbage': { id: 'cabbage', name: 'Cabbage', color: TileColor.ORANGE, width: 2, height: 2, value: 0, matrix: [[1,1],[1,1]] },
  'onions': { id: 'onions', name: 'Onions', color: TileColor.ORANGE, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'potatoes': { id: 'potatoes', name: 'Potatoes', color: TileColor.ORANGE, width: 2, height: 2, value: 0, matrix: [[1, 1], [1, 1]] },
  
  // Red (Food)
  'meat': { id: 'meat', name: 'Meat', color: TileColor.RED, width: 2, height: 1, value: 0, matrix: [[1, 1]] }, 
  'milk': { id: 'milk', name: 'Milk', color: TileColor.RED, width: 3, height: 1, value: 0, matrix: [[1, 1, 1]] },
  'mead': { id: 'mead', name: 'Mead', color: TileColor.RED, width: 1, height: 1, value: 0, matrix: [[1]] },
  'eggs': { id: 'eggs', name: 'Eggs', color: TileColor.RED, width: 1, height: 1, value: 0, matrix: [[1]] },
  'salt_meat': { id: 'salt_meat', name: 'Salt Meat', color: TileColor.RED, width: 4, height: 1, value: 0, matrix: [[1, 1, 1, 1]] },

  // Green (Goods)
  'oil': { id: 'oil', name: 'Oil', color: TileColor.GREEN, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'hide': { id: 'hide', name: 'Hide', color: TileColor.GREEN, width: 2, height: 2, value: 0, matrix: [[1, 1], [1, 1]] },
  'wool': { id: 'wool', name: 'Wool', color: TileColor.GREEN, width: 3, height: 2, value: 0, matrix: [[1, 1, 1], [1, 1, 1]] },
  'linen': { id: 'linen', name: 'Linen', color: TileColor.GREEN, width: 4, height: 2, value: 0, matrix: [[1,1,1,1],[1,1,1,1]] },
  'pelt': { id: 'pelt', name: 'Pelt', color: TileColor.GREEN, width: 3, height: 1, value: 0, matrix: [[1, 1, 1]] },

  // Blue (Luxury)
  'silk': { id: 'silk', name: 'Silk', color: TileColor.BLUE, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'spices': { id: 'spices', name: 'Spices', color: TileColor.BLUE, width: 2, height: 2, value: 0, matrix: [[1, 1], [1, 1]] },
  'jewelry': { id: 'jewelry', name: 'Jewelry', color: TileColor.BLUE, width: 3, height: 2, value: 0, matrix: [[1, 1, 1], [1, 1, 1]] },
  'chest': { id: 'chest', name: 'Chest', color: TileColor.BLUE, width: 4, height: 2, value: 0, matrix: [[1,1,1,1],[1,1,1,1]] },
  'silver_hoard': { id: 'silver_hoard', name: 'Silver Hoard', color: TileColor.BLUE, width: 3, height: 3, value: 0, matrix: [[1,1,1],[1,1,1],[1,1,1]] },
  'glass': { id: 'glass', name: 'Glass', color: TileColor.BLUE, width: 1, height: 2, value: 0, matrix: [[1],[1]] },

  // Special
  'rune': { id: 'rune', name: 'Rune', color: TileColor.SPECIAL, width: 1, height: 1, value: 0, matrix: [[1]] },
  'ore_tile': { id: 'ore_tile', name: 'Ore', color: TileColor.SPECIAL, width: 1, height: 1, value: 0, matrix: [[1]] },
  'stone_tile': { id: 'stone_tile', name: 'Stone', color: TileColor.SPECIAL, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'longship': { id: 'longship', name: 'Longship', color: TileColor.SPECIAL, width: 5, height: 1, value: 0, matrix: [[1, 1, 1, 1, 1]] },
  'knarr': { id: 'knarr', name: 'Knarr', color: TileColor.SPECIAL, width: 3, height: 1, value: 0, matrix: [[1, 1, 1]] },
  
  // Animals
  'sheep': { id: 'sheep', name: 'Sheep', color: TileColor.SPECIAL, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'cow': { id: 'cow', name: 'Cow', color: TileColor.SPECIAL, width: 3, height: 2, value: 0, matrix: [[1, 1, 1], [1, 1, 1]] },
  'horse': { id: 'horse', name: 'Horse', color: TileColor.SPECIAL, width: 3, height: 2, value: 0, matrix: [[1, 1, 0], [0, 1, 1]] }, // L-shape approx

  // Buildings
  'shed': { id: 'shed', name: 'Shed', color: TileColor.BUILDING, width: 2, height: 1, value: 0, matrix: [[1, 1]] },
  'stone_house': { id: 'stone_house', name: 'Stone House', color: TileColor.BUILDING, width: 2, height: 2, value: 0, matrix: [[1, 1], [1, 1]] },
  'longhouse': { id: 'longhouse', name: 'Longhouse', color: TileColor.BUILDING, width: 3, height: 1, value: 0, matrix: [[1, 1, 1]] },
  'forest_hut': { id: 'forest_hut', name: 'Forest Hut', color: TileColor.BUILDING, width: 2, height: 2, value: 0, matrix: [[1, 0], [1, 1]] }, // L-shape (3)
  'wooden_house': { id: 'wooden_house', name: 'Wooden House', color: TileColor.BUILDING, width: 4, height: 1, value: 0, matrix: [[1, 1, 1, 1]] }, // I-shape (4)
};

export const ACTIONS: ActionSpace[] = [
  // 1 Viking
  { id: 'prod_wood', name: 'Lumberjack', vikingCost: 1, category: 'Production', description: 'Gain 1 Wood' },
  { id: 'gather_wood', name: 'Gather Wood', vikingCost: 1, category: 'Production', description: 'Gain 1 Wood' },
  { id: 'prod_stone', name: 'Quarry', vikingCost: 1, category: 'Production', description: 'Gain 1 Stone' },
  { id: 'fish', name: 'Fishing', vikingCost: 1, category: 'Production', description: 'Gain 1 Stockfish (Red)' },
  { id: 'produce_mead', name: 'Beehive', vikingCost: 1, category: 'Production', description: 'Gain 1 Mead (Red)' },
  { id: 'build_shed', name: 'Build Shed', vikingCost: 1, category: 'Production', description: 'Pay 1 Wood -> Gain Shed' },
  { id: 'weekly_market', name: 'Weekly Market', vikingCost: 1, category: 'Trade', description: 'Gain 1 Spice (Blue Tile)' },
  { id: 'sailors_guild', name: 'Sailor\'s Guild', vikingCost: 1, category: 'Production', description: 'Gain 1 Spear' },

  // 2 Vikings
  { id: 'craft_hide', name: 'Tanner', vikingCost: 2, category: 'Production', description: 'Gain 1 Hide (Green)' },
  { id: 'buy_sheep', name: 'Sheep Market', vikingCost: 2, category: 'Trade', description: 'Gain 1 Sheep' },
  { id: 'upgrade_1', name: 'Blacksmith', vikingCost: 2, category: 'Trade', description: 'Upgrade 1 Green -> Blue' },
  { id: 'mountain_strip', name: 'Mining', vikingCost: 2, category: 'Mountain', description: 'Gain 1 Ore + 1 Silver' },
  { id: 'store_ore', name: 'Store Ore', vikingCost: 2, category: 'Production', description: 'Gain 2 Ore' },
  { id: 'whaling', name: 'Whaling', vikingCost: 2, category: 'Production', description: 'Risk: Roll D8 (Requires Spear/Ship). Reward: Meat + Oil + Bone + Skin', 
    riskType: 'hunt', requiredWeapon: 'spear', rewards: { success: ['meat', 'oil', 'ore_tile', 'hide'], fail: ['wood'] } },
  { id: 'knarr', name: 'Build Knarr', vikingCost: 2, category: 'Production', description: 'Pay 2 Wood -> Gain Knarr' },
  { id: 'weapon_smith', name: 'Weaponsmith', vikingCost: 2, category: 'Production', description: 'Gain 1 Sword + 1 Spear' },
  { id: 'build_stone_house', name: 'Build Stone House', vikingCost: 2, category: 'Production', description: 'Pay 2 Stone -> Gain Stone House' },
  { id: 'build_longhouse', name: 'Build Longhouse', vikingCost: 2, category: 'Production', description: 'Pay 2 Wood -> Gain Longhouse' },
  { id: 'build_forest_hut', name: 'Build Forest Hut', vikingCost: 2, category: 'Production', description: 'Pay 2 Wood -> Gain Forest Hut' },

  // 3 Vikings
  { id: 'hunting_game', name: 'Hunting', vikingCost: 3, category: 'Production', description: 'Risk: Roll D8 (Requires Bow). Reward: Meat + Hide',
    riskType: 'hunt', requiredWeapon: 'bow', rewards: { success: ['meat', 'hide'], fail: ['wood'] } },
  { id: 'buy_chest', name: 'Overseas', vikingCost: 3, category: 'Trade', description: 'Pay 1 Silver -> Gain Chest (Blue)' },
  { id: 'craft_ship', name: 'Shipbuilding', vikingCost: 3, category: 'Production', description: 'Gain 1 Longship' },
  { id: 'explore_faroe', name: 'Explore Faroe', vikingCost: 3, category: 'Exploration', description: 'Unlock Faroe Islands Board' },
  { id: 'buy_cow', name: 'Cattle Market', vikingCost: 3, category: 'Trade', description: 'Gain 1 Cow' },
  { id: 'build_wooden_house', name: 'Build Wooden House', vikingCost: 3, category: 'Production', description: 'Pay 3 Wood -> Gain Wooden House' },

  // 4 Vikings
  { id: 'pillage', name: 'Pillaging', vikingCost: 4, category: 'Special', description: 'Risk: Roll D12 + Sword + Vikings. Reward: 2 Blue Tiles',
    riskType: 'raid', rewards: { success: ['silk', 'glass', 'stone_tile'] } }, // Simplified rewards
  { id: 'explore_iceland', name: 'Explore Iceland', vikingCost: 4, category: 'Exploration', description: 'Unlock Iceland Board' },
  { id: 'emigrate', name: 'Emigration', vikingCost: 4, category: 'Special', description: 'Pay Silver -> Remove points' }
];

export const INITIAL_RESOURCES: PlayerResources = {
  wood: 1,
  stone: 1,
  ore: 0,
  silver: 2,
  hacksilver: 0,
  mead: 0,
  rune: 0,
  oil: 0,
  bow: 1,
  snare: 0,
  spear: 0,
  longsword: 0
};