import React from 'react';
import { TileShape } from '../types';
import { Tile } from './Tile';
import { Info } from 'lucide-react';

interface AnimalPenProps {
  inventory: TileShape[];
}

export const AnimalPen: React.FC<AnimalPenProps> = ({ inventory }) => {
  // Filter animals from inventory
  const animals = inventory.filter(t => ['sheep', 'cow', 'horse'].includes(t.id));
  const sheep = animals.filter(a => a.id === 'sheep');
  const cows = animals.filter(a => a.id === 'cow');
  const horses = animals.filter(a => a.id === 'horse');

  return (
    <div className="w-full max-w-2xl bg-[#5c4033] p-1 rounded-lg shadow-xl relative overflow-hidden border-2 border-[#3f2e18]">
        {/* Header */}
        <div className="bg-[#3f2e18] px-3 py-2 flex justify-between items-center rounded-t-sm shadow-sm relative z-10">
             <h3 className="text-[#f3e5ab] font-bold font-serif text-lg flex items-center gap-2">
                 <span className="text-2xl">🛖</span> Animal Pen
             </h3>
             <div className="text-[10px] uppercase font-bold text-[#f3e5ab]/70 flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                <Info size={12} />
                Breeds during Feast
             </div>
        </div>

        {/* Content Area */}
        <div className="bg-[#e6dcc0] p-4 rounded-b-sm border-t border-[#8b4513]/50 relative min-h-[120px]">
            
            {/* Background Texture Effect */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-900/20 to-transparent pointer-events-none"></div>

            {animals.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#8b4513]/40 text-sm italic font-serif py-4 border-2 border-dashed border-[#8b4513]/20 rounded">
                    <p className="font-bold">- Empty Pen -</p>
                    <p className="text-xs mt-1">Acquire livestock via Actions</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3 relative z-10">
                    <AnimalStall title="Sheep" animals={sheep} />
                    <AnimalStall title="Cows" animals={cows} />
                    <AnimalStall title="Horses" animals={horses} />
                </div>
            )}
        </div>
    </div>
  );
};

const AnimalStall = ({ title, animals }: { title: string, animals: TileShape[] }) => (
    <div className="bg-[#fff8e1]/60 p-2 rounded border border-[#8b4513]/20 flex flex-col items-center shadow-sm relative group overflow-hidden">
        {/* Stall Header */}
        <div className="w-full text-center border-b border-[#5c4033]/10 pb-1 mb-2">
            <span className="text-xs font-bold text-[#5c4033] uppercase tracking-wider">
                {title} <span className="bg-[#5c4033] text-[#f3e5ab] px-1.5 rounded-full text-[10px] ml-1">{animals.length}</span>
            </span>
        </div>
        
        {/* Animals Grid */}
        <div className="flex flex-wrap justify-center gap-1.5 min-h-[40px] w-full">
            {animals.map((anim, i) => (
                <div key={i} title={anim.name} className="relative transition-transform hover:scale-110 hover:z-10 cursor-help">
                    <Tile matrix={anim.matrix} color={anim.color} size={8} className="shadow-[1px_2px_4px_rgba(0,0,0,0.3)]" />
                </div>
            ))}
            {animals.length === 0 && (
                <span className="text-[10px] opacity-30 italic self-center my-auto text-[#5c4033]">None</span>
            )}
        </div>
        
        {/* Stall Decoration (Bottom Bar) */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8b4513]/10"></div>
    </div>
);
