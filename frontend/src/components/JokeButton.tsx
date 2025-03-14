
import React from 'react';
import { Zap } from 'lucide-react';

interface JokeButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

const JokeButton: React.FC<JokeButtonProps> = ({ onClick, isLoading }) => {
  return (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className="cyber-button group relative w-64 h-16 text-lg font-orbitron font-semibold tracking-wider text-cyber-blue"
      aria-label="Generate Dad Joke"
    >
      <span className="relative z-10 flex items-center justify-center gap-3 transition-transform duration-300 group-hover:scale-105">
        {isLoading ? (
          <div className="animate-spin w-6 h-6 border-2 border-cyber-blue border-t-transparent rounded-full" />
        ) : (
          <Zap className="w-6 h-6 animate-pulse-glow text-cyber-blue" />
        )}
        <span className="cyber-glow">{isLoading ? "GENERATING..." : "GENERATE JOKE"}</span>
      </span>
      <span className="absolute inset-0 transform transition-transform duration-300 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10 opacity-0 group-hover:opacity-100" />
      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-cyber-blue transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
      <span className="absolute top-0 -left-0.5 bottom-0 w-0.5 bg-cyber-blue transform scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
      <span className="absolute top-0 -right-0.5 bottom-0 w-0.5 bg-cyber-blue transform scale-y-0 transition-transform duration-300 group-hover:scale-y-100" />
      <span className="absolute -top-0.5 left-0 right-0 h-0.5 bg-cyber-blue transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
    </button>
  );
};

export default JokeButton;
