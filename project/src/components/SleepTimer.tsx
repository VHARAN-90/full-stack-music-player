import React, { useState } from 'react';
import { Clock, Play, Pause, RotateCcw, X } from 'lucide-react';
import { useSleepTimer } from '../hooks/useSleepTimer';

interface SleepTimerProps {
  onTimerComplete: () => void;
}

export const SleepTimer: React.FC<SleepTimerProps> = ({ onTimerComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMinutes, setSelectedMinutes] = useState(15);
  
  const {
    isActive,
    timeRemaining,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    onTimerComplete: setOnTimerComplete,
  } = useSleepTimer();

  React.useEffect(() => {
    setOnTimerComplete(onTimerComplete);
  }, [onTimerComplete, setOnTimerComplete]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    startTimer(selectedMinutes);
    setIsOpen(false);
  };

  const presetMinutes = [15, 30, 45, 60, 90, 120];

  if (!isOpen && !isActive) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-300 hover:text-white transition-colors"
        title="Sleep Timer"
      >
        <Clock className="h-5 w-5" />
      </button>
    );
  }

  if (isActive) {
    return (
      <div className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2">
        <Clock className="h-4 w-4 text-[#FF3CAC]" />
        <span className="text-white font-mono text-sm">
          {formatTime(timeRemaining)}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={isPaused ? resumeTimer : pauseTimer}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Timer' : 'Pause Timer'}
          >
            {isPaused ? (
              <Play className="h-3 w-3" />
            ) : (
              <Pause className="h-3 w-3" />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#2B2D42] border border-white/10 rounded-lg shadow-xl z-50 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Sleep Timer</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Select Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presetMinutes.map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => setSelectedMinutes(minutes)}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMinutes === minutes
                      ? 'bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {minutes}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Custom Duration (minutes)
            </label>
            <input
              type="number"
              min="1"
              max="480"
              value={selectedMinutes}
              onChange={(e) => setSelectedMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF3CAC]/50 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleStartTimer}
            className="w-full py-2 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white rounded-lg hover:from-[#FF3CAC]/80 hover:to-[#784BA0]/80 transition-all duration-200 font-medium"
          >
            Start Timer ({selectedMinutes}m)
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-400">
          Music will automatically stop when the timer reaches zero
        </div>
      </div>
    </div>
  );
};