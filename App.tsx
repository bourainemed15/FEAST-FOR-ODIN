import React, { useState, useEffect, useMemo } from 'react';
import { ACTIONS, BOARD_HEIGHT, BOARD_WIDTH, INITIAL_BOARD, INITIAL_RESOURCES, TILES, ISLAND_CONFIGS } from './constants';
import { GameState, TileShape, TileColor, PlacedTile, CellData, ResourceType, Island, WeaponType } from './types';
import { GridBoard } from './components/GridBoard';
import { ActionBoard } from './components/ActionBoard';
import { Tile } from './components/Tile';
import { FeastTable } from './components/FeastTable';
import { AnimalPen } from './components/AnimalPen';
import { canPlaceTile, calculateIncome, rotateMatrix, calculateScore, getSurroundedBonuses } from './utils';
import { RotateCw, AlertTriangle, Trophy, Coins, Hammer, Pickaxe, Trees, Map as MapIcon, Sword, Anchor, Target, Dices } from 'lucide-react';

const RoundProgress = ({ current, total, phase }: { current: number, total: number, phase: string }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">Round {current}</span>
        <span className="text-[10px] font-bold text-amber-100/50 uppercase border border-amber-100/20 px-1 rounded tracking-wider">{phase} Phase</span>
    </div>
    <div className="flex gap-1 items-center">
      {Array.from({ length: total }).map((_, i) => {
        const roundNum = i + 1;
        const isCompleted = roundNum < current;
        const isCurrent = roundNum === current;
        return (
          <div 
            key={i}
            className={`
              h-2 w-8 rounded-sm transition-all border border-black/30
              ${isCompleted ? 'bg-amber-600' : ''}
              ${isCurrent ? 'bg-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)] border-amber-100' : ''}
              ${!isCompleted && !isCurrent ? 'bg-white/10' : ''}
            `}
            title={`Round ${roundNum}`}
          />
        );
      })}
    </div>
  </div>
);

// Dice Modal Component for Hunting/Raiding
const DiceModal = ({ 
    isOpen, 
    actionName, 
    type, 
    resources, 
    vikings,
    requiredWeapon,
    onConfirm, 
    onCancel 
}: { 
    isOpen: boolean; 
    actionName: string; 
    type: 'hunt' | 'raid'; 
    resources: any;
    vikings: number;
    requiredWeapon?: WeaponType;
    onConfirm: (roll: number, weaponUsed: number, modifierUsed: number) => void; 
    onCancel: () => void; 
}) => {
    const [step, setStep] = useState<'roll' | 'modify'>('roll');
    const [roll, setRoll] = useState(0);
    const [displayRoll, setDisplayRoll] = useState(0);
    const [isRolling, setIsRolling] = useState(false);
    const [weaponInput, setWeaponInput] = useState(0);
    const [modifierInput, setModifierInput] = useState(0);

    const dieSize = type === 'hunt' ? 8 : 12;
    // Determine specific weapon available based on action requirement
    const weaponKey = requiredWeapon || (type === 'hunt' ? 'bow' : 'longsword'); 
    const availableWeapon = resources[weaponKey] || 0;
    
    // Determine modifier resource (Wood for Hunt, Stone for Raid)
    const modifierKey = type === 'hunt' ? 'wood' : 'stone';
    const availableModifier = resources[modifierKey] || 0;
    
    // Reset on open
    useEffect(() => {
        if(isOpen) {
            setStep('roll');
            setRoll(0);
            setDisplayRoll(0);
            setWeaponInput(0);
            setModifierInput(0);
            setIsRolling(false);
        }
    }, [isOpen]);

    const handleRoll = () => {
        setIsRolling(true);
        let count = 0;
        const interval = setInterval(() => {
            setDisplayRoll(Math.floor(Math.random() * dieSize) + 1);
            count++;
            if (count > 8) {
                clearInterval(interval);
                const r = Math.floor(Math.random() * dieSize) + 1;
                setRoll(r);
                setDisplayRoll(r);
                setIsRolling(false);
                setStep('modify');
            }
        }, 80);
    };

    const handleSubmit = () => {
        onConfirm(roll, weaponInput, modifierInput);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f3e5ab] border-4 border-[#5c4033] rounded-lg p-6 max-w-md w-full shadow-2xl relative">
                <h2 className="text-2xl font-serif font-bold text-[#5c4033] mb-4 flex items-center gap-2">
                    <Dices size={24} /> {actionName}
                </h2>

                {step === 'roll' ? (
                    <div className="text-center py-8">
                        <p className="mb-6 text-[#3f2e18]">Roll the D{dieSize} to determine success.</p>
                        {isRolling ? (
                             <div className="text-6xl font-bold text-[#5c4033] animate-pulse">{displayRoll}</div>
                        ) : (
                            <button onClick={handleRoll} className="bg-[#5c4033] text-[#f3e5ab] px-8 py-3 rounded text-xl font-bold hover:scale-105 transition-transform shadow-lg">
                                ROLL D{dieSize}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <span className="text-sm text-gray-500 uppercase">You Rolled</span>
                            <div className="text-5xl font-bold text-[#5c4033]">{roll}</div>
                        </div>

                        <div className="bg-black/10 p-3 rounded space-y-3">
                            <h4 className="font-bold text-sm mb-2 text-[#5c4033]">Modify Result</h4>
                            
                            <div className="flex justify-between items-center">
                                <span className="capitalize flex items-center gap-1">
                                    {weaponKey === 'bow' && <Target size={14}/>}
                                    {weaponKey === 'spear' && <Anchor size={14}/>}
                                    {weaponKey === 'longsword' && <Sword size={14}/>}
                                    Use {weaponKey} (Max {availableWeapon}):
                                </span>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max={availableWeapon} 
                                    value={weaponInput} 
                                    onChange={(e) => setWeaponInput(Math.min(availableWeapon, Math.max(0, parseInt(e.target.value) || 0)))}
                                    className="w-16 p-1 rounded border border-[#5c4033] text-right font-bold"
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="capitalize flex items-center gap-1">
                                    {modifierKey === 'wood' && <Trees size={14}/>}
                                    {modifierKey === 'stone' && <Hammer size={14}/>}
                                    Use {modifierKey} (Max {availableModifier}):
                                </span>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max={availableModifier} 
                                    value={modifierInput} 
                                    onChange={(e) => setModifierInput(Math.min(availableModifier, Math.max(0, parseInt(e.target.value) || 0)))}
                                    className="w-16 p-1 rounded border border-[#5c4033] text-right font-bold"
                                />
                            </div>
                        </div>
                        
                        <div className="text-center bg-white/20 p-2 rounded">
                             <div className="text-xs uppercase text-gray-600 font-bold mb-1">Success Check</div>
                             <div className="flex items-center justify-center gap-2 text-lg">
                                 <span className="font-bold">{roll}</span>
                                 <span>&le;</span>
                                 <span className="font-bold">{(type === 'raid' ? vikings : 0) + weaponInput + modifierInput}</span>
                                 <span className="text-sm text-gray-500">(Power)</span>
                             </div>
                             <div className={`text-sm font-bold mt-1 ${roll <= (type === 'raid' ? vikings : 0) + weaponInput + modifierInput ? 'text-green-700' : 'text-red-700'}`}>
                                 {roll <= (type === 'raid' ? vikings : 0) + weaponInput + modifierInput ? 'SUCCESS!' : 'FAILURE'}
                             </div>
                        </div>

                        <div className="flex gap-2 justify-end mt-4">
                            <button onClick={onCancel} className="px-4 py-2 text-[#5c4033] hover:underline font-bold">Cancel</button>
                            <button onClick={handleSubmit} className="bg-[#5c4033] text-[#f3e5ab] px-6 py-2 rounded font-bold shadow-md hover:bg-[#3f2e18]">Confirm Result</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Game Component
const App = () => {
  // --- STATE ---
  const [gameState, setGameState] = useState<GameState>({
    round: 1,
    activeColor: 'blue',
    resources: { ...INITIAL_RESOURCES },
    inventory: [
      TILES['mead'], 
      TILES['beans'],
      TILES['peas'],
      TILES['flax'],
    ],
    placedTiles: [],
    islands: [], // Initially no islands
    actionsTaken: [],
    vikingsAvailable: 6,
    vikingsTotal: 6,
    phase: 'work',
    selectedTileId: null,
    feastFood: [],
    activeBoardId: 'home'
  });

  const [board, setBoard] = useState<CellData[][]>(INITIAL_BOARD);
  const [tileRotation, setTileRotation] = useState<0 | 90 | 180 | 270>(0);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Risk State
  const [activeRiskAction, setActiveRiskAction] = useState<{id: string, name: string, type: 'hunt' | 'raid'} | null>(null);

  // --- HELPERS ---

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const getTileById = (id: string): TileShape | undefined => {
    return gameState.inventory[parseInt(id)];
  };

  const selectedTile = gameState.selectedTileId !== null 
    ? gameState.inventory[parseInt(gameState.selectedTileId)] 
    : null;

  // --- ACTIONS ---

  const handleActionClick = (actionId: string) => {
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    // Check availability
    const takenCount = gameState.actionsTaken.filter(t => t.id === actionId).length;
    if (takenCount >= 2) { showNotification("Occupied (Max 2)!"); return; }
    
    if (gameState.vikingsAvailable < action.vikingCost) { showNotification("Not enough Vikings!"); return; }

    // Check Specific Requirement
    if (action.requiredWeapon) {
        // Check if player has at least 1, or can they use 0? Usually need 1 to start action? 
        // Rules say: "You need a ... card". So yes, > 0.
        const hasWeapon = gameState.resources[action.requiredWeapon] > 0;
        if (!hasWeapon) { showNotification(`Need ${action.requiredWeapon}!`); return; }
    }

    // Handle Risk Actions (Hunt/Raid)
    if (action.riskType) {
        setActiveRiskAction({ id: action.id, name: action.name, type: action.riskType });
        return;
    }

    // Execute Immediate Action
    executeAction(actionId, action.vikingCost);
  };

  const executeAction = (actionId: string, cost: number, riskResult?: {success: boolean, rewards: string[]}) => {
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    const newVikings = gameState.vikingsAvailable - cost;
    const newResources = { ...gameState.resources };
    const newInventory = [...gameState.inventory];
    let newIslands = [...gameState.islands];

    // Standard Effects
    switch (action.id) {
      case 'prod_wood': newResources.wood += 1; break;
      case 'gather_wood': newResources.wood += 1; break;
      case 'prod_stone': newResources.stone += 1; break;
      case 'fish': newInventory.push(TILES['meat']); break;
      case 'produce_mead': newInventory.push(TILES['mead']); break;
      
      case 'weekly_market': 
        newInventory.push(TILES['spices']); 
        showNotification("Visited Weekly Market: +1 Spice");
        break;

      case 'sailors_guild': newResources.spear += 1; break;
      case 'craft_hide': newInventory.push(TILES['hide']); break;
      case 'mountain_strip': newResources.ore += 1; newResources.silver += 1; break;
      
      case 'store_ore':
        newResources.ore += 2;
        showNotification("Stored 2 Ore");
        break;

      case 'weapon_smith': newResources.longsword += 1; newResources.spear += 1; break;
      
      case 'build_shed':
        if(newResources.wood >= 1) {
            newResources.wood -= 1;
            newInventory.push(TILES['shed']);
            showNotification("Built a Shed");
        } else {
            showNotification("Need 1 Wood!");
            return;
        }
        break;

      case 'build_stone_house':
        if(newResources.stone >= 2) {
            newResources.stone -= 2;
            newInventory.push(TILES['stone_house']);
            showNotification("Built a Stone House");
        } else {
            showNotification("Need 2 Stone!");
            return;
        }
        break;

      case 'build_longhouse':
        if(newResources.wood >= 2) {
            newResources.wood -= 2;
            newInventory.push(TILES['longhouse']);
            showNotification("Built a Longhouse");
        } else {
            showNotification("Need 2 Wood!");
            return;
        }
        break;

      case 'build_forest_hut':
        if(newResources.wood >= 2) {
            newResources.wood -= 2;
            newInventory.push(TILES['forest_hut']);
            showNotification("Built a Forest Hut");
        } else {
            showNotification("Need 2 Wood!");
            return;
        }
        break;
        
      case 'build_wooden_house':
        if(newResources.wood >= 3) {
            newResources.wood -= 3;
            newInventory.push(TILES['wooden_house']);
            showNotification("Built a Wooden House");
        } else {
            showNotification("Need 3 Wood!");
            return;
        }
        break;

      case 'knarr': 
        if(newResources.wood >= 2) { newResources.wood -= 2; newInventory.push(TILES['knarr']); }
        else { showNotification("Need 2 Wood!"); return; } 
        break;

      case 'craft_ship':
         newInventory.push(TILES['longship']);
         break;

      case 'upgrade_1':
         showNotification("Blacksmith: Upgraded Goods (Simulated)");
         newInventory.push(TILES['silk']); 
         break;
         
      case 'buy_sheep':
         newInventory.push(TILES['sheep']);
         showNotification("Acquired a Sheep");
         break;

      case 'buy_cow':
         newInventory.push(TILES['cow']);
         showNotification("Acquired a Cow");
         break;

      case 'buy_chest':
        if (newResources.silver >= 1) {
            newResources.silver -= 1;
            newInventory.push(TILES['chest']);
        } else {
            showNotification("Need 1 Silver!");
            return;
        }
        break;

      case 'explore_faroe':
         if (!newIslands.find(i => i.id === 'faroe')) {
             newIslands.push({ ...ISLAND_CONFIGS['faroe'], placedTiles: [], isUnlocked: true } as Island);
             showNotification("Discovered Faroe Islands!");
         }
         break;
      case 'explore_iceland':
         if (!newIslands.find(i => i.id === 'iceland')) {
             newIslands.push({ ...ISLAND_CONFIGS['iceland'], placedTiles: [], isUnlocked: true } as Island);
             showNotification("Discovered Iceland!");
         }
         break;
         
      case 'emigrate':
         showNotification("Emigrated!");
         break;
    }

    // Handle Risk Rewards
    if (riskResult) {
        if (riskResult.success) {
            // Get friendly names for notification
            const rewardNames = riskResult.rewards
                .map(id => TILES[id]?.name || id)
                .join(', ');
            
            showNotification(`Success! Gained: ${rewardNames}`);
            
            riskResult.rewards.forEach(rId => {
               if(TILES[rId]) newInventory.push(TILES[rId]);
            });
        } else {
            showNotification("Failed... consolation wood.");
            newResources.wood += 1;
        }
    }

    setGameState(prev => ({
      ...prev,
      vikingsAvailable: newVikings,
      actionsTaken: [...prev.actionsTaken, { id: actionId, color: prev.activeColor }],
      resources: newResources,
      inventory: newInventory,
      islands: newIslands,
      activeBoardId: (action.id.startsWith('explore_') && newIslands.length > 0) ? newIslands[newIslands.length-1].id : prev.activeBoardId
    }));
  };

  const handleDiceConfirm = (roll: number, weaponUsed: number, modifierUsed: number) => {
    if (!activeRiskAction) return;
    const action = ACTIONS.find(a => a.id === activeRiskAction.id);
    if (!action) return;

    // Determine Success
    // Pillaging (Raid) adds Vikings (vikingCost) to strength. Hunting does not.
    const baseStrength = activeRiskAction.type === 'raid' ? action.vikingCost : 0;
    const strength = baseStrength + weaponUsed + modifierUsed;
    const success = roll <= strength;

    // Deduct resources
    const newResources = { ...gameState.resources };
    
    // Deduct Weapon
    const weaponKey = action.requiredWeapon || (activeRiskAction.type === 'hunt' ? 'bow' : 'longsword');
    if (newResources[weaponKey] !== undefined) {
        newResources[weaponKey] = Math.max(0, newResources[weaponKey] - weaponUsed);
    }

    // Deduct Modifier (Wood for Hunt, Stone for Raid)
    const modifierKey = activeRiskAction.type === 'hunt' ? 'wood' : 'stone';
    if (newResources[modifierKey] !== undefined) {
        newResources[modifierKey] = Math.max(0, newResources[modifierKey] - modifierUsed);
    }

    setGameState(prev => ({...prev, resources: newResources}));

    executeAction(activeRiskAction.id, action.vikingCost, {
        success,
        rewards: success ? (action.rewards?.success || []) : (action.rewards?.fail || [])
    });
    setActiveRiskAction(null);
  };

  // Logic to handle animal processing during Feast
  const handleAnimalHarvest = (type: 'milk' | 'meat', index: number) => {
     setGameState(prev => {
        const newInv = [...prev.inventory];
        // If slaughter (meat), we remove the animal
        if (type === 'meat') {
            // Because indices shift, we must be careful. 
            // In a real app, IDs are safer. Here, we trust the index passed from the filtered view matches.
            // However, the FeastTable receives the full inventory list.
            newInv.splice(index, 1);
            newInv.push(TILES['meat']);
            showNotification("Animal Slaughtered for Meat");
        } 
        // If milking, we just add milk, do not remove animal
        else if (type === 'milk') {
            newInv.push(TILES['milk']);
            showNotification("Cow Milked");
        }
        return { ...prev, inventory: newInv };
     });
  };

  // --- BOARD INTERACTION ---

  const activeGrid = useMemo(() => {
     if (gameState.activeBoardId === 'home') return board;
     const island = gameState.islands.find(i => i.id === gameState.activeBoardId);
     return island ? island.grid : board;
  }, [gameState.activeBoardId, board, gameState.islands]);

  const activePlacedTiles = useMemo(() => {
     if (gameState.activeBoardId === 'home') return gameState.placedTiles;
     const island = gameState.islands.find(i => i.id === gameState.activeBoardId);
     return island ? island.placedTiles : [];
  }, [gameState.activeBoardId, gameState.placedTiles, gameState.islands]);

  const handleCellClick = (x: number, y: number) => {
    if (!selectedTile || gameState.selectedTileId === null) return;

    const rotatedMatrix = rotateMatrix(selectedTile.matrix, tileRotation);
    const check = canPlaceTile(activeGrid, activePlacedTiles, rotatedMatrix, x, y, selectedTile.color);

    if (check.valid) {
      const newPlacedTile: PlacedTile = {
        id: `${selectedTile.id}-${Date.now()}`,
        shapeId: selectedTile.id,
        x, y, rotation: tileRotation, color: selectedTile.color, matrix: rotatedMatrix
      };

      // Update appropriate board
      if (gameState.activeBoardId === 'home') {
          const newBoard = board.map(row => row.map(cell => ({ ...cell })));
          // Apply coverage logic
          for(let r=0; r<rotatedMatrix.length; r++){
            for(let c=0; c<rotatedMatrix[0].length; c++){
                if(rotatedMatrix[r][c] === 1) newBoard[y+r][x+c].isCovered = true;
            }
          }
          setBoard(newBoard);
          setGameState(prev => ({
              ...prev,
              placedTiles: [...prev.placedTiles, newPlacedTile],
              inventory: prev.inventory.filter((_, idx) => idx !== parseInt(prev.selectedTileId!)),
              selectedTileId: null
          }));
      } else {
          // Island update
          const islandIndex = gameState.islands.findIndex(i => i.id === gameState.activeBoardId);
          if (islandIndex === -1) return;

          const newIslands = [...gameState.islands];
          const island = newIslands[islandIndex];
          const newGrid = island.grid.map(row => row.map(c => ({...c})));
          
          for(let r=0; r<rotatedMatrix.length; r++){
            for(let c=0; c<rotatedMatrix[0].length; c++){
                if(rotatedMatrix[r][c] === 1) newGrid[y+r][x+c].isCovered = true;
            }
          }
          
          island.grid = newGrid;
          island.placedTiles = [...island.placedTiles, newPlacedTile];
          
          setGameState(prev => ({
              ...prev,
              islands: newIslands,
              inventory: prev.inventory.filter((_, idx) => idx !== parseInt(prev.selectedTileId!)),
              selectedTileId: null
          }));
      }
      setTileRotation(0);
    } else {
      showNotification(`Cannot place: ${check.reason}`);
    }
  };

  const handleRotation = () => {
    setTileRotation(prev => (prev + 90) % 360 as 0 | 90 | 180 | 270);
  };

  // --- GAME FLOW ---

  const startFeast = () => {
    setGameState(prev => ({ ...prev, phase: 'feast' }));
  };

  const handleFinishFeast = (consumedIndices: number[]) => {
    const sortedIndices = [...consumedIndices].sort((a, b) => b - a);
    let newInventory = [...gameState.inventory];
    sortedIndices.forEach(idx => newInventory.splice(idx, 1));
    
    // Calculate Bonuses for ALL boards
    const newResources = { ...gameState.resources };
    
    // Main Board
    const mainBonuses = getSurroundedBonuses(board);
    // Islands
    gameState.islands.forEach(island => {
        const islandBonuses = getSurroundedBonuses(island.grid);
        mainBonuses.push(...islandBonuses);
    });

    if (mainBonuses.length > 0) {
        mainBonuses.forEach(b => {
             if (b === 'wood') newResources.wood++;
             if (b === 'stone') newResources.stone++;
             if (b === 'ore') newResources.ore++;
             if (b === 'silver') newResources.silver++;
             if (b === 'rune') newResources.rune++;
             if (b === 'mead') newResources.mead++;
        });
        showNotification(`Bonuses: ${mainBonuses.length} collected`);
    }

    // Income
    let totalIncome = calculateIncome(board);
    gameState.islands.forEach(island => {
        // Island income calc is same logic, usually starts higher
        // We use the helper but need to account for start offset
        // Simplified: helper calculates uncovered 'income' icons.
        // For islands, income logic is usually "lowest uncovered number". 
        // Our 'createGrid' put 'income' icons in diagonal, so helper works.
        totalIncome += calculateIncome(island.grid); // + island.incomeStart logic handled by grid placement
    });
    newResources.silver += totalIncome;

    // Breeding Check
    const animalCounts: Record<string, number> = { sheep: 0, cow: 0, horse: 0 };
    newInventory.forEach(t => {
      if(animalCounts[t.id] !== undefined) animalCounts[t.id]++;
    });

    // Simple Breeding: Pair = Baby
    const bredAnimals = [];
    if (animalCounts.sheep >= 2) { newInventory.push(TILES['sheep']); bredAnimals.push("Sheep"); }
    if (animalCounts.cow >= 2) { newInventory.push(TILES['cow']); bredAnimals.push("Cow"); }
    if (animalCounts.horse >= 2) { newInventory.push(TILES['horse']); bredAnimals.push("Horse"); }
    
    if (bredAnimals.length > 0) {
        showNotification(`Breeding: ${bredAnimals.join(", ")} born!`);
    }

    // Clean up
    let nextRound = gameState.round + 1;
    let nextColor: 'blue' | 'yellow' = gameState.activeColor === 'blue' ? 'yellow' : 'blue';
    const currentRoundColor = gameState.activeColor;
    const nextActionsTaken = gameState.actionsTaken.filter(a => a.color === currentRoundColor);
    
    if (nextRound > 7) {
        setGameState(prev => ({ ...prev, phase: 'gameover', resources: newResources, inventory: newInventory }));
        return;
    }

    setGameState(prev => ({
      ...prev,
      round: nextRound,
      phase: 'work',
      activeColor: nextColor,
      actionsTaken: nextActionsTaken,
      vikingsAvailable: prev.vikingsTotal + 1,
      vikingsTotal: Math.min(prev.vikingsTotal + 1, 12),
      resources: newResources,
      inventory: newInventory
    }));
  };

  // --- RENDER ---

  if (gameState.phase === 'gameover') {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-amber-100 flex-col gap-4">
            <Trophy size={64} className="text-yellow-500" />
            <h1 className="text-5xl font-serif">Game Over</h1>
            <p className="text-2xl">Final Score: {calculateScore(board)}</p>
        </div>
    );
  }

  // Get active risk action to pass details to modal
  const activeRiskActionDef = activeRiskAction ? ACTIONS.find(a => a.id === activeRiskAction.id) : undefined;

  return (
    <div className="min-h-screen bg-slate-800 text-slate-100 font-sans pb-20">
      {/* HEADER */}
      <header className="bg-[#3b2f2f] border-b-4 border-[#5c4033] p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-lg sticky top-0 z-40 transition-all">
        <div className="flex items-center gap-4 w-full md:w-auto">
           <div className="flex flex-col">
               <h1 className="text-xl md:text-2xl font-bold text-amber-100 font-serif tracking-widest leading-none">FEAST FOR ODIN</h1>
               <RoundProgress current={gameState.round} total={7} phase={gameState.phase} />
           </div>
        </div>
        
        <div className="flex gap-2 md:gap-4 items-center text-sm font-bold text-amber-100/80 bg-black/20 p-2 rounded-full px-4 border border-white/5">
            <div className="flex items-center gap-2" title="Silver"><Coins size={16} className="text-gray-300"/> {gameState.resources.silver}</div>
            <div className="w-px h-4 bg-white/10"></div>
            <div className="flex items-center gap-2" title="Wood"><Trees size={16} className="text-amber-700" /> {gameState.resources.wood}</div>
            <div className="flex items-center gap-2" title="Ore"><Pickaxe size={16} className="text-slate-400" /> {gameState.resources.ore}</div>
            <div className="flex items-center gap-2" title="Stone"><Hammer size={16} className="text-gray-500" /> {gameState.resources.stone}</div>
            <div className="w-px h-4 bg-white/10"></div>
            {/* WEAPONS */}
            <div className="flex items-center gap-2 text-red-300" title="Weapons">
                <Target size={16} /> {gameState.resources.bow}
                <Sword size={16} /> {gameState.resources.longsword}
                <Anchor size={16} /> {gameState.resources.spear}
            </div>
        </div>

        <button 
          onClick={startFeast}
          disabled={gameState.vikingsAvailable > 0}
          className={`px-6 py-2 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 border-2 ${gameState.vikingsAvailable === 0 ? 'bg-green-700 hover:bg-green-600 border-green-500 text-white animate-pulse' : 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'}`}
        >
          {gameState.vikingsAvailable > 0 ? (
             <><span className="bg-amber-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">{gameState.vikingsAvailable}</span> Work</>
          ) : (
             <>Feast</>
          )}
        </button>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 flex flex-col lg:flex-row gap-8 justify-center">
        
        {/* LEFT: ACTIONS & INVENTORY */}
        <div className="flex-1 max-w-2xl flex flex-col gap-6">
            <ActionBoard 
              actions={ACTIONS} 
              actionsTaken={gameState.actionsTaken} 
              onActionClick={handleActionClick} 
              availableVikings={gameState.vikingsAvailable}
              activeColor={gameState.activeColor}
            />

            {/* INVENTORY */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 min-h-[200px]">
                <h3 className="text-amber-100 font-bold mb-3">General Inventory</h3>
                <div className="flex flex-wrap gap-4">
                    {gameState.inventory.map((tile, idx) => {
                        // Skip displaying animals in main inventory to avoid duplication visual
                        if (['sheep', 'cow', 'horse'].includes(tile.id)) return null;
                        
                        return (
                            <Tile 
                              key={`${tile.id}-${idx}`} matrix={tile.matrix} color={tile.color} 
                              isSelected={gameState.selectedTileId === idx.toString()}
                              onClick={() => setGameState(prev => ({...prev, selectedTileId: prev.selectedTileId === idx.toString() ? null : idx.toString()}))}
                            />
                        );
                    })}
                </div>
            </div>
        </div>

        {/* RIGHT: BOARD TABS & GRID */}
        <div className="flex flex-col items-center gap-4">
            
            <AnimalPen inventory={gameState.inventory} />

            {/* BOARD TABS */}
            <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg">
                <button 
                    onClick={() => setGameState(prev => ({...prev, activeBoardId: 'home'}))}
                    className={`px-4 py-2 rounded font-serif font-bold ${gameState.activeBoardId === 'home' ? 'bg-[#5c4033] text-amber-100' : 'text-slate-400 hover:text-white'}`}
                >
                    Home Board
                </button>
                {gameState.islands.map(island => (
                    <button 
                        key={island.id}
                        onClick={() => setGameState(prev => ({...prev, activeBoardId: island.id}))}
                        className={`px-4 py-2 rounded font-serif font-bold flex items-center gap-2 ${gameState.activeBoardId === island.id ? 'bg-[#5c4033] text-amber-100' : 'text-slate-400 hover:text-white'}`}
                    >
                        <MapIcon size={14} /> {island.name}
                    </button>
                ))}
            </div>

            {/* ROTATE CONTROLS */}
            {gameState.selectedTileId && (
                <div className="flex gap-4 bg-slate-700 p-2 rounded-full shadow-xl animate-bounce">
                    <button onClick={handleRotation} className="p-2 hover:bg-slate-600 rounded-full"><RotateCw /></button>
                </div>
            )}
            
            <GridBoard 
                board={activeGrid} 
                placedTiles={activePlacedTiles} 
                onCellClick={handleCellClick}
                selectedTile={selectedTile}
                rotation={tileRotation}
            />
        </div>
      </main>

      {/* MODALS */}
      {gameState.phase === 'feast' && (
        <FeastTable 
            currentRound={gameState.round}
            inventory={gameState.inventory}
            onFinishFeast={handleFinishFeast}
            onHarvestAnimal={handleAnimalHarvest}
            requiredSize={12}
        />
      )}
      
      <DiceModal 
        isOpen={!!activeRiskAction}
        actionName={activeRiskAction?.name || ''}
        type={activeRiskAction?.type || 'hunt'}
        resources={gameState.resources}
        vikings={activeRiskActionDef?.vikingCost || 0}
        requiredWeapon={activeRiskActionDef?.requiredWeapon}
        onConfirm={handleDiceConfirm}
        onCancel={() => setActiveRiskAction(null)}
      />

      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full shadow-2xl z-50 flex items-center gap-2 font-bold animate-pulse">
            <AlertTriangle size={20} /> {notification}
        </div>
      )}
    </div>
  );
};

export default App;