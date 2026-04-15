import React, { useState, useRef, useEffect } from 'react';

const TRACKS = [
  {
    id: 1,
    title: "ERR_FILE_NOT_FOUND",
    artist: "UNKNOWN_ENTITY",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: 2,
    title: "CORRUPTED_SECTOR",
    artist: "SYS_ADMIN",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: 3,
    title: "GHOST_IN_THE_MACHINE",
    artist: "NULL_POINTER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration > 0) {
        setProgress((current / duration) * 100);
      }
    }
  };

  const handleTrackEnded = () => {
    handleNext();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex flex-col w-full h-full font-pixel">
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnded}
      />
      
      <div className="text-2xl text-[#ff00ff] mb-4 border-b-2 border-[#00ffff] pb-2">
        &gt; AUDIO_DECODER_v1.0
      </div>

      {/* Track Info */}
      <div className="flex-1 min-w-0 mb-6">
        <div className="text-3xl text-[#00ffff] truncate mb-1 glitch" data-text={currentTrack.title}>{currentTrack.title}</div>
        <div className="text-xl text-[#ff00ff] truncate">SRC: {currentTrack.artist}</div>
        
        {/* Progress Bar */}
        <div className="w-full h-6 bg-[#020202] border-2 border-[#00ffff] mt-4 relative overflow-hidden">
          <div 
            className="h-full bg-[#ff00ff] relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZjAwZmYiPjwvcmVjdD48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI0IiBmaWxsPSIjMDBmZmZmIj48L3JlY3Q+PC9zdmc+')] opacity-50 mix-blend-difference"></div>
          </div>
        </div>
        <div className="flex justify-between mt-1 text-sm text-[#00ffff]">
          <span>{Math.floor(progress)}%</span>
          <span className="animate-[pulse_0.5s_infinite]">{isPlaying ? 'DECODING...' : 'IDLE'}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 shrink-0">
        <button 
          onClick={handlePrev}
          className="bg-[#020202] border-2 border-[#00ffff] text-[#00ffff] px-4 py-2 text-xl hover:bg-[#00ffff] hover:text-[#020202] transition-none cursor-pointer"
        >
          [ &lt;&lt; ]
        </button>
        <button 
          onClick={togglePlay}
          className={`bg-[#020202] border-2 px-6 py-2 text-xl transition-none cursor-pointer ${isPlaying ? 'border-[#ff00ff] text-[#ff00ff] hover:bg-[#ff00ff] hover:text-[#020202]' : 'border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-[#020202]'}`}
        >
          {isPlaying ? '[ HALT ]' : '[ EXECUTE ]'}
        </button>
        <button 
          onClick={handleNext}
          className="bg-[#020202] border-2 border-[#00ffff] text-[#00ffff] px-4 py-2 text-xl hover:bg-[#00ffff] hover:text-[#020202] transition-none cursor-pointer"
        >
          [ &gt;&gt; ]
        </button>
        <button 
          onClick={toggleMute}
          className="ml-auto bg-[#020202] border-2 border-[#ff00ff] text-[#ff00ff] px-4 py-2 text-xl hover:bg-[#ff00ff] hover:text-[#020202] transition-none cursor-pointer"
        >
          {isMuted ? '[ UNMUTE ]' : '[ MUTE ]'}
        </button>
      </div>
    </div>
  );
}
