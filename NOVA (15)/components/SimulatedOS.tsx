import React, { useEffect, useState } from 'react';
import { OSView, SystemStats } from '../types';

interface SimulatedOSProps {
  currentView: OSView;
  systemStats: SystemStats;
  isAuthorized: boolean;
}

const SimulatedOS: React.FC<SimulatedOSProps> = ({ isAuthorized }) => {
  const [hexGrid, setHexGrid] = useState<string[]>(Array(24).fill('0'));
  
  useEffect(() => {
    const i = setInterval(() => {
        setHexGrid(prev => prev.map(() => Math.random() > 0.5 ? '1' : '0'));
    }, 100);
    return () => clearInterval(i);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-black/80 rounded-lg border border-red-900/50">
        <div className="text-red-600 font-orbitron text-4xl animate-pulse tracking-widest">LOCKED</div>
        <div className="text-red-900/50 text-[10px] font-mono mt-2 absolute bottom-4">WAITING FOR BIOMETRIC VOICE KEY</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] rounded-lg overflow-hidden relative flex flex-col">
      {/* HUD HEADER */}
      <div className="h-8 border-b border-cyan-900/30 flex justify-between items-center px-4 bg-cyan-900/10">
          <div className="text-[10px] font-mono text-cyan-400">SAT-LINK: <span className="text-green-400">ACTIVE</span></div>
          <div className="text-[10px] font-mono text-cyan-600">LATENCY: 0.004ms</div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-1 p-1">
          
          {/* LEFT: DATA STREAM */}
          <div className="col-span-1 bg-cyan-900/5 border border-cyan-900/20 p-2 relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 pointer-events-none text-[8px] font-mono text-green-500 leading-none break-all p-1">
                {Array(500).fill(0).map((_, i) => (
                    <span key={i} style={{opacity: Math.random()}}>{Math.random() > 0.5 ? '1' : '0'}</span>
                ))}
             </div>
             <div className="relative z-10 flex flex-col h-full justify-end">
                <div className="text-xs font-bold text-cyan-300 bg-black/50 w-fit px-1 mb-1">DATA MINER</div>
                <div className="h-1 w-full bg-cyan-900">
                    <div className="h-full bg-cyan-400 animate-[width_2s_ease-in-out_infinite]" style={{width: '60%'}}></div>
                </div>
             </div>
          </div>

          {/* CENTER: WORLD MAP VISUALIZATION */}
          <div className="col-span-2 bg-black border border-cyan-900/20 relative flex items-center justify-center">
             <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 gap-[1px] opacity-20">
                {hexGrid.map((val, i) => (
                    <div key={i} className={`bg-cyan-500 transition-opacity duration-300 ${val === '1' ? 'opacity-40' : 'opacity-10'}`}></div>
                ))}
             </div>
             <div className="relative z-10 w-32 h-32 rounded-full border border-cyan-500/30 flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <div className="w-24 h-24 border border-cyan-500/50 rotate-45"></div>
                <div className="absolute w-2 h-2 bg-red-500 rounded-full top-0 animate-ping"></div>
             </div>
             <div className="absolute bottom-2 right-2 text-right">
                <div className="text-[8px] text-cyan-600 font-mono">GLOBAL MONITORING</div>
                <div className="text-xs text-white font-orbitron">ALL SYSTEMS GO</div>
             </div>
          </div>
      </div>

      {/* FOOTER */}
      <div className="h-6 bg-black border-t border-cyan-900/30 flex items-center justify-between px-2">
         <div className="flex gap-1">
             <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
             <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
             <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
         </div>
         <div className="text-[8px] text-cyan-700 tracking-[0.2em]">NOVA OS v95.0.1</div>
      </div>
    </div>
  );
};

export default SimulatedOS;