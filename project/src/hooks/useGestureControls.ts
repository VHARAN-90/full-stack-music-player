import { useEffect, useRef, useState } from 'react';

interface GestureControlsHook {
  isGestureActive: boolean;
  gestureType: 'swipe' | 'shake' | 'clap' | null;
  swipeDirection: 'left' | 'right' | 'up' | 'down' | null;
  onSwipe: (callback: (direction: string, velocity: number) => void) => void;
  onShake: (callback: () => void) => void;
  onDoubleClap: (callback: () => void) => void;
}

export const useGestureControls = (): GestureControlsHook => {
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [gestureType, setGestureType] = useState<'swipe' | 'shake' | 'clap' | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  
  const swipeCallbackRef = useRef<((direction: string, velocity: number) => void) | null>(null);
  const shakeCallbackRef = useRef<(() => void) | null>(null);
  const clapCallbackRef = useRef<(() => void) | null>(null);
  
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const shakeThreshold = 15;
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const lastClapTime = useRef(0);

  // Initialize audio context for clap detection
  useEffect(() => {
    const initAudio = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        
        analyserRef.current.fftSize = 256;
        microphoneRef.current.connect(analyserRef.current);
        
        detectClaps();
      } catch (error) {
        console.log('Microphone access denied for clap detection');
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Clap detection
  const detectClaps = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkForClap = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
      
      // Detect sudden volume spike (clap)
      if (average > 100) {
        const now = Date.now();
        if (now - lastClapTime.current < 500 && now - lastClapTime.current > 100) {
          // Double clap detected
          setGestureType('clap');
          setIsGestureActive(true);
          if (clapCallbackRef.current) {
            clapCallbackRef.current();
          }
          setTimeout(() => {
            setIsGestureActive(false);
            setGestureType(null);
          }, 1000);
        }
        lastClapTime.current = now;
      }
      
      requestAnimationFrame(checkForClap);
    };

    checkForClap();
  };

  // Device motion for shake detection
  useEffect(() => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const { x, y, z } = event.accelerationIncludingGravity;
      const acceleration = Math.sqrt(x! * x! + y! * y! + z! * z!);
      const lastAccel = Math.sqrt(
        lastAcceleration.current.x * lastAcceleration.current.x +
        lastAcceleration.current.y * lastAcceleration.current.y +
        lastAcceleration.current.z * lastAcceleration.current.z
      );

      const delta = Math.abs(acceleration - lastAccel);

      if (delta > shakeThreshold) {
        setGestureType('shake');
        setIsGestureActive(true);
        if (shakeCallbackRef.current) {
          shakeCallbackRef.current();
        }
        setTimeout(() => {
          setIsGestureActive(false);
          setGestureType(null);
        }, 1000);
      }

      lastAcceleration.current = { x: x!, y: y!, z: z! };
    };

    if (typeof DeviceMotionEvent !== 'undefined') {
      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    return () => {
      if (typeof DeviceMotionEvent !== 'undefined') {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      }
    };
  }, []);

  const onSwipe = (callback: (direction: string, velocity: number) => void) => {
    swipeCallbackRef.current = callback;
  };

  const onShake = (callback: () => void) => {
    shakeCallbackRef.current = callback;
  };

  const onDoubleClap = (callback: () => void) => {
    clapCallbackRef.current = callback;
  };

  return {
    isGestureActive,
    gestureType,
    swipeDirection,
    onSwipe,
    onShake,
    onDoubleClap,
  };
};