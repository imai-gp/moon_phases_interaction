import React from 'react';
import { MoonData } from '../types';

interface Props {
  angle: number;
}

const MoonView: React.FC<Props> = ({ angle }) => {
  // Calculate phase for visual
  // New Moon (0 deg) -> Moon is dark.
  // Waxing Crescent -> Right side lit.
  // First Quarter (90 deg) -> Right half lit.
  // Full Moon (180 deg) -> Fully lit.
  // Waning (270 deg) -> Left half lit.
  
  // We can use SVG masks or simpler CSS shadows. 
  // Let's use a clever SVG path generation for accurate phases.
  
  // Normalize angle to 0-360
  const normalizedAngle = (angle % 360 + 360) % 360;
  
  // Fraction of cycle (0 to 1)
  // 0 = New Moon, 0.5 = Full Moon
  // Note: Our angle 0 is New Moon (Moon between Earth and Sun).
  // angle 180 is Full Moon.
  
  // We need to determine the shape of the lit part.
  // Using a circle for the moon and an ellipse for the shadow/light boundary.
  
  const radius = 80;
  const cx = 100;
  const cy = 100;
  
  // Logic for SVG path "d" attribute
  // We draw a circle for the base.
  // Then we draw the lit portion or the shadow portion.
  
  // Simpler approach:
  // Base circle is the "dark side" (or lit side depending on phase).
  // We overlay an ellipse.
  
  // Let's look at the phase from Earth perspective.
  // Angle 0-180: Waxing (Right side becomes lit).
  // Angle 180-360: Waning (Left side stays lit).

  // Helper to calculate shadow offset
  // At 0 deg: All dark.
  // At 90 deg: Right half lit.
  // At 180 deg: All bright.
  
  // We can render this by composing two arcs.
  const phase = normalizedAngle / 360; // 0 to 1
  
  // Create the path for the Lit part.
  // This is complex to do perfectly with one path, so we use a mask approach.
  
  // Simple CSS Box Shadow approach is hard for crescents.
  // Let's use the svg-moon-phase logic concept.
  // We draw the full moon (white).
  // We draw a shadow (black) over it.
  
  let shadowPath = "";
  const r = radius;
  
  // Use cosine to determine the curve of the terminator
  // cos(0) = 1 (New Moon boundary is full circle? No.)
  // The terminator is an ellipse with x-radius varying from r to -r.
  
  // Let's assume standard astronomical convention:
  // Phase 0 (New): Dark.
  // Phase 0.25 (First Q): Right half lit. Terminator is vertical line.
  // Phase 0.5 (Full): Bright.
  
  // Light direction relative to view from Earth:
  // 0-180: Sun is "to the right" effectively in the sky diagram progression?
  // Actually, simpler:
  // 0 deg: Sun is behind Moon. Moon is dark.
  // 90 deg: Sun is right of Earth-Moon line. Right half lit.
  // 180 deg: Sun is opposite. Full lit.
  // 270 deg: Sun is left. Left half lit.

  // Terminator curve X position scales with cos(angle).
  // X runs from -r to r.
  const terminatorX = -r * Math.cos(normalizedAngle * Math.PI / 180);
  
  // Direction of the curve depends on side.
  const isWaxing = normalizedAngle <= 180;
  const isGibbous = Math.abs(normalizedAngle - 180) < 90; // >90 and <270

  // Constructing the path is tricky. Let's use a visual trick with two halves.
  // 1. Draw background circle (Dark or Light).
  // 2. Draw a semi-circle covering half.
  // 3. Draw an ellipse covering the middle.

  let mainColor = "#1e293b"; // Dark (Space)
  let litColor = "#fefce8"; // Moon Light
  
  // SVG Layers:
  // 1. Base Circle (Dark)
  // 2. Lit Region
  
  // Path Logic:
  // We always draw the "lit" part.
  
  // Determine lit path
  // Start at top (cx, cy-r)
  // Arc to bottom (cx, cy+r). Direction depends on waxing/waning.
  // Return to top via the terminator ellipse.
  
  const sweep = isWaxing ? 0 : 1; // 0 for left arc, 1 for right arc?
  // SVG Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
  
  // Outer rim arc:
  // Waxing (0-180): Lit side is on the Right. We need the arc on the right.
  // Waning (180-360): Lit side is on the Left. We need the arc on the left.
  
  const outerArcStart = `${cx},${cy-r}`;
  const outerArcEnd = `${cx},${cy+r}`;
  const outerControl = isWaxing ? `A ${r} ${r} 0 0 1 ${outerArcEnd}` : `A ${r} ${r} 0 0 0 ${outerArcEnd}`;
  
  // Terminator Arc (Ellipse):
  // Goes from Bottom to Top.
  // Radius X is absolute value of terminatorX.
  // Radius Y is r.
  // Sweep flag depends on Gibbous or Crescent.
  
  // Logic breakdown:
  // New Moon (0): Lit is nothing.
  // Waxing Crescent (<90): Lit is Right Crescent. Outer Arc Right. Inner Ellipse arcs to Right (to make it thin).
  // First Quarter (90): Lit is Right Half. Outer Arc Right. Inner Line straight.
  // Waxing Gibbous (>90): Lit is Right Bulge. Outer Arc Right. Inner Ellipse arcs to Left (to make it thick).
  // Full Moon (180): Lit is Full.
  
  // Refined Logic:
  // Always draw the semi-circle on the lit side.
  // Add or subtract the semi-ellipse in the middle.
  
  // View from Earth
  return (
    <div className="flex flex-col items-center animate-float">
      <h3 className="text-xl font-bold mb-4 text-sky-300">地球から見た様子</h3>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Base: Dark Moon */}
        <circle cx={cx} cy={cy} r={r} fill="#334155" />
        
        {/* Lit Part */}
        <path 
          d={calculateLitPath(cx, cy, r, normalizedAngle)} 
          fill="#fefce8"
          filter="url(#glow)"
        />
        
        {/* Glow Effect Definition */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
};

// Helper function to calculate SVG path for moon phase
function calculateLitPath(cx: number, cy: number, r: number, angle: number): string {
  const rad = (angle * Math.PI) / 180;
  
  // 0 is New Moon, 180 is Full
  if (angle === 0 || angle === 360) return ""; // New Moon
  if (Math.abs(angle - 180) < 0.1) return `M ${cx-r},${cy} A ${r},${r} 0 1,1 ${cx+r},${cy} A ${r},${r} 0 1,1 ${cx-r},${cy}`; // Full Moon approx
  
  const isWaxing = angle < 180;
  const isGibbous = angle > 90 && angle < 270;
  
  // The X-radius of the terminator ellipse
  const tx = r * Math.cos(rad);
  
  // Path Construction:
  // Move to Top
  // Draw Outer Arc (Right for Waxing, Left for Waning)
  // Draw Terminator Arc back to Top
  
  const startX = cx;
  const startY = cy - r;
  const endX = cx;
  const endY = cy + r;
  
  // Outer Arc
  // Waxing -> Right side lit -> sweep 1
  // Waning -> Left side lit -> sweep 0 (from top to bottom)
  const outerSweep = isWaxing ? 1 : 0;
  
  // Terminator Arc (Bottom to Top)
  // We need to curve *towards* the lit side if crescent, *away* if gibbous.
  // Or simply: The terminator x follows the cosine rule.
  // We just need to draw an elliptical arc from bottom to top.
  // The point on the equator is at (cx - tx, cy).
  // Note: tx is positive for crescent/gibbous logic depending on phase.
  // tx = r * cos(angle).
  // At 45 deg (Wax Cres), cos > 0. Terminator is on Right side.
  // We drew outer arc on Right. We need to cut out the left part of that right semicircle? 
  // Wait, simpler:
  // Waxing Crescent: Draw Right Semicircle. Then subtract the ellipse? 
  // SVG paths are additive usually unless using masks.
  
  // Let's re-evaluate standard algorithm:
  // Draw the lit semi-circle.
  // Add/Subtract the half-ellipse.
  
  let path = "";
  
  if (isWaxing) {
    // Right side is the main lit side.
    // Draw Right Semi-Circle: Top -> Right -> Bottom
    path += `M ${startX},${startY} A ${r},${r} 0 0,1 ${endX},${endY}`;
    
    // Now back to top.
    // If Crescent (angle < 90), we need to curve into the right side.
    // If Gibbous (angle > 90), we need to curve into the left side (adding to the shape).
    
    // Elliptical Arc: rx=|tx|, ry=r.
    // From Bottom to Top.
    // Sweep?
    // If angle < 90 (Crescent), tx > 0. We want to 'scoop' out. Sweep 0?
    // If angle > 90 (Gibbous), tx < 0. We want to 'bulge' out. Sweep 1?
    
    // Actually, just follow the coordinate geometry.
    // The point (cx - tx, cy) is on the curve.
    // angle=45, tx ~ 0.7r. Point is Left of center? No, cos(45)>0. 
    // Wait, angle 0 is New Moon (Sun behind Moon).
    // Moon is between Earth and Sun.
    // View from Earth: Dark.
    // As angle increases to 90 (First Quarter), Moon moves Left in sky?
    // Let's stick to the visual:
    // Waxing = Right side lit.
    // Terminator moves from Right edge (New) to Center (Quarter) to Left edge (Full).
    
    // So terminator X should go from +r (New) to 0 (Quarter) to -r (Full).
    // My tx = r * cos(angle) does exactly that:
    // angle 0 -> r
    // angle 90 -> 0
    // angle 180 -> -r
    
    // So the terminator passes through (cx - tx, cy). Wait, if tx is pos, cx-tx is left?
    // If angle 0, terminator is at Right Edge. We want cx + r.
    // So let's use terminatorX = r * cos(angle).
    // The curve passes through (cx - terminatorX, cy).
    // angle 0 -> cx - r (Left edge). Wait. New Moon is dark.
    
    // Let's trust the visual intuition:
    // Waxing Crescent: Lit is a sliver on the Right. Terminator is on the right side, bulging right.
    // First Q: Terminator is straight line.
    // Waxing Gibbous: Lit is huge. Terminator is on the left side, bulging left.
    
    // Path: Top -> Outer Arc (Right side) -> Bottom.
    // Now Bottom -> Top via Terminator.
    // The terminator x-coordinate at equator is determined by projection.
    
    // Using the arc command `A rx ry rotation large-arc sweep x y`
    // rx = Math.abs(tx)
    // ry = r
    
    // We need to choose the sweep flag correctly.
    // Start point: Bottom. End point: Top.
    // If we want to pass through the Right half (Crescent), we need a specific sweep.
    // If we want to pass through the Left half (Gibbous), other sweep.
    
    // For Waxing (Right side lit):
    // The Terminator moves from Right to Left.
    // Crescent: Terminator is on Right. Path needs to go through Right semi-circle.
    // Gibbous: Terminator is on Left. Path needs to go through Left semi-circle.
    
    const sweep = angle < 90 ? 0 : 1; 
    path += ` A ${Math.abs(tx)},${r} 0 0,${sweep} ${startX},${startY}`;
    
  } else {
    // Waning. Left side is lit.
    // Draw Left Semi-Circle: Top -> Left -> Bottom
    path += `M ${startX},${startY} A ${r},${r} 0 0,0 ${endX},${endY}`;
    
    // Back to top via terminator.
    // Terminator moves from Left (Full) to Right (New).
    // Gibbous (180-270): Terminator on Right.
    // Crescent (270-360): Terminator on Left.
    
    const sweep = angle < 270 ? 1 : 0;
    path += ` A ${Math.abs(tx)},${r} 0 0,${sweep} ${startX},${startY}`;
  }

  return path;
}

export default MoonView;
