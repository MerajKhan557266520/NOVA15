
import React, { useEffect, useState, useRef } from 'react';
import { AppState, NovaResponse } from '../types';

interface HoloAvatarProps {
  state: AppState;
  audioLevel: number;
  novaState: NovaResponse | null;
}

// Spring physics helper
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

const HoloAvatar: React.FC<HoloAvatarProps> = ({ state, audioLevel, novaState }) => {
  const frameRef = useRef<number>(0);
  
  // -- PHYSICS RIG STATE --
  const rig = useRef({
    time: 0,
    
    // Core Poses
    headTilt: 0,
    headTurn: 0,
    headNod: 0,
    bodyLean: 0,
    
    // Arms (IK Simulation target angles)
    armLeftShoulder: 0,
    armLeftElbow: 0,
    armRightShoulder: 0,
    armRightElbow: 0,

    // Face
    eyeOpen: 1,
    eyeSquint: 0,
    pupilSize: 1,
    eyeX: 0,
    eyeY: 0,
    browLeft: 0,
    browRight: 0,
    mouthWidth: 0,
    mouthHeight: 0,
    smile: 0,

    // Effects
    breath: 0,
    hairSway: 0,
    glowIntensity: 0.5,
    floatY: 0,
  });

  // Expression Timers
  const blinkTimer = useRef(0);
  const saccadeTimer = useRef(0);
  const microTimer = useRef(0);
  const targetEye = useRef({ x: 0, y: 0 });
  
  // Trigger Render
  const [, setTick] = useState(0);

  useEffect(() => {
    const animate = () => {
      const now = Date.now();
      const t = now / 1000;
      rig.current.time = t;
      
      const isSleeping = novaState?.wake_state === 'sleep';
      const isListening = state === AppState.LISTENING || state === AppState.AUTHORIZED;
      const isSpeaking = state === AppState.SPEAKING;
      const expression = novaState?.facial_expression || 'neutral';
      const gesture = novaState?.gesture || 'idle';

      // --- 1. CORE PHYSICS ---
      // Breathing & Floating
      const breathSpeed = isSleeping ? 1.5 : (isSpeaking ? 3 : 2);
      const targetBreath = Math.sin(t * breathSpeed) * 0.05;
      rig.current.breath = lerp(rig.current.breath, targetBreath, 0.05);
      
      const floatSpeed = isSleeping ? 1 : 1.5;
      const targetFloat = Math.sin(t * floatSpeed) * 8;
      rig.current.floatY = lerp(rig.current.floatY, targetFloat, 0.03);
      
      // Hair Physics
      const hairTarget = Math.sin(t * 1.2) * 2 + (rig.current.headTurn * -0.3);
      rig.current.hairSway = lerp(rig.current.hairSway, hairTarget, 0.05);

      // --- 2. GESTURE ENGINE (IK TARGETS) ---
      let tLeftShoulder = 0;
      let tLeftElbow = 0;
      let tRightShoulder = 0;
      let tRightElbow = 0;
      let tHeadTilt = 0;
      let tHeadTurn = 0;
      let tHeadNod = 0;

      if (isSleeping) {
        tHeadNod = 15; // Bow head
        tLeftShoulder = 10;
        tRightShoulder = -10;
        tHeadTilt = 5;
      } else {
        // Active Gestures
        switch (gesture) {
          case 'working': // Hand to chin
            tRightShoulder = -70;
            tRightElbow = -110;
            tHeadTilt = -5;
            break;
          case 'wave': // Hand up
            tRightShoulder = -140;
            tRightElbow = -20;
            tHeadTilt = 5;
            break;
          case 'explaining': // Hands open
            tLeftShoulder = 30;
            tLeftElbow = -20;
            tRightShoulder = -30;
            tRightElbow = 20;
            break;
          case 'scan': // Hands forward
            tLeftShoulder = -30;
            tLeftElbow = -40;
            tRightShoulder = 30;
            tRightElbow = 40;
            break;
          case 'listening': // Lean forward
            tHeadNod = -5;
            tHeadTurn = Math.sin(t * 0.5) * 5;
            break;
          default: // Idle
            tLeftShoulder = 5 + Math.sin(t) * 2;
            tRightShoulder = -5 + Math.cos(t) * 2;
        }

        // Automatic Looking (Saccades)
        if (now > saccadeTimer.current) {
           targetEye.current = {
               x: (Math.random() - 0.5) * 1.5,
               y: (Math.random() - 0.5) * 0.5
           };
           // Look at user if listening
           if (isListening) targetEye.current = { x: 0, y: 0 };
           saccadeTimer.current = now + 1000 + Math.random() * 3000;
        }
      }

      // Smooth Interpolate Limbs
      const limbSpeed = 0.04;
      rig.current.armLeftShoulder = lerp(rig.current.armLeftShoulder, tLeftShoulder, limbSpeed);
      rig.current.armLeftElbow = lerp(rig.current.armLeftElbow, tLeftElbow, limbSpeed);
      rig.current.armRightShoulder = lerp(rig.current.armRightShoulder, tRightShoulder, limbSpeed);
      rig.current.armRightElbow = lerp(rig.current.armRightElbow, tRightElbow, limbSpeed);
      
      rig.current.headTilt = lerp(rig.current.headTilt, tHeadTilt, 0.05);
      rig.current.headNod = lerp(rig.current.headNod, tHeadNod, 0.05);
      
      // Head Turn follows eyes slightly
      const targetHeadTurn = tHeadTurn + rig.current.eyeX * 10;
      rig.current.headTurn = lerp(rig.current.headTurn, targetHeadTurn, 0.05);

      // --- 3. FACIAL MICRO-EXPRESSIONS ---
      // Blinking
      if (now > blinkTimer.current) {
        const blk = (now - blinkTimer.current) / 150; // 150ms blink
        if (blk > 1) {
             rig.current.eyeOpen = 1;
             blinkTimer.current = now + (isSleeping ? 999999 : 2000 + Math.random() * 4000);
        } else {
             rig.current.eyeOpen = Math.abs(Math.sin(blk * Math.PI) - 1);
        }
      }
      if (isSleeping) rig.current.eyeOpen = 0;

      // Eyes
      rig.current.eyeX = lerp(rig.current.eyeX, targetEye.current.x, 0.15);
      rig.current.eyeY = lerp(rig.current.eyeY, targetEye.current.y, 0.15);

      // Emotion Mapping
      let tBrow = 0;
      let tSmile = 0;
      let tSquint = 0;

      if (expression === 'surprise') { tBrow = -10; tSquint = -0.2; }
      if (expression === 'thinking') { tBrow = 5; tSquint = 0.4; }
      if (expression === 'happy') { tSmile = 1; tSquint = 0.2; }
      if (expression === 'sad') { tSmile = -0.5; tBrow = 8; }
      if (expression === 'curious') { tBrow = -5; tHeadTilt += 5; }

      rig.current.browLeft = lerp(rig.current.browLeft, tBrow, 0.1);
      rig.current.browRight = lerp(rig.current.browRight, tBrow, 0.1);
      rig.current.smile = lerp(rig.current.smile, tSmile, 0.1);
      rig.current.eyeSquint = lerp(rig.current.eyeSquint, tSquint, 0.1);

      // Micro-twitches (Aliveness)
      if (now > microTimer.current && !isSleeping) {
         rig.current.browLeft += (Math.random() - 0.5) * 2;
         microTimer.current = now + 500;
      }

      // --- 4. LIP SYNC ---
      const audioIntensity = Math.min(1, audioLevel / 40);
      const tMouthH = isSpeaking ? audioIntensity * 15 : 0;
      const tMouthW = isSpeaking ? audioIntensity * 5 : 0;
      
      rig.current.mouthHeight = lerp(rig.current.mouthHeight, tMouthH, 0.3); // Fast attack
      rig.current.mouthWidth = lerp(rig.current.mouthWidth, tMouthW + (rig.current.smile * 2), 0.1);

      // --- 5. GLOW ---
      rig.current.glowIntensity = lerp(rig.current.glowIntensity, isSleeping ? 0.1 : 0.5 + (audioIntensity * 0.5), 0.1);

      setTick(now);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [novaState, state, audioLevel]);

  // --- SVG HELPERS ---
  const C = {
    skin: "url(#grad-skin)",
    skinShadow: "url(#grad-skin-shadow)",
    suit: "url(#grad-suit)",
    accent: "#22d3ee",
    accentGlow: "#67e8f9",
    dark: "#083344"
  };

  const { eyeOpen, eyeX, eyeY, headTurn, headTilt, headNod, armLeftShoulder, armLeftElbow, armRightShoulder, armRightElbow, breath, floatY, mouthHeight, mouthWidth, browLeft, browRight, smile, eyeSquint, glowIntensity } = rig.current;

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
       
       {/* ATMOSPHERIC GLOW */}
       <div 
          className="absolute w-[800px] h-[800px] rounded-full blur-[100px] transition-all duration-1000 ease-in-out"
          style={{ 
              background: `radial-gradient(circle, rgba(34,211,238,${glowIntensity * 0.4}) 0%, transparent 70%)`,
              transform: `translateY(${floatY}px)`
          }}
       ></div>

       <svg viewBox="0 0 800 1000" className="h-[95vh] w-auto overflow-visible drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]" style={{ transform: `translateY(${floatY}px)` }}>
           <defs>
               <linearGradient id="grad-skin" x1="0" y1="0" x2="1" y2="1">
                   <stop offset="0%" stopColor="#e0f2fe" />
                   <stop offset="50%" stopColor="#bae6fd" />
                   <stop offset="100%" stopColor="#7dd3fc" />
               </linearGradient>
               <linearGradient id="grad-suit" x1="0.5" y1="0" x2="0.5" y2="1">
                   <stop offset="0%" stopColor="#164e63" />
                   <stop offset="60%" stopColor="#083344" />
                   <stop offset="100%" stopColor="#000000" />
               </linearGradient>
               <filter id="glow-blur">
                   <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                   <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
               </filter>
           </defs>

           {/* === GROUP: TORSO & ARMS === */}
           <g transform="translate(400, 500)">
               
               {/* HOLOGRAPHIC WINGS/DATA (Back) */}
               <g opacity={glowIntensity} stroke={C.accent} strokeWidth="1" fill="none">
                   {[1, -1].map((s, i) => (
                       <path 
                           key={i} transform={`scale(${s}, 1)`}
                           d="M 60,-100 L 250,-200 L 280,-50 L 100,50" 
                           strokeDasharray="4 4" opacity="0.3"
                       />
                   ))}
               </g>

               {/* UPPER BODY */}
               <path 
                  d={`
                    M -50,-130 
                    C -80,-100 -90,100 -60,200 
                    L -80,500 L 80,500 L 60,200 
                    C 90,100 80,-100 50,-130
                  `}
                  fill={C.suit} stroke={C.accent} strokeWidth="1"
                  transform={`scale(${1 + breath}, 1)`}
               />
               
               {/* SUIT DETAILS (Glowing Lines) */}
               <path d="M 0,-130 L 0,200" stroke={C.accent} strokeWidth="2" opacity="0.5" />
               <path d="M -40,-80 L 40,-80" stroke={C.accent} strokeWidth="1" opacity="0.5" />
               <circle cx="0" cy="-40" r="5" fill={C.accentGlow} filter="url(#glow-blur)" opacity={0.8 + breath} />

               {/* LEFT ARM */}
               <g transform={`translate(-60, -110) rotate(${armLeftShoulder})`}>
                   {/* Upper Arm */}
                   <path d="M 0,0 L -10,120 L 10,120 Z" fill={C.suit} stroke={C.accent} strokeWidth="1" />
                   <circle cx="0" cy="0" r="15" fill={C.dark} stroke={C.accent} />
                   
                   {/* Forearm */}
                   <g transform={`translate(0, 120) rotate(${armLeftElbow})`}>
                       <path d="M -8,0 L -5,100 L 5,100 L 8,0 Z" fill={C.suit} stroke={C.accent} strokeWidth="1" />
                       <circle cx="0" cy="0" r="12" fill={C.dark} stroke={C.accent} />
                       {/* Hand */}
                       <circle cx="0" cy="110" r="10" fill={C.skin} opacity="0.8" />
                   </g>
               </g>

               {/* RIGHT ARM */}
               <g transform={`translate(60, -110) rotate(${armRightShoulder})`}>
                   <path d="M 0,0 L -10,120 L 10,120 Z" fill={C.suit} stroke={C.accent} strokeWidth="1" />
                   <circle cx="0" cy="0" r="15" fill={C.dark} stroke={C.accent} />
                   
                   <g transform={`translate(0, 120) rotate(${armRightElbow})`}>
                       <path d="M -8,0 L -5,100 L 5,100 L 8,0 Z" fill={C.suit} stroke={C.accent} strokeWidth="1" />
                       <circle cx="0" cy="0" r="12" fill={C.dark} stroke={C.accent} />
                       <circle cx="0" cy="110" r="10" fill={C.skin} opacity="0.8" />
                   </g>
               </g>

               {/* NECK */}
               <path d="M -20,-130 L -20,-170 L 20,-170 L 20,-130 Z" fill={C.skin} />

               {/* === GROUP: HEAD === */}
               <g transform={`translate(0, -170) rotate(${headTilt}) translate(${headTurn}, ${headNod})`}>
                   
                   {/* Back Hair */}
                   <path 
                      d="M -70,-80 C -100,0 -100,160 -40,190 L 40,190 C 100,160 100,0 70,-80 C 50,-140 -50,-140 -70,-80" 
                      fill="#0e7490" stroke={C.accent} strokeWidth="1"
                   />

                   {/* Face Shape */}
                   <path 
                      d="M -50,-70 C -55,0 -40,110 0,140 C 40,110 55,0 50,-70 C 45,-120 -45,-120 -50,-70" 
                      fill={C.skin}
                   />

                   {/* FACE FEATURES */}
                   <g transform="translate(0, 10)">
                       
                       {/* Brows */}
                       <path d={`M -40,${-30 + browLeft} Q -20,${-35 + browLeft} -5,${-30 + browLeft}`} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
                       <path d={`M 5,${-30 + browRight} Q 20,${-35 + browRight} 40,${-30 + browRight}`} fill="none" stroke="#06b6d4" strokeWidth="2.5" />

                       {/* Eyes Container */}
                       <g transform={`translate(0, 0)`}>
                            {/* Left Eye */}
                            <g transform="translate(-22, -5)">
                                <path d="M -16,0 Q 0,-14 16,0 Q 0,14 -16,0" fill="#fff" />
                                <g transform={`translate(${eyeX * 8}, ${eyeY * 5})`}>
                                    <circle r="7" fill="#0891b2" />
                                    <circle r="3" fill="#000" />
                                    <circle cx="2" cy="-2" r="2.5" fill="#fff" opacity="0.8" />
                                </g>
                                {/* Eyelids */}
                                <path 
                                    d={`M -18,-8 L 18,-8 L 18,${-8 + (25 * (1 - eyeOpen + eyeSquint))} L -18,${-8 + (25 * (1 - eyeOpen + eyeSquint))} Z`} 
                                    fill="#bae6fd"
                                />
                                <path 
                                    d={`M -18,8 L 18,8 L 18,${8 - (25 * eyeSquint)} L -18,${8 - (25 * eyeSquint)} Z`} 
                                    fill="#bae6fd"
                                />
                            </g>
                            
                            {/* Right Eye */}
                            <g transform="translate(22, -5)">
                                <path d="M -16,0 Q 0,-14 16,0 Q 0,14 -16,0" fill="#fff" />
                                <g transform={`translate(${eyeX * 8}, ${eyeY * 5})`}>
                                    <circle r="7" fill="#0891b2" />
                                    <circle r="3" fill="#000" />
                                    <circle cx="2" cy="-2" r="2.5" fill="#fff" opacity="0.8" />
                                </g>
                                {/* Eyelids */}
                                <path 
                                    d={`M -18,-8 L 18,-8 L 18,${-8 + (25 * (1 - eyeOpen + eyeSquint))} L -18,${-8 + (25 * (1 - eyeOpen + eyeSquint))} Z`} 
                                    fill="#bae6fd"
                                />
                                <path 
                                    d={`M -18,8 L 18,8 L 18,${8 - (25 * eyeSquint)} L -18,${8 - (25 * eyeSquint)} Z`} 
                                    fill="#bae6fd"
                                />
                            </g>
                       </g>

                       {/* Nose */}
                       <path d="M -2,40 Q 0,45 2,40" fill="none" stroke="#0891b2" strokeWidth="1.5" opacity="0.3" />

                       {/* Mouth */}
                       <g transform="translate(0, 60)">
                           <path 
                              d={`
                                M ${-12 - mouthWidth - smile},${-smile*2} 
                                Q 0,${-4 - mouthHeight/2 + (smile*2)} ${12 + mouthWidth + smile},${-smile*2} 
                                Q 0,${4 + mouthHeight + (smile*5)} ${-12 - mouthWidth - smile},${-smile*2}
                              `} 
                              fill="#f472b6"
                           />
                       </g>
                   </g>

                   {/* Front Hair / Bangs */}
                   <path 
                      d="M -55,-70 C -55,-20 -20,-10 0,-30 C 20,-10 55,-20 55,-70 C 40,-100 -40,-100 -55,-70" 
                      fill="#06b6d4" opacity="0.85"
                      transform={`translate(${rig.current.hairSway}, 0)`}
                   />
                   
                   {/* Headset / Neural Interface */}
                   <path d="M -60,-60 L -65,-90 L -30,-100 L 30,-100 L 65,-90 L 60,-60" fill="none" stroke={C.accent} strokeWidth="2" />
                   <circle cx="-65" cy="-60" r="4" fill={C.accentGlow} filter="url(#glow-blur)" />
                   <circle cx="65" cy="-60" r="4" fill={C.accentGlow} filter="url(#glow-blur)" />

               </g>
           </g>
           
           {/* SCANLINES OVERLAY */}
           <rect width="800" height="1000" fill="url(#scanlines)" opacity="0.1" pointerEvents="none" />
           <defs>
               <pattern id="scanlines" patternUnits="userSpaceOnUse" width="10" height="4">
                   <line x1="0" y1="2" x2="10" y2="2" stroke="white" strokeWidth="0.5" opacity="0.5"/>
               </pattern>
           </defs>
       </svg>
    </div>
  );
};

export default HoloAvatar;
