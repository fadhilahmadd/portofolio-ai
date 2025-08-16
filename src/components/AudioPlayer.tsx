import { Play, Pause } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerProps {
  audioUrl: string;
}

export const AudioPlayer = ({ audioUrl }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Define the ended handler using useCallback to keep its reference stable
  const onEnded = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    // Create and configure the new audio element
    const newAudio = new Audio(audioUrl);
    audioRef.current = newAudio;
    newAudio.addEventListener('ended', onEnded);

    // If the component was already in a "playing" state, start the new audio
    if (isPlaying) {
      newAudio.play().catch(e => console.error("Error playing new audio:", e));
    }

    // Cleanup function: runs when audioUrl changes or component unmounts
    return () => {
      newAudio.pause();
      newAudio.removeEventListener('ended', onEnded);
    };
  }, [audioUrl, onEnded]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.error("Error playing audio:", e));
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <button
      onClick={togglePlayPause}
      className="mt-2 flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
    >
      {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
    </button>
  );
};