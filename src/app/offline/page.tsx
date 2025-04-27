'use client';
import { WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <WifiOff className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Tidak Ada Koneksi Internet</h1>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Sepertinya Anda sedang offline. Periksa koneksi internet Anda dan coba lagi.
      </p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-6 py-2 bg-[#2E7D32] text-white rounded-lg hover:bg-[#1B5E20] transition-colors"
      >
        Coba Lagi
      </button>
    </div>
  );
} 