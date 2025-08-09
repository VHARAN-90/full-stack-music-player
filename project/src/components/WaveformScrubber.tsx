import React, { useRef, useEffect, useState } from 'react';

interface WaveformScrubberProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  audioData?: Uint8Array;
  isPlaying: boolean;
}

export const WaveformScrubber: React.FC<WaveformScrubberProps> = ({
  currentTime,
  duration,
  onSeek,
  audioData,
  isPlaying,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [previewTime, setPreviewTime] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = containerRef.current;
    if (!container) return;

    canvas.width = container.offsetWidth * 2; // High DPI
    canvas.height = 80 * 2;
    canvas.style.width = container.offsetWidth + 'px';
    canvas.style.height = '80px';

    ctx.scale(2, 2);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2);

    if (audioData) {
      // Draw waveform
      const barWidth = (canvas.width / 2) / audioData.length;
      const centerY = canvas.height / 4;

      for (let i = 0; i < audioData.length; i++) {
        const barHeight = (audioData[i] / 255) * (canvas.height / 4);
        const x = i * barWidth;
        
        // Color based on playback position
        const progress = duration > 0 ? currentTime / duration : 0;
        const hoverProgress = duration > 0 ? previewTime / duration : -1;
        const isPlayed = i < audioData.length * progress;
        const isHovered = hoverProgress >= 0 && i < audioData.length * hoverProgress && i >= audioData.length * progress;
        
        if (isHovered) {
          ctx.fillStyle = 'rgba(120, 75, 160, 0.6)'; // Purple for hover preview
        } else if (isPlayed) {
          ctx.fillStyle = 'rgba(255, 60, 172, 0.8)'; // Pink for played
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; // White for unplayed
        }
        
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
      }
    } else {
      // Draw placeholder waveform
      const bars = 100;
      const barWidth = (canvas.width / 2) / bars;
      const centerY = canvas.height / 4;

      for (let i = 0; i < bars; i++) {
        const barHeight = Math.random() * 30 + 5;
        const x = i * barWidth;
        
        const progress = duration > 0 ? currentTime / duration : 0;
        const hoverProgress = duration > 0 ? previewTime / duration : -1;
        const isPlayed = i < bars * progress;
        const isHovered = hoverProgress >= 0 && i < bars * hoverProgress && i >= bars * progress;
        
        if (isHovered) {
          ctx.fillStyle = 'rgba(120, 75, 160, 0.6)';
        } else if (isPlayed) {
          ctx.fillStyle = 'rgba(255, 60, 172, 0.8)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        }
        
        ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
      }
    }

    // Draw playhead
    if (duration > 0) {
      const progress = currentTime / duration;
      const playheadX = progress * (canvas.width / 2);
      
      ctx.strokeStyle = isDragging ? '#FF3CAC' : '#FFFFFF';
      ctx.lineWidth = isDragging ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, canvas.height / 2);
      ctx.stroke();
      
      // Playhead circle
      ctx.fillStyle = isDragging ? '#FF3CAC' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(playheadX, canvas.height / 4, isDragging ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Add glow effect when dragging
      if (isDragging) {
        ctx.shadowColor = '#FF3CAC';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(playheadX, canvas.height / 4, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    
    // Draw hover preview line
    if (isHovering && previewTime >= 0 && duration > 0) {
      const hoverProgress = previewTime / duration;
      const hoverX = hoverProgress * (canvas.width / 2);
      
      ctx.strokeStyle = 'rgba(120, 75, 160, 0.8)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(hoverX, 0);
      ctx.lineTo(hoverX, canvas.height / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [audioData, currentTime, duration, isHovering, isDragging, previewTime]);

  const handleInteractionStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartTime(Date.now());
    handleSeek(clientX);
  };

  const handleInteractionMove = (clientX: number) => {
    if (isDragging) {
      handleSeek(clientX);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging && isHovering) {
      const container = containerRef.current;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const progress = Math.max(0, Math.min(1, x / rect.width));
      const time = progress * duration;
      
      setPreviewTime(time);
      setHoverTime(time);
    }
  };

  const handleSeek = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const progress = Math.max(0, Math.min(1, x / rect.width));
    const seekTime = progress * duration;
    
    onSeek(seekTime);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleInteractionStart(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handleInteractionStart(e.touches[0].clientX);
  };

  const handleGlobalMouseMove = (e: MouseEvent) => {
    handleInteractionMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    handleInteractionMove(e.touches[0].clientX);
  };

  const handleEnd = () => {
    setIsDragging(false);
    setPreviewTime(-1);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, duration]);
  
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-20 cursor-pointer transition-all duration-200 ${
        isHovering || isDragging ? 'transform scale-102' : ''
      }`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onMouseEnter={() => {
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        setPreviewTime(-1);
      }}
      onMouseMove={handleMouseMove}
    >
      <canvas
        ref={canvasRef}
        className={`w-full h-full rounded-lg bg-white/5 backdrop-blur-sm border transition-all duration-200 ${
          isDragging 
            ? 'border-[#FF3CAC]/50 shadow-lg shadow-[#FF3CAC]/25' 
            : isHovering 
              ? 'border-white/20' 
              : 'border-white/10'
        }`}
      />
      
      {/* Time preview tooltip */}
      {isHovering && !isDragging && previewTime >= 0 && (
        <div 
          className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none transform -translate-x-1/2"
          style={{ 
            left: `${(previewTime / duration) * 100}%`,
          }}
        >
          {formatTime(previewTime)}
        </div>
      )}
      
      {/* Enhanced visual feedback during dragging */}
      {isDragging && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 rounded-lg" />
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-[#FF3CAC] text-white text-sm px-3 py-1 rounded-full font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </>
      )}
      
      {/* Ripple effect on click */}
      {isDragging && (
        <div 
          className="absolute w-4 h-4 bg-[#FF3CAC]/30 rounded-full animate-ping pointer-events-none"
          style={{
            left: `${(currentTime / duration) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}
    </div>
  );
};