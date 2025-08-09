import { useEffect, useRef, useState } from 'react';

interface MoodDetectionHook {
  currentMood: 'happy' | 'sad' | 'energetic' | 'calm' | 'neutral';
  confidence: number;
  isDetecting: boolean;
  startDetection: () => void;
  stopDetection: () => void;
}

export const useMoodDetection = (): MoodDetectionHook => {
  const [currentMood, setCurrentMood] = useState<'happy' | 'sad' | 'energetic' | 'calm' | 'neutral'>('neutral');
  const [confidence, setConfidence] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyzeFacialExpression = (imageData: ImageData) => {
    // Simplified mood detection based on image brightness and contrast
    const data = imageData.data;
    let brightness = 0;
    let contrast = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;
      brightness += gray;
    }
    
    brightness /= (data.length / 4);
    
    // Calculate contrast
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = (r + g + b) / 3;
      contrast += Math.abs(gray - brightness);
    }
    
    contrast /= (data.length / 4);
    
    // Simple mood classification based on brightness and contrast
    if (brightness > 150 && contrast > 30) {
      return { mood: 'happy' as const, confidence: 0.8 };
    } else if (brightness < 100 && contrast < 20) {
      return { mood: 'sad' as const, confidence: 0.7 };
    } else if (contrast > 50) {
      return { mood: 'energetic' as const, confidence: 0.6 };
    } else if (brightness > 120 && contrast < 25) {
      return { mood: 'calm' as const, confidence: 0.5 };
    }
    
    return { mood: 'neutral' as const, confidence: 0.3 };
  };

  const analyzeAudioMood = () => {
    if (!analyserRef.current) return { mood: 'neutral' as const, confidence: 0 };

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Analyze frequency distribution for mood
    const lowFreq = dataArray.slice(0, bufferLength / 4).reduce((sum, val) => sum + val, 0);
    const midFreq = dataArray.slice(bufferLength / 4, bufferLength / 2).reduce((sum, val) => sum + val, 0);
    const highFreq = dataArray.slice(bufferLength / 2).reduce((sum, val) => sum + val, 0);

    const total = lowFreq + midFreq + highFreq;
    if (total === 0) return { mood: 'neutral' as const, confidence: 0 };

    const lowRatio = lowFreq / total;
    const midRatio = midFreq / total;
    const highRatio = highFreq / total;

    if (highRatio > 0.4) {
      return { mood: 'energetic' as const, confidence: 0.7 };
    } else if (lowRatio > 0.5) {
      return { mood: 'sad' as const, confidence: 0.6 };
    } else if (midRatio > 0.4) {
      return { mood: 'happy' as const, confidence: 0.5 };
    } else {
      return { mood: 'calm' as const, confidence: 0.4 };
    }
  };

  const startDetection = async () => {
    try {
      setIsDetecting(true);
      
      // Initialize camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.style.display = 'none';
        document.body.appendChild(videoRef.current);
      }
      
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
        canvasRef.current.width = 320;
        canvasRef.current.height = 240;
      }

      videoRef.current.srcObject = stream;
      videoRef.current.play();

      // Initialize audio analysis
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Start detection loop
      detectionIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
            const imageData = ctx.getImageData(0, 0, 320, 240);
            
            const visualMood = analyzeFacialExpression(imageData);
            const audioMood = analyzeAudioMood();
            
            // Combine visual and audio analysis
            const combinedConfidence = (visualMood.confidence + audioMood.confidence) / 2;
            const finalMood = combinedConfidence > 0.5 ? 
              (visualMood.confidence > audioMood.confidence ? visualMood.mood : audioMood.mood) :
              'neutral';
            
            setCurrentMood(finalMood);
            setConfidence(combinedConfidence);
          }
        }
      }, 2000); // Check every 2 seconds

    } catch (error) {
      console.error('Failed to start mood detection:', error);
      setIsDetecting(false);
    }
  };

  const stopDetection = () => {
    setIsDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.remove();
      videoRef.current = null;
    }
    
    if (canvasRef.current) {
      canvasRef.current.remove();
      canvasRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, []);

  return {
    currentMood,
    confidence,
    isDetecting,
    startDetection,
    stopDetection,
  };
};