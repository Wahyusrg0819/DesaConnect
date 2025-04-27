import { Loader2 } from 'lucide-react';
import { Progress } from './progress';
import React from 'react';

export default function GlobalLoading() {
  // Simulasi progress bar (naik otomatis, reset jika penuh)
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
    if (progress < 95) {
      const timer = setTimeout(() => setProgress(progress + Math.random() * 10), 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-8 p-8 rounded-xl shadow-2xl bg-white/10 border border-white/20">
        <div className="relative flex items-center justify-center">
          <Loader2 className="h-24 w-24 animate-spin text-primary drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 16px #4CAF50)' }} />
          {/* 3D efek: lingkaran glow di belakang */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-400/30 to-blue-400/20 blur-2xl" />
        </div>
        <Progress value={progress} className="w-64 h-3 bg-secondary/80" />
      </div>
    </div>
  );
} 