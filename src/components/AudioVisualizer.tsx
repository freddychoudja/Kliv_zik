import { useEffect, useRef } from 'react';
import { audio } from '../utils/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export default function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = audio.analyser ? audio.analyser.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    // Responsive Canvas dimensions
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 80;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;

      // Clear with soft trails (motion blur effect)
      ctx.fillStyle = 'rgba(19, 19, 19, 0.25)';
      ctx.fillRect(0, 0, width, height);

      if (audio.analyser && isPlaying) {
        audio.analyser.getByteFrequencyData(dataArray);
      } else {
        // Flatline simulation when stopped or loading
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(0, dataArray[i] - 1.5); // decay to flatline
        }
      }

      const barWidth = (width / bufferLength) * 1.6;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * height * 0.9;

        // Visual gradients for the neon bars
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)'); // emerald trans
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.6)'); // bright emerald
        gradient.addColorStop(1, '#22c55e'); // high contrast neon green

        ctx.fillStyle = gradient;
        
        // Rounded bars or shadows for high-density elegance
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

        // Mirror active bar on horizontal center
        x += barWidth;
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full h-20 bg-black/45 rounded-2xl overflow-hidden relative border border-white/5 shadow-inner">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
    </div>
  );
}
