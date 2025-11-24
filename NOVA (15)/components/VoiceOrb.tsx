import React from 'react';
import { AppState } from '../types';

interface VoiceOrbProps {
  state: AppState;
  audioLevel: number; // 0 to 255
}

const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, audioLevel }) => {
  const isActive = state === AppState.SPEAKING || state === AppState.AUTHORIZED || state === AppState.CONNECTING;
  const isSpeaking = state === AppState.SPEAKING;
  
  // Audio reactivity
  const scale = 1 + (audioLevel / 200) * 0.4;
  const glow = 20 + (audioLevel / 2);
  
  const colorPrimary = state === AppState.LOCKED ? '#ef4444' : '#06b6d4'; // Red vs Cyan
  const colorSecondary = state === AppState.LOCKED ? '#7f1d1d' : '#8b5cf6'; // Dark Red vs Purple

  return (
    <div className="relative flex justify-center items-center w-80 h-80 perspective-2000">
      
      {/* 4D GYROSCOPE CONTAINER */}
      <div 
        className="relative w-48 h-48 transform-style-3d transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})` }}
      >
         {/* OUTER RING */}
         <div 
            className="absolute inset-0 rounded-full border-[1px] border-opacity-40 animate-[spin_8s_linear_infinite]"
            style={{ 
                borderColor: colorPrimary,
                boxShadow: `0 0 ${glow}px ${colorPrimary}`,
                transform: 'rotateX(60deg) rotateY(45deg)'
            }}
         ></div>

         {/* MIDDLE RING */}
         <div 
            className="absolute inset-2 rounded-full border-[2px] border-opacity-60 border-dashed animate-[spin_6s_linear_infinite_reverse]"
            style={{ 
                borderColor: colorSecondary,
                transform: 'rotateX(30deg) rotateY(-30deg)' 
            }}
         ></div>

         {/* INNER GYRO */}
         <div 
            className="absolute inset-8 rounded-full border-[4px] border-opacity-80 animate-[spin_4s_linear_infinite]"
            style={{ 
                borderColor: colorPrimary,
                transform: 'rotateY(90deg)' 
            }}
         ></div>

         {/* CORE SINGULARITY */}
         <div className="absolute inset-0 flex items-center justify-center">
             <div 
                className="w-16 h-16 rounded-full blur-sm transition-colors duration-300"
                style={{
                    background: `radial-gradient(circle, #fff 0%, ${colorPrimary} 60%, transparent 100%)`,
                    boxShadow: `0 0 ${glow * 2}px ${colorPrimary}`
                }}
             ></div>
             {/* CORE PARTICLES */}
             {isSpeaking && (
                 <div className="absolute w-24 h-24 rounded-full border border-white opacity-50 animate-ping"></div>
             )}
         </div>
      </div>

      {/* STATUS HUD TEXT */}
      <div className="absolute -bottom-10 flex flex-col items-center gap-1">
         <div className="font-orbitron font-bold tracking-[0.3em] text-sm text-cyan-200 neon-text">
            {state === AppState.LOCKED ? 'SYSTEM LOCKED' : 'NOVA :: ONLINE'}
         </div>
         <div className="flex gap-1">
             {[1,2,3,4,5].map(i => (
                 <div 
                    key={i} 
                    className="w-8 h-1 bg-cyan-900 rounded-full overflow-hidden"
                 >
                     <div 
                        className="h-full bg-cyan-400 transition-all duration-75"
                        style={{ width: isActive ? `${Math.random() * 100}%` : '0%' }}
                     ></div>
                 </div>
             ))}
         </div>
         <div className="text-[9px] font-mono text-cyan-500/60 mt-1">
            QUANTUM SYNC: {isActive ? 'STABLE' : 'OFFLINE'}
         </div>
      </div>
    </div>
  );
};

export default VoiceOrb;