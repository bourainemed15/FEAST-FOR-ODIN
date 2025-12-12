import React, { useState, useEffect } from 'react';
import { TileShape, TileColor } from '../types';
import { Utensils, XCircle, CheckCircle, Milk, Scissors } from 'lucide-react';
import { Tile } from './Tile';

interface FeastTableProps {
  currentRound: number;
  inventory: TileShape[];
  onFinishFeast: (consumedTilesIndices: number[]) => void;
  onHarvestAnimal: (type: 'milk' | 'meat', index: number) => void;
  requiredSize: number;
}

export const FeastTable: React.FC<FeastTableProps> = ({ currentRound, inventory, onFinishFeast, onHarvestAnimal, requiredSize = 12 }) => {
  // Feast Logic:
  // We have a track of length `requiredSize`.
  // Players select tiles from inventory.
  // Rules:
  // - Orange cannot touch Orange.
  // - Red cannot touch Red.
  // - Silver is wild? No, Silver/Hacksilver can be used but usually follows Red rules or fills gaps?
  // - In AFFO, Silver acts as a neutral filler or money.
  // - Here, we allow Orange and Red.
  // - Layout is horizontal.
  
  const [tableTiles, setTableTiles] = useState<{tile: TileShape, sourceIndex: number}[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Track milked cows this session to prevent infinite milking of the same cow
  const [milkedIndices, setMilkedIndices] = useState<Set<number>>(new Set());

  const calculateFilledWidth = () => {
    return tableTiles.reduce((acc, item) => acc + item.tile.width, 0); // Assuming horizontal placement (width)
  };

  const currentFill = calculateFilledWidth();
  const isFull = currentFill >= requiredSize;

  const handleInventoryClick = (tile: TileShape, idx: number) => {
    // Check if tile is food or silver
    if (![TileColor.ORANGE, TileColor.RED].includes(tile.color) && tile.id !== 'silver_coin') {
       setError("Only Food (Orange/Red) or Silver can be used!");
       setTimeout(() => setError(null), 2000);
       return;
    }

    // Check adjacency rules with the LAST tile on the table
    if (tableTiles.length > 0) {
        const last = tableTiles[tableTiles.length - 1];
        if (last.tile.color === TileColor.ORANGE && tile.color === TileColor.ORANGE) {
            setError("Orange cannot touch Orange!");
            setTimeout(() => setError(null), 2000);
            return;
        }
        if (last.tile.color === TileColor.RED && tile.color === TileColor.RED) {
             setError("Red cannot touch Red!");
             setTimeout(() => setError(null), 2000);
             return;
        }
    }

    setTableTiles([...tableTiles, { tile, sourceIndex: idx }]);
  };

  const handleTableClick = (idx: number) => {
    // Remove from table (must remove from end to keep logic simple, or any? If any, validation might break)
    // Let's only allow removing the last one for simplicity in validation
    if (idx === tableTiles.length - 1) {
        setTableTiles(prev => prev.slice(0, -1));
    } else {
        setError("Remove from the rightmost side first.");
        setTimeout(() => setError(null), 2000);
    }
  };

  const handleConfirm = () => {
    // Pass back the indices of inventory items to remove
    const indices = tableTiles.map(t => t.sourceIndex);
    onFinishFeast(indices);
  };

  const getFilteredInventory = () => {
    // Show all, but gray out used ones? 
    // Or filter out used indices.
    const usedIndices = new Set(tableTiles.map(t => t.sourceIndex));
    return inventory.map((t, i) => ({ t, i, isUsed: usedIndices.has(i) }));
  };

  const animals = inventory
    .map((t, i) => ({ t, i }))
    .filter(({t}) => ['sheep', 'cow', 'horse'].includes(t.id));

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[#f3e5ab] p-6 rounded-lg max-w-5xl w-full border-4 border-[#5c4033] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-4 border-b border-[#5c4033] pb-2">
            <div className="flex items-center gap-3 text-[#3f2e18]">
                <Utensils size={28} />
                <h2 className="text-2xl font-bold font-serif">Feast Phase: Round {currentRound}</h2>
            </div>
            <div className="text-sm font-bold bg-[#5c4033] text-[#f3e5ab] px-3 py-1 rounded">
                Required: {requiredSize} spaces
            </div>
        </div>
        
        {/* TOP ROW: INSTRUCTIONS & LIVESTOCK */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 text-[#3f2e18] text-sm bg-white/30 p-2 rounded">
                <p>Place Orange and Red tiles to fill the table. <br/>
                <strong>Rule:</strong> No two Orange tiles can touch. No two Red tiles can touch.</p>
            </div>

            {/* LIVESTOCK ACTIONS */}
            {animals.length > 0 && (
                <div className="bg-[#6b5134] p-2 rounded text-[#f3e5ab] border border-[#3f2e18] min-w-[300px]">
                    <h4 className="font-bold text-xs uppercase mb-2 border-b border-[#f3e5ab]/30 pb-1">Animal Husbandry</h4>
                    <div className="flex flex-col gap-2 max-h-[100px] overflow-y-auto">
                        {animals.map(({t, i}) => (
                            <div key={i} className="flex items-center justify-between bg-black/20 p-1 rounded text-xs">
                                <span className="font-bold ml-1">{t.name}</span>
                                <div className="flex gap-1">
                                    {t.id === 'cow' && !milkedIndices.has(i) && (
                                        <button 
                                            onClick={() => {
                                                setMilkedIndices(prev => new Set(prev).add(i));
                                                onHarvestAnimal('milk', i);
                                            }}
                                            className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-1"
                                            title="Produce Milk"
                                        >
                                            <Milk size={10} /> Milk
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => onHarvestAnimal('meat', i)}
                                        className="bg-red-800 text-white px-2 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                                        title="Slaughter for Meat"
                                    >
                                        <Scissors size={10} /> Meat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* TABLE TRACK */}
        <div className="bg-[#3b2f2f] p-4 rounded-lg shadow-inner mb-6 min-h-[80px] flex items-center gap-1 overflow-x-auto relative shrink-0">
             {/* Background slots */}
             <div className="absolute inset-0 flex items-center px-4 pointer-events-none opacity-20">
                 {Array.from({length: requiredSize}).map((_, i) => (
                     <div key={i} className="h-10 w-8 border-r border-white/30 last:border-0" style={{minWidth: '20px'}}></div>
                 ))}
             </div>

             {tableTiles.map((item, idx) => (
                 <div key={idx} onClick={() => handleTableClick(idx)} className="cursor-pointer hover:opacity-80 transition-opacity">
                     <Tile matrix={item.tile.matrix} color={item.tile.color} size={24} />
                 </div>
             ))}

             {currentFill < requiredSize && (
                 <div className="text-white/50 text-xs ml-2 italic">
                     Need {requiredSize - currentFill} more...
                 </div>
             )}
        </div>

        {error && (
             <div className="bg-red-500 text-white px-4 py-2 rounded mb-4 flex items-center gap-2 animate-bounce">
                 <XCircle size={18} /> {error}
             </div>
        )}

        {/* INVENTORY SELECTION */}
        <div className="flex-1 overflow-y-auto bg-[#eaddcf] p-4 rounded border border-[#c0b080]">
            <h3 className="font-bold text-[#5c4033] mb-2">Your Food Inventory</h3>
            <div className="flex flex-wrap gap-3">
                {getFilteredInventory().map(({t, i, isUsed}) => {
                    if (isUsed) return null;
                    const isFood = [TileColor.ORANGE, TileColor.RED].includes(t.color);
                    // Hide animals from this specific list to prevent confusion, they are handled in the husbandry section
                    if(['sheep', 'cow', 'horse'].includes(t.id)) return null;

                    return (
                        <div 
                            key={i} 
                            onClick={() => handleInventoryClick(t, i)}
                            className={`transition-all ${!isFood ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                        >
                            <Tile matrix={t.matrix} color={t.color} size={20} />
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 shrink-0">
            {!isFull && (
                <div className="flex items-center text-red-700 text-xs font-bold max-w-[200px] text-right">
                    Warning: Ending now will result in penalty tiles (-3 points each)!
                </div>
            )}
            <button 
                onClick={handleConfirm}
                className={`
                    flex items-center gap-2 py-3 px-8 rounded font-bold shadow-lg transition-all border-2
                    ${isFull 
                        ? 'bg-green-700 hover:bg-green-600 border-green-900 text-white' 
                        : 'bg-red-700 hover:bg-red-600 border-red-900 text-white'}
                `}
            >
                {isFull ? <CheckCircle /> : <XCircle />}
                {isFull ? "Complete Feast" : "End & Take Penalty"}
            </button>
        </div>
      </div>
    </div>
  );
};