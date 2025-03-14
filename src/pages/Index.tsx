
import React, { useState } from 'react';
import { toast } from 'sonner';
import JokeButton from '../components/JokeButton';
import JokeDisplay from '../components/JokeDisplay';
import { fetchDadJoke } from '../services/jokeService';

const Index: React.FC = () => {
  const [joke, setJoke] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateJoke = async () => {
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      toast.error('Please set your OpenAI API key in the environment variables (VITE_OPENAI_API_KEY)');
      setError('Missing OpenAI API key. Please set VITE_OPENAI_API_KEY in your environment variables.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchDadJoke();
      if (response.joke) {
        setJoke(response.joke);
      }
      if (response.error) {
        setError(response.error);
      }
    } catch (error: any) {
      console.error('Error generating joke:', error);
      setError(error.message || 'Failed to generate joke');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
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

        <JokeDisplay joke={joke} isLoading={isLoading} error={error} />

        <div className="mt-12">
          <JokeButton onClick={handleGenerateJoke} isLoading={isLoading} />
        </div>

        <div className="mt-10 text-xs text-cyber-blue/50 font-mono text-center">
          <p>* API key required. Set VITE_OPENAI_API_KEY in your environment.</p>
          <p className="mt-1">* Powered by OpenAI's GPT models.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
