import React, { useRef, useEffect, useState } from 'react';
import { MoonData } from '../types';
import { Sun } from 'lucide-react';

interface Props {
  angle: number;
  setAngle: (angle: number) => void;
}

const OrbitVisualizer: React.FC<Props> = ({ angle, setAngle }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Constants for the visualization
  const cx = 150; // Center X
  const cy = 150; // Center Y
  const orbitRadius = 100;

  // Calculate Moon Position
  // Angle 0 is Right (towards Sun in this viz), going counter-clockwise
  // Convert degrees to radians.
  // Note: In standard math, 0 is Right. 90 is Bottom (screen coords).
  // Let's adhere to: Sun is on the RIGHT.
  // New Moon (invisible) when Moon is between Earth and Sun (Right side).
  // Full Moon when Moon is opposite Sun (Left side).
  
  // SVG coordinate system:
  // x = cx + r * cos(theta)
  // y = cy + r * sin(theta)
  // We want 0 degrees to be at x=250 (Right). 
  const radian = (angle * Math.PI) / 180;
  const moonX = cx + orbitRadius * Math.cos(radian);
  const moonY = cy + orbitRadius * Math.sin(radian);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!isDragging || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const x = clientX - rect.left - cx;
    const y = clientY - rect.top - cy;
    
    // Calculate angle in degrees
    let newAngle = Math.atan2(y, x) * (180 / Math.PI);
    if (newAngle < 0) newAngle += 360;
    
    setAngle(newAngle);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Determine lighting on the moon in the orbit view
  // The side facing the sun (Right) is always lit.
  // We simulate this by rotating the moon graphic itself inside the SVG group?
  // Actually, simplifying: Just show a lit half and dark half on the moon circle that rotates to always face the sun.
  
  return (
    <div className="relative flex flex-col items-center select-none">
      <h3 className="text-xl font-bold mb-4 text-sky-300">宇宙から見た様子</h3>
      <div className="relative">
        <svg
          ref={svgRef}
          width="300"
          height="300"
          viewBox="0 0 300 300"
          className="cursor-pointer touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
        >
          {/* Orbit Path */}
          <circle cx={cx} cy={cy} r={orbitRadius} stroke="#334155" strokeWidth="2" fill="none" strokeDasharray="5,5" />

          {/* Earth */}
          <circle cx={cx} cy={cy} r="30" fill="#3b82f6" />
          <text x={cx} y={cy} dy="5" textAnchor="middle" fill="white" fontSize="12" pointerEvents="none">地球</text>

          {/* Sun Direction Indicator */}
          <g transform="translate(260, 150)">
             <Sun size={32} color="#fbbf24" className="animate-pulse" />
             <text x="0" y="25" textAnchor="middle" fill="#fbbf24" fontSize="10">太陽</text>
          </g>
          <line x1="260" y1="150" x2="280" y2="150" stroke="#fbbf24" strokeWidth="2" />
          
          {/* Connecting Line */}
          <line x1={cx} y1={cy} x2={moonX} y2={moonY} stroke="#94a3b8" strokeWidth="1" opacity="0.5" />

          {/* Moon Group */}
          <g transform={`translate(${moonX}, ${moonY})`}>
             {/* Moon Body Base */}
             <circle r="15" fill="#333" /> 
             
             {/* Lit half: Always facing the Sun (Right side) */}
             {/* We use a mask or arc to show the lit side. Since Sun is at 0deg (Right), the right half of the moon is always lit relative to the universe. */}
             <path d="M 0 -15 A 15 15 0 0 1 0 15 Z" fill="#fefce8" />
             
             {/* Moon Label */}
             <text y="-20" textAnchor="middle" fill="white" fontSize="12">月</text>
          </g>

          {/* Drag Handle Hint */}
          <circle cx={moonX} cy={moonY} r="25" fill="transparent" stroke="rgba(255,255,255,0.3)" strokeWidth={isDragging ? 2 : 0} />

        </svg>
        <div className="absolute bottom-2 right-2 text-xs text-slate-400 pointer-events-none">
            月をドラッグして動かしてみてね！
        </div>
      </div>
    </div>
  );
};

export default OrbitVisualizer;
