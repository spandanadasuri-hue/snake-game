import React, { useState, useEffect } from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

const DiagnosticOverlay = ({ title, description }: { title: string, description: string }) => (
  <div className="absolute inset-0 z-50 bg-[#020202]/90 flex flex-col items-center justify-center p-6 text-center border-4 border-[#ff00ff] animate-[pulse_0.1s_infinite]">
    <div className="text-[#ff00ff] font-pixel text-4xl mb-3 glitch" data-text={title}>{title}</div>
    <div className="text-[#00ffff] text-2xl font-pixel leading-relaxed">{description}</div>
    <div className="mt-4 text-[#ff00ff] text-xl">ERR_SYS_OVERRIDE // MEMORY_LEAK_DETECTED</div>
  </div>
);

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isDiagnosticMode, setIsDiagnosticMode] = useState(false);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  return (
    <div className="min-h-screen bg-[#020202] text-[#00ffff] flex items-center justify-center p-6 font-pixel overflow-hidden">
      <div className="scanlines"></div>
      <div className="noise"></div>
      
      <div className="w-full max-w-[1024px] flex flex-col gap-6 h-full max-h-[900px] relative z-10">
        
        {/* Header */}
        <header className="flex items-center justify-between w-full border-b-4 border-[#ff00ff] pb-4">
          <div className="text-5xl font-pixel tracking-tighter flex items-center gap-4">
            <span className="glitch text-[#ff00ff]" data-text="SYS.CORE">SYS.CORE</span>
            <span className="text-[#00ffff]">::</span>
            <span className="glitch" data-text="SNAKE_PROTOCOL">SNAKE_PROTOCOL</span>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsDiagnosticMode(!isDiagnosticMode)}
              className={`px-4 py-2 text-2xl font-pixel border-4 transition-all cursor-pointer ${
                isDiagnosticMode 
                  ? 'border-[#ff00ff] text-[#020202] bg-[#ff00ff] animate-[pulse_0.2s_infinite]' 
                  : 'border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff] hover:text-[#020202]'
              }`}
            >
              {isDiagnosticMode ? '[ DIAGNOSTICS: ACTIVE ]' : '[ DIAGNOSTICS: INACTIVE ]'}
            </button>
            <div className="flex items-center gap-3 text-2xl text-[#ff00ff] animate-pulse">
              <div className="w-4 h-4 bg-[#ff00ff]"></div>
              LINK_ESTABLISHED
            </div>
          </div>
        </header>

        {/* Glitch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full flex-1 min-h-0">
          
          {/* Game Arena */}
          <div className="col-span-1 md:col-span-2 bg-[#020202] border-4 border-[#00ffff] p-2 flex flex-col items-center justify-center relative shadow-[8px_8px_0px_#ff00ff]">
            {isDiagnosticMode && (
              <DiagnosticOverlay 
                title="SECTOR_7G_ARENA" 
                description="MEMORY CORRUPTION DETECTED. ENTITY 'SNAKE' CONSUMING ORPHANED POINTERS." 
              />
            )}
            <SnakeGame onScoreChange={setScore} />
            <div className="mt-4 text-2xl text-[#ff00ff] glitch" data-text="INPUT: WASD / ARROWS">INPUT: WASD / ARROWS</div>
          </div>

          {/* Sidebar */}
          <div className="col-span-1 flex flex-col gap-8">
            
            {/* Score */}
            <div className="bg-[#020202] border-4 border-[#ff00ff] p-6 flex flex-col justify-center relative shadow-[8px_8px_0px_#00ffff]">
              {isDiagnosticMode && (
                <DiagnosticOverlay 
                  title="MEM_ALLOCATION" 
                  description="TRACKING CONSUMED BYTES. BUFFER OVERFLOW IMMINENT." 
                />
              )}
              <div className="text-2xl text-[#00ffff] mb-2">CURRENT_CYCLES</div>
              <div className="text-7xl font-pixel text-[#ff00ff]">{score.toString().padStart(6, '0')}</div>
            </div>

            {/* High Score */}
            <div className="bg-[#020202] border-4 border-[#00ffff] p-6 flex flex-col justify-center relative shadow-[8px_8px_0px_#ff00ff]">
              {isDiagnosticMode && (
                <DiagnosticOverlay 
                  title="PEAK_RESONANCE" 
                  description="MAXIMUM HISTORICAL BYTE CONSUMPTION LOGGED." 
                />
              )}
              <div className="text-2xl text-[#ff00ff] mb-2">MAX_CYCLES</div>
              <div className="text-7xl font-pixel text-[#00ffff]">{highScore.toString().padStart(6, '0')}</div>
            </div>

            {/* Music Player */}
            <div className="flex-1 bg-[#020202] border-4 border-[#ff00ff] p-6 flex flex-col justify-center relative shadow-[8px_8px_0px_#00ffff]">
              {isDiagnosticMode && (
                <DiagnosticOverlay 
                  title="AUDIO_SUBSYSTEM" 
                  description="DECODING ENCRYPTED FREQUENCIES. PLAYBACK MAY CAUSE AUDITORY HALLUCINATIONS." 
                />
              )}
              <MusicPlayer />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
