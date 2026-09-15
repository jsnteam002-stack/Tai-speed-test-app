import React from 'react';
import { SpeedTestStage } from '../types';

interface SpeedometerProps {
  value: number;
  maxMbps?: number;
  stage: SpeedTestStage;
  stageMessage?: string;
  onStart: () => void;
  progressPercent: number;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  maxMbps = 100,
  stage,
  stageMessage,
  onStart,
  progressPercent,
}) => {
  // Dynamically scale speedometer gauge maximum
  let scaleMax = 100;
  if (value > 500) scaleMax = 1000;
  else if (value > 250) scaleMax = 500;
  else if (value > 100) scaleMax = 250;

  const currentMbps = Math.max(0, value);
  const normalizedRatio = Math.min(1, currentMbps / scaleMax);

  // SVG Gauge calculations (Arc from -210 degrees to +30 degrees = 240 deg total arc)
  const radius = 120;
  const strokeWidth = 14;
  const cx = 160;
  const cy = 160;
  const startAngle = -210;
  const totalArcAngle = 240;

  const activeAngle = startAngle + normalizedRatio * totalArcAngle;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(' ');
  };

  const backgroundArcPath = describeArc(cx, cy, radius, startAngle, startAngle + totalArcAngle);
  const activeArcPath = describeArc(cx, cy, radius, startAngle, Math.max(startAngle + 0.1, activeAngle));

  const needleEnd = polarToCartesian(cx, cy, radius - 20, activeAngle);

  const isTesting = stage === 'download' || stage === 'upload' || stage === 'ping' || stage === 'finding_server';

  // Tick marks
  const ticks = [0, scaleMax * 0.1, scaleMax * 0.2, scaleMax * 0.3, scaleMax * 0.5, scaleMax * 0.75, scaleMax];

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Main Dial Canvas */}
      <div className="relative w-[320px] h-[320px] flex items-center justify-center">
        {/* Glow Effects */}
        <div className={`absolute inset-6 rounded-full blur-2xl transition-opacity duration-500 ${
          stage === 'download' ? 'bg-cyan-500/20 opacity-100' :
          stage === 'upload' ? 'bg-purple-500/20 opacity-100' :
          'bg-cyan-500/10 opacity-40'
        }`} />

        <svg width="320" height="320" viewBox="0 0 320 320" className="relative z-10 overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#06b6d4" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d={backgroundArcPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Progress Arc */}
          <path
            d={activeArcPath}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#shadow)"
            className="transition-all duration-150 ease-out"
          />

          {/* Ticks & Labels */}
          {ticks.map((tickVal, idx) => {
            const tickRatio = tickVal / scaleMax;
            const tickAngle = startAngle + tickRatio * totalArcAngle;
            const outer = polarToCartesian(cx, cy, radius + 10, tickAngle);
            const inner = polarToCartesian(cx, cy, radius + 2, tickAngle);
            const labelPos = polarToCartesian(cx, cy, radius - 24, tickAngle);

            return (
              <g key={idx}>
                <line
                  x1={inner.x}
                  y1={inner.y}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#475569"
                  strokeWidth="1.5"
                />
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="600"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {tickVal}
                </text>
              </g>
            );
          })}

          {/* Needle Line */}
          {isTesting && (
            <line
              x1={cx}
              y1={cy}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#06b6d4"
              strokeWidth="3"
              strokeLinecap="round"
              className="transition-all duration-100 ease-out"
            />
          )}

          {/* Center Pivot Point */}
          <circle cx={cx} cy={cy} r="8" fill="#0f172a" stroke="#06b6d4" strokeWidth="3" />
          <circle cx={cx} cy={cy} r="3" fill="#06b6d4" />
        </svg>

        {/* Center START Button or Live Speed Display */}
        <div className="absolute z-20 flex flex-col items-center justify-center text-center">
          {stage === 'idle' || stage === 'complete' || stage === 'error' ? (
            <button
              onClick={onStart}
              className="group relative w-28 h-28 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[2px] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-[#070c18] group-hover:bg-[#0b1326] flex flex-col items-center justify-center transition">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white tracking-wider">
                  START
                </span>
                <span className="text-[10px] text-cyan-400/80 font-bold uppercase tracking-widest mt-0.5">
                  TEST
                </span>
              </div>
            </button>
          ) : (
            <div className="flex flex-col items-center pointer-events-none">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-mono">
                {currentMbps.toFixed(2)}
              </span>
              <span className="text-xs font-extrabold tracking-widest text-cyan-400 uppercase mt-1">
                Mbps
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-2 max-w-[140px] truncate">
                {stageMessage || 'Testing...'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar during active test */}
      {isTesting && (
        <div className="w-full max-w-xs mt-2 bg-slate-950 rounded-full h-1.5 border border-slate-800 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-purple-500 h-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
};
