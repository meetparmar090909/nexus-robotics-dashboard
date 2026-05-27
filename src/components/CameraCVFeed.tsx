import React, { useEffect, useRef } from 'react';

interface CameraCVFeedProps {
  feedType: 'thermal' | 'cv_detection' | 'lidar' | 'neural_hud';
  camName: string;
  camId: string;
}

export const CameraCVFeed: React.FC<CameraCVFeedProps> = ({ feedType, camName, camId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let time = 0;

    // Detection Box Objects
    const trackedItems = [
      { id: 'SYS-PART-1', label: 'CHASSIS_3A', x: 20, speed: 1.2, sizeX: 60, sizeY: 40, confidence: 99.2 },
      { id: 'SYS-PART-2', label: 'BATTERY_P2', x: -150, speed: 1.2, sizeX: 45, sizeY: 35, confidence: 97.8 },
      { id: 'SYS-PART-3', label: 'CORE_CTRL', x: -320, speed: 1.2, sizeX: 30, sizeY: 30, confidence: 98.9 }
    ];

    const resizeCanvas = () => {
      // Set to container dimensions
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width || 400;
      canvas.height = rect.height || 250;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawFeed = () => {
      time += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      // Clear Canvas
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Draw Grid Matrix Background (CRT overlay feel)
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 15) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      if (feedType === 'thermal') {
        // Draw Thermal scan gradient hotspots (simulating motor heat)
        ctx.save();
        const radGradient = ctx.createRadialGradient(
          w / 2 + Math.sin(time) * 30, h / 2 + Math.cos(time / 2) * 20, 10,
          w / 2 + Math.sin(time) * 30, h / 2 + Math.cos(time / 2) * 20, 90
        );
        radGradient.addColorStop(0, 'rgba(255, 0, 0, 0.85)'); // core heat
        radGradient.addColorStop(0.3, 'rgba(255, 120, 0, 0.7)'); // heat diffusion
        radGradient.addColorStop(0.6, 'rgba(255, 230, 0, 0.4)'); // edge warm
        radGradient.addColorStop(0.9, 'rgba(0, 0, 255, 0.15)'); // cold ambient
        radGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = radGradient;
        ctx.fillRect(0, 0, w, h);

        // Second hot spot (e.g. robotic gear friction)
        const gearGradient = ctx.createRadialGradient(
          w / 4 + Math.cos(time * 1.5) * 15, h / 3 * 2 + Math.sin(time * 1.5) * 10, 5,
          w / 4 + Math.cos(time * 1.5) * 15, h / 3 * 2 + Math.sin(time * 1.5) * 10, 50
        );
        gearGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gearGradient.addColorStop(0.25, 'rgba(255, 0, 127, 0.8)');
        gearGradient.addColorStop(0.7, 'rgba(127, 0, 255, 0.3)');
        gearGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gearGradient;
        ctx.fillRect(0, 0, w, h);

        // HUD telemetry labels
        ctx.fillStyle = '#ef4444';
        ctx.font = '10px Share Tech Mono';
        ctx.fillText(`THR_CORE: ${(68.4 + Math.sin(time) * 0.4).toFixed(1)}°C`, 15, 25);
        ctx.fillText(`THR_JOINT_A2: ${(42.1 + Math.cos(time) * 0.2).toFixed(1)}°C`, 15, 40);
        ctx.fillText('TEMP RANGE: 15°C - 80°C', 15, h - 15);
        ctx.strokeStyle = '#ef4444';
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.restore();

      } else if (feedType === 'cv_detection') {
        // Draw conveyor lane
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, h / 2 - 25, w, 50);
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, h / 2 - 25);
        ctx.lineTo(w, h / 2 - 25);
        ctx.moveTo(0, h / 2 + 25);
        ctx.lineTo(w, h / 2 + 25);
        ctx.stroke();

        // Animate moving parts on belt with CV bounding boxes
        trackedItems.forEach(item => {
          item.x += item.speed;
          if (item.x > w + 50) {
            item.x = -150;
          }

          if (item.x > -50 && item.x < w + 50) {
            // Draw Part Geometry
            ctx.fillStyle = '#1e293b';
            ctx.strokeStyle = '#00f2fe';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(item.x, h / 2 - item.sizeY / 2, item.sizeX, item.sizeY, 4);
            ctx.fill();
            ctx.stroke();

            // Draw bounding box (slightly larger)
            ctx.strokeStyle = 'rgba(0, 230, 118, 0.8)';
            ctx.lineWidth = 1;
            const pad = 6;
            const bx = item.x - pad;
            const by = h / 2 - item.sizeY / 2 - pad;
            const bw = item.sizeX + pad * 2;
            const bh = item.sizeY + pad * 2;
            ctx.strokeRect(bx, by, bw, bh);

            // Bounding box corners
            ctx.strokeStyle = '#00e676';
            ctx.lineWidth = 2;
            // Top Left corner
            ctx.beginPath();
            ctx.moveTo(bx, by + 10); ctx.lineTo(bx, by); ctx.lineTo(bx + 10, by);
            // Top Right corner
            ctx.moveTo(bx + bw - 10, by); ctx.lineTo(bx + bw, by); ctx.lineTo(bx + bw, by + 10);
            // Bottom Left
            ctx.moveTo(bx, by + bh - 10); ctx.lineTo(bx, by + bh); ctx.lineTo(bx + 10, by + bh);
            // Bottom Right
            ctx.moveTo(bx + bw - 10, by + bh); ctx.lineTo(bx + bw, by + bh); ctx.lineTo(bx + bw, by + bh - 10);
            ctx.stroke();

            // Label text overlay
            ctx.fillStyle = '#00e676';
            ctx.font = '9px Share Tech Mono';
            ctx.fillText(`${item.label} [${item.confidence}%]`, bx, by - 5);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`X:${bx.toFixed(0)} Y:${by.toFixed(0)}`, bx, by + bh + 12);
          }
        });

        // CV camera target crosshair
        ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        // center lines
        ctx.moveTo(w / 2, 20); ctx.lineTo(w / 2, h - 20);
        ctx.moveTo(20, h / 2); ctx.lineTo(w - 20, h / 2);
        ctx.stroke();

        ctx.strokeStyle = '#00f2fe';
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 30, 0, Math.PI * 2);
        ctx.stroke();

      } else if (feedType === 'lidar') {
        // Draw LIDAR horizontal scans
        ctx.save();
        ctx.strokeStyle = 'rgba(127, 0, 255, 0.2)';
        ctx.lineWidth = 1;
        // Bouncing sine-wave landscape (simulating depth scans)
        ctx.beginPath();
        for (let i = 0; i < w; i += 8) {
          const depth = h / 2 + Math.sin(i * 0.05 + time) * 35 + Math.cos(i * 0.02 - time * 0.7) * 20;
          if (i === 0) ctx.moveTo(i, depth);
          else ctx.lineTo(i, depth);
        }
        ctx.stroke();

        // Point cloud elements (matrix code-like scatter nodes)
        for (let i = 20; i < w - 20; i += 20) {
          const depth = h / 2 + Math.sin(i * 0.05 + time) * 35 + Math.cos(i * 0.02 - time * 0.7) * 20;
          ctx.fillStyle = '#a855f7';
          ctx.beginPath();
          ctx.arc(i, depth, 2, 0, Math.PI * 2);
          ctx.fill();

          // Vertical mesh line
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
          ctx.beginPath();
          ctx.moveTo(i, h);
          ctx.lineTo(i, depth);
          ctx.stroke();
        }

        ctx.fillStyle = '#a855f7';
        ctx.font = '10px Share Tech Mono';
        ctx.fillText('LIDAR DEPTH MAP RESOLUTION: 0.02mm', 15, 25);
        ctx.fillText(`LASER DISP: ${(30.2 + Math.sin(time) * 0.15).toFixed(3)} G/s`, 15, 40);
        ctx.restore();

      } else if (feedType === 'neural_hud') {
        // Standard video simulating edge outline of a robotic arm
        ctx.save();
        ctx.translate(w / 2, h / 2 + 20);
        
        // Let's draw a rotating 2D vector robotic arm
        const baseAngle = Math.sin(time * 0.5) * 0.4;
        const shoulderAngle = Math.cos(time * 0.7) * 0.5 - 0.5;
        const elbowAngle = Math.sin(time * 0.9) * 0.6;

        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;

        // Base line
        ctx.beginPath();
        ctx.moveTo(-30, 0); ctx.lineTo(30, 0);
        ctx.stroke();

        // Shoulder joint
        ctx.rotate(baseAngle);
        ctx.fillStyle = '#030712';
        ctx.beginPath();
        ctx.arc(0, -10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Lower arm link
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(0, -70);
        ctx.stroke();

        // Elbow joint
        ctx.translate(0, -70);
        ctx.rotate(shoulderAngle);
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Upper arm link
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -50);
        ctx.stroke();

        // Wrist & End effector
        ctx.translate(0, -50);
        ctx.rotate(elbowAngle);
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, 0); ctx.lineTo(-8, -15);
        ctx.moveTo(0, 0); ctx.lineTo(8, -15);
        ctx.stroke();
        
        ctx.restore();

        // Face recognition lock
        const targetX = w / 2 + Math.sin(time * 0.6) * 40;
        const targetY = h / 2 - 40 + Math.cos(time * 0.6) * 20;

        ctx.strokeStyle = '#ff007f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 20, 0, Math.PI * 2);
        ctx.stroke();

        // Target grid line
        ctx.beginPath();
        ctx.moveTo(targetX - 30, targetY); ctx.lineTo(targetX + 30, targetY);
        ctx.moveTo(targetX, targetY - 30); ctx.lineTo(targetX, targetY + 30);
        ctx.stroke();

        ctx.fillStyle = '#ff007f';
        ctx.font = '9px Share Tech Mono';
        ctx.fillText('TARGET_LOCK_ARM_E1', targetX + 25, targetY - 5);
        ctx.fillText('CALIBRATING', targetX + 25, targetY + 10);
      }

      // Draw global recording blinking indicator
      ctx.fillStyle = '#ff3b30';
      ctx.beginPath();
      const blinkOn = Math.floor(time * 2) % 2 === 0;
      if (blinkOn) {
        ctx.arc(w - 25, 25, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px Orbitron';
      ctx.fillText('REC', w - 50, 28);
      
      // Draw Cam metadata
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.font = '9px Share Tech Mono';
      ctx.fillText(`CAM_ID: ${camId}`, w - 110, h - 15);
      ctx.fillText(`FPS: 60.00`, w - 50, h - 15);
      ctx.fillText(camName, 15, h - 15);

      // Add a scanline bar running up and down the viewport
      const scanlineY = (time * 25) % h;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, scanlineY);
      ctx.lineTo(w, scanlineY);
      ctx.stroke();

      animFrameId = requestAnimationFrame(drawFeed);
    };

    drawFeed();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animFrameId);
    };
  }, [feedType, camId, camName]);

  return (
    <div className="relative w-full h-[250px] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex flex-col shadow-inner">
      {/* Outer borders and glowing scan lines */}
      <div className="absolute inset-0 border border-cyan-500/10 pointer-events-none rounded-xl"></div>
      <div className="scanner-bar opacity-20 pointer-events-none"></div>
      
      {/* Canvas Mount */}
      <canvas ref={canvasRef} className="w-full h-full flex-grow" />
    </div>
  );
};
