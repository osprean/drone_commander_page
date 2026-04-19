import { useEffect, useRef } from "react";

interface Props {
  roll: number;
  pitch: number;
  yaw: number;
  size?: number;
}

export function AttitudeIndicator({ roll, pitch, yaw, size = 172 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = size;
    const H = size;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2;
    const r = Math.min(W, H) / 2 - 4;

    ctx.clearRect(0, 0, W, H);

    // Clip circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Horizon
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((-roll * Math.PI) / 180);
    const pitchOffset = pitch * 2;
    // Sky
    ctx.fillStyle = "#2a4a6a";
    ctx.fillRect(-r * 2, -r * 2 + pitchOffset, r * 4, r * 2);
    // Ground
    ctx.fillStyle = "#6a4a2a";
    ctx.fillRect(-r * 2, pitchOffset, r * 4, r * 2);
    // Horizon line
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 2, pitchOffset);
    ctx.lineTo(r * 2, pitchOffset);
    ctx.stroke();
    // Pitch ladder
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "9px monospace";
    for (let p = -60; p <= 60; p += 10) {
      if (p === 0) continue;
      const y = pitchOffset - p * 2;
      const w = Math.abs(p) % 20 === 0 ? 30 : 15;
      ctx.beginPath();
      ctx.moveTo(-w, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      if (Math.abs(p) % 20 === 0) {
        ctx.fillText(`${Math.abs(p)}`, w + 3, y + 3);
        ctx.fillText(`${Math.abs(p)}`, -w - 15, y + 3);
      }
    }
    ctx.restore();

    // Roll arc marks
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 1;
    for (let a = -60; a <= 60; a += 10) {
      ctx.save();
      ctx.rotate((a * Math.PI) / 180);
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(0, -r + (a % 30 === 0 ? 8 : 4));
      ctx.stroke();
      ctx.restore();
    }
    // Roll pointer
    ctx.fillStyle = "#00e8cc";
    ctx.save();
    ctx.rotate((-roll * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, -r + 1);
    ctx.lineTo(-5, -r + 10);
    ctx.lineTo(5, -r + 10);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.restore();

    ctx.restore();

    // Center reference
    ctx.strokeStyle = "#ffcc00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 25, cy);
    ctx.lineTo(cx - 8, cy);
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx - 8, cy + 4);
    ctx.moveTo(cx + 8, cy);
    ctx.lineTo(cx + 8, cy + 4);
    ctx.moveTo(cx + 8, cy);
    ctx.lineTo(cx + 25, cy);
    ctx.stroke();
    ctx.fillStyle = "#ffcc00";
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring + yaw text
    ctx.strokeStyle = "#1f2733";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#00e8cc";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`HDG ${Math.round(yaw)}°`, cx, cy + r + 14);
  }, [roll, pitch, yaw, size]);

  return <canvas ref={canvasRef} style={{ display: "block" }} />;
}
