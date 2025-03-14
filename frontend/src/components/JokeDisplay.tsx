
import React, { useEffect, useRef } from 'react';

interface JokeDisplayProps {
  joke: string;
  isLoading: boolean;
}

const JokeDisplay: React.FC<JokeDisplayProps> = ({ joke, isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (joke && containerRef.current) {
      containerRef.current.classList.add('animate-glitch');
      
      const timer = setTimeout(() => {
        containerRef.current?.classList.remove('animate-glitch');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [joke]);

  return (
    <div 
      ref={containerRef}
      className="cyber-panel w-full max-w-2xl min-h-[160px] p-6 flex items-center justify-center text-center mt-8 transition-all duration-300"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 text-cyber-blue/70">
          <div className="h-1 w-48 bg-cyber-blue/20 overflow-hidden rounded">
            <div className="h-full w-1/2 bg-cyber-blue animate-[slide_1.5s_ease-in-out_infinite]" 
                 style={{
                   backgroundImage: 'linear-gradient(90deg, transparent, rgba(10, 188, 249, 0.8), transparent)',
                   animation: 'slide 1.5s ease-in-out infinite'
                 }} />
          </div>
          <span className="text-sm font-mono animate-pulse">SCANNING HUMOR DATABASE...</span>
        </div>
      ) : joke ? (
        <p 
          className="font-mono text-xl leading-relaxed text-white animate-fade-in"
          style={{
            textShadow: '0 0 5px rgba(10, 188, 249, 0.8), 0 0 10px rgba(10, 188, 249, 0.4)'
          }}
        >
          {joke}
        </p>
      ) : (
        <p className="text-cyber-blue/50 font-mono text-base">
          Press the button to generate a dad joke
        </p>
      )}
    </div>
  );
};

export default JokeDisplay;
