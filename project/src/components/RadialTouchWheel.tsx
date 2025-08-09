import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface RadialTouchWheelProps {
  value: number; // 0-100
  max: number;
  onChange: (value: number) => void;
  size?: number;
  disabled?: boolean;
}

export const RadialTouchWheel: React.FC<RadialTouchWheelProps> = ({
  value,
  max,
  onChange,
  size = 120,
  disabled = false,
}) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const lastAngleRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number>();

  const percentage = (value / max) * 100;
  const angle = (percentage / 100) * 360;

  useEffect(() => {
    setRotation(angle);
  }, [angle]);

  const getAngleFromEvent = (event: MouseEvent | TouchEvent) => {
    if (!wheelRef.current) return 0;

    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    angle = (angle + 360) % 360;

    return angle;
  };

  const handleStart = (event: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    
    event.preventDefault();
    setIsDragging(true);
    setVelocity(0);
    
    const angle = getAngleFromEvent(event.nativeEvent);
    lastAngleRef.current = angle;
    lastTimeRef.current = Date.now();

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging || disabled) return;

    event.preventDefault();
    const currentAngle = getAngleFromEvent(event);
    const currentTime = Date.now();
    
    let deltaAngle = currentAngle - lastAngleRef.current;
    
    // Handle angle wrap-around
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;
    
    const deltaTime = currentTime - lastTimeRef.current;
    if (deltaTime > 0) {
      setVelocity(deltaAngle / deltaTime);
    }

    const newRotation = rotation + deltaAngle;
    const clampedRotation = Math.max(0, Math.min(360, newRotation));
    
    setRotation(clampedRotation);
    
    const newValue = (clampedRotation / 360) * max;
    onChange(Math.round(newValue));

    lastAngleRef.current = currentAngle;
    lastTimeRef.current = currentTime;
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    
    // Apply kinetic scrolling
    if (Math.abs(velocity) > 0.1) {
      const startTime = Date.now();
      const startRotation = rotation;
      const initialVelocity = velocity * 100; // Scale velocity
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const friction = 0.95;
        const currentVelocity = initialVelocity * Math.pow(friction, elapsed / 16);
        
        if (Math.abs(currentVelocity) < 0.1) {
          return;
        }
        
        const newRotation = startRotation + (currentVelocity * elapsed / 16);
        const clampedRotation = Math.max(0, Math.min(360, newRotation));
        
        setRotation(clampedRotation);
        
        const newValue = (clampedRotation / 360) * max;
        onChange(Math.round(newValue));
        
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animate();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e);
    const handleMouseUp = () => handleEnd();
    const handleTouchMove = (e: TouchEvent) => handleMove(e);
    const handleTouchEnd = () => handleEnd();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, rotation, velocity]);

  const circumference = 2 * Math.PI * 45; // radius of 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div
        ref={wheelRef}
        className={`relative cursor-pointer select-none ${disabled ? 'opacity-50' : ''}`}
        style={{ width: size, height: size }}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
      >
        {/* Outer ring */}
        <svg
          width={size}
          height={size}
          className="absolute inset-0 transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={45}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={45}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-150 ease-out"
          />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF3CAC" />
              <stop offset="100%" stopColor="#784BA0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center knob */}
        <div
          className={`absolute inset-0 m-auto w-16 h-16 bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-150 ${
            isDragging ? 'scale-110 shadow-xl' : 'hover:scale-105'
          }`}
          style={{
            transform: `rotate(${rotation}deg) ${isDragging ? 'scale(1.1)' : ''}`,
          }}
        >
          <div className="w-2 h-6 bg-white rounded-full opacity-80"></div>
        </div>

        {/* Touch feedback */}
        {isDragging && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF3CAC]/20 to-[#784BA0]/20 animate-pulse"></div>
        )}
      </div>

      {/* Value display */}
      <div className="text-center">
        <div className="text-white font-mono text-lg">
          {Math.round(value)}
        </div>
        <div className="text-gray-400 text-xs">
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
};