import React, { useState } from 'react';
import { ActionSpace } from '../types';
import { User, Dices, Sword, Target, Anchor, Info } from 'lucide-react';
import { TILES } from '../constants';
import { Tile } from './Tile';

interface ActionBoardProps {
  actions: ActionSpace[];
  actionsTaken: { id: string; color: 'blue' | 'yellow' }[];
  onActionClick: (actionId: string) => void;
  availableVikings: number;
  activeColor: 'blue' | 'yellow';
}

export const ActionBoard: React.FC<ActionBoardProps> = ({ 
  actions, 
  actionsTaken, 
  onActionClick,
  availableVikings,
  activeColor 
}) => {
  const [hoveredAction, setHoveredAction] = useState<ActionSpace | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, action: ActionSpace) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Position slightly to the right of the button, aligned with top
    setTooltipPos({ x: rect.right + 10, y: rect.top });
    setHoveredAction(action);
  };

  const handleMouseLeave = () => {
    setHoveredAction(null);
  };
  
  const renderColumn = (cost: number) => {
    const columnActions = actions.filter(a => a.vikingCost === cost);
    
    return (
      <div className="flex flex-col gap-2 min-w-[140px]">
        <div className="text-center font-bold text-amber-200 border-b border-amber-500 pb-1 mb-2 font-serif">
          {cost} Viking{cost > 1 ? 's' : ''}
        </div>
        {columnActions.map(action => {
          // New logic: Filter all instances of this action
          const takenInstances = actionsTaken.filter(t => t.id === action.id);
          const takenCount = takenInstances.length;
          const isFull = takenCount >= 2;
          const isAffordable = availableVikings >= cost;
          
          return (
            <button
              key={action.id}
              disabled={isFull || !isAffordable}
              onClick={() => onActionClick(action.id)}
              onMouseEnter={(e) => handleMouseEnter(e, action)}
              onMouseLeave={handleMouseLeave}
              className={`
                relative p-3 rounded text-left border transition-all group
                ${isFull 
                  ? 'bg-slate-700 border-slate-600 opacity-80 cursor-not-allowed' 
                  : isAffordable 
                    ? 'bg-[#3b2f2f] border-amber-700 hover:bg-[#4a3b3b] hover:border-amber-500 cursor-pointer shadow-md' 
                    : 'bg-[#2a2222] border-[#3b2f2f] opacity-50 cursor-not-allowed'}
              `}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-amber-100 text-sm">{action.name}</span>
                {/* Info Icon hint */}
                <Info size={12} className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-[10px] text-amber-200/70 leading-tight line-clamp-2">
                {action.description}
              </div>

              {takenCount > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded gap-1 pointer-events-none">
                  {takenInstances.map((instance, idx) => (
                      <User 
                        key={idx}
                        className={`${instance.color === 'blue' ? 'text-blue-500 fill-blue-500' : 'text-yellow-500 fill-yellow-500'} drop-shadow-md`} 
                        size={takenCount > 1 ? 20 : 32} 
                      />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="wood-texture p-4 rounded-lg shadow-2xl overflow-x-auto relative min-h-[500px]">
      <h3 className="text-amber-100 font-bold mb-4 flex items-center gap-2 font-serif text-lg">
        <User className={activeColor === 'blue' ? 'text-blue-400' : 'text-yellow-400'} />
        Action Board ({availableVikings} Vikings Left)
      </h3>
      <div className="flex gap-4">
        {renderColumn(1)}
        {renderColumn(2)}
        {renderColumn(3)}
        {renderColumn(4)}
      </div>

      {/* Tooltip Portal (simulated via fixed positioning) */}
      {hoveredAction && (
        <div 
            className="fixed z-[100] w-64 bg-[#f3e5ab] border-2 border-[#5c4033] rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.6)] p-4 text-[#3f2e18] pointer-events-none animate-in fade-in duration-150"
            style={{ 
                top: Math.min(window.innerHeight - 300, Math.max(10, tooltipPos.y)), 
                left: Math.min(window.innerWidth - 270, tooltipPos.x) 
            }}
        >
            <div className="border-b border-[#5c4033]/30 pb-2 mb-2">
                <h4 className="font-serif font-bold text-lg leading-tight text-[#5c4033]">{hoveredAction.name}</h4>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] uppercase tracking-wider bg-[#5c4033] text-[#f3e5ab] px-1.5 py-0.5 rounded">
                        {hoveredAction.category}
                    </span>
                </div>
            </div>

            <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 font-bold text-[#5c4033]">
                    <User size={16} className="fill-[#5c4033]/20"/> 
                    Cost: {hoveredAction.vikingCost} Viking{hoveredAction.vikingCost > 1 ? 's' : ''}
                </div>
                
                {hoveredAction.requiredWeapon && (
                    <div className="flex items-center gap-2 text-red-800 font-bold bg-red-100/50 p-1 rounded px-2 border border-red-200">
                        {hoveredAction.requiredWeapon === 'bow' && <Target size={14}/>}
                        {hoveredAction.requiredWeapon === 'spear' && <Anchor size={14}/>}
                        {hoveredAction.requiredWeapon === 'longsword' && <Sword size={14}/>}
                        Requires: {hoveredAction.requiredWeapon.charAt(0).toUpperCase() + hoveredAction.requiredWeapon.slice(1)}
                    </div>
                )}

                <div className="italic opacity-90 text-[#3f2e18]">
                    {hoveredAction.description}
                </div>

                {hoveredAction.riskType ? (
                    <div className="bg-[#e6dcc0] p-2 rounded border border-[#c9bba0]">
                        <div className="flex items-center gap-1 font-bold text-xs uppercase mb-1 text-[#8b4513]">
                            <Dices size={14} /> Risk: {hoveredAction.riskType}
                        </div>
                        <div className="text-xs space-y-1 text-[#5c4033]">
                            <p>Roll <strong>D{hoveredAction.riskType === 'hunt' ? '8' : '12'}</strong>.</p>
                            <p>Success if Roll &le; Strength.</p>
                            {hoveredAction.rewards?.success && (
                                <div className="mt-2 pt-2 border-t border-black/10">
                                    <div className="font-bold text-green-800 mb-1">Success Rewards:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {hoveredAction.rewards.success.map(r => {
                                            const tile = TILES[r];
                                            return tile ? (
                                                <div key={r} className="flex flex-col items-center p-1 bg-white/40 rounded border border-white/50">
                                                    <Tile matrix={tile.matrix} color={tile.color} size={8} />
                                                    <span className="text-[9px] font-bold mt-1 text-[#3f2e18]">{tile.name}</span>
                                                </div>
                                            ) : (
                                                <span key={r} className="text-xs capitalize bg-white/40 px-1 py-0.5 rounded border border-white/50">{r}</span>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {hoveredAction.rewards?.fail && (
                                <div className="mt-1">
                                    <div className="font-bold text-red-800">Fail Rewards:</div>
                                    <div className="flex gap-1">
                                         {hoveredAction.rewards.fail.map(r => (
                                             <span key={r} className="text-xs capitalize bg-red-100/50 px-1 rounded">{r}</span>
                                         ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                   /* Non-risk rewards display if array exists */
                   hoveredAction.rewards?.success && (
                        <div className="bg-green-900/10 p-2 rounded border border-green-900/20">
                            <span className="font-bold text-green-900 text-xs mb-1">Rewards:</span>
                            <div className="flex flex-wrap gap-2">
                                {hoveredAction.rewards.success.map(r => {
                                    const tile = TILES[r];
                                    return tile ? (
                                        <div key={r} className="flex flex-col items-center p-1 bg-white/50 rounded border border-white/20">
                                            <Tile matrix={tile.matrix} color={tile.color} size={8} />
                                            <span className="text-[9px] font-bold mt-1">{tile.name}</span>
                                        </div>
                                    ) : (
                                        <span key={r} className="text-xs capitalize">{r}</span>
                                    );
                                })}
                            </div>
                        </div>
                   )
                )}
            </div>
        </div>
      )}
    </div>
  );
};
