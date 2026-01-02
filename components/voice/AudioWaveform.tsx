"use client";

import { useEffect, useRef } from "react";

interface AudioWaveformProps {
  volumeLevel: number; // 0-1 range
  isSpeaking: boolean;
  isConnected: boolean;
}

export default function AudioWaveform({
  volumeLevel,
  isSpeaking,
  isConnected,
}: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      if (!isConnected) {
        // Show inactive state
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        return;
      }

      const barCount = 50;
      const barWidth = width / barCount;
      const baseAmplitude = isSpeaking ? 30 : 10;
      const amplitude = baseAmplitude * (0.3 + volumeLevel * 0.7);

      ctx.fillStyle = isSpeaking ? "#ec4899" : "#a855f7";

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth;
        const frequency = isSpeaking ? 0.05 : 0.02;
        const phase = i * 0.5;
        const height =
          Math.sin(time * frequency + phase) * amplitude +
          Math.random() * amplitude * 0.3;

        const barHeight = Math.abs(height);
        ctx.fillRect(x, centerY - barHeight / 2, barWidth * 0.8, barHeight);
      }

      time += isSpeaking ? 2 : 1;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [volumeLevel, isSpeaking, isConnected]);

  return (
    <div className="w-full h-32 flex items-center justify-center bg-gray-50 rounded-lg">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
