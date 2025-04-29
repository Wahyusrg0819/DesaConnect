import React from 'react';
import { MessageSquarePlus } from 'lucide-react';

interface AppIconProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function AppIcon({
  size = 192,
  color = 'white',
  backgroundColor = '#2E7D32',
}: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 192 192"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} rx={size * 0.25} fill={backgroundColor} />
      <svg
        x={size * 0.2}
        y={size * 0.2}
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="12" y1="11" x2="12" y2="15" />
        <line x1="10" y1="13" x2="14" y2="13" />
      </svg>
    </svg>
  );
} 