import React, { useState } from 'react';
import { toast } from 'sonner';
import { Settings as SettingsIcon } from 'lucide-react';
import JokeButton from '../components/JokeButton';
import JokeDisplay from '../components/JokeDisplay';
import Settings from '../components/Settings';
import { fetchDadJoke } from '../services/jokeService';

const Index: React.FC = () => {
  const [joke, setJoke] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const handleGenerateJoke = async () => {
    setIsLoading(true);
    try {
      const response = await fetchDadJoke();
      if (response.joke) {
        setJoke(response.joke);
      }
    } catch (error) {
      console.error('Error generating joke:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 text-cyber-blue/70 hover:text-cyber-blue transition-colors p-2 bg-black/30 rounded-full"
        aria-label="Open settings"
      >
        <SettingsIcon size={20} />
      </button>

      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-cyber-blue/10 backdrop-blur-sm border border-cyber-blue/20 rounded-full mb-4">
            <span className="text-cyber-blue text-xs font-mono tracking-widest">CYBERHUMOR v1.0</span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-3 tracking-tight"
            style={{ 
              textShadow: '0 0 10px rgba(10, 188, 249, 0.6), 0 0 20px rgba(10, 188, 249, 0.4)'
            }}
          >
            DAD JOKE
            <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent"> GENERATOR</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 font-mono">
            Press the button to receive an AI-generated dad joke.
            <br/>
            <span className="text-cyber-blue text-sm">Warning: Humor processors may cause excessive groaning.</span>
          </p>

          <div 
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage: 'radial-gradient(circle at center, rgba(10, 188, 249, 0.2) 0%, transparent 70%)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              zIndex: -1
            }}
          />
        </div>

        <JokeDisplay joke={joke} isLoading={isLoading} />

        <div className="mt-12">
          <JokeButton onClick={handleGenerateJoke} isLoading={isLoading} />
        </div>

        <div className="mt-10 text-xs text-cyber-blue/50 font-mono text-center">
          <p className="mt-1">* Powered by OpenAI's GPT models.</p>
        </div>
      </div>

      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};

export default Index;
