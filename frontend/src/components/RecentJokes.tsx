
import React, { useState, useEffect } from 'react';
import { History } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

interface Joke {
  id: number;
  joke_text: string;
  created_at: string;
}

interface RecentJokesProps {
  isOpen: boolean;
  onClose: () => void;
}

const RecentJokes: React.FC<RecentJokesProps> = ({ isOpen, onClose }) => {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRecentJokes();
    }
  }, [isOpen]);

  const fetchRecentJokes = async () => {
    setLoading(true);
    try {
      // In development, use localhost:8000
      // In production, use relative URL since frontend and backend are in same container
      const API_URL = import.meta.env.PROD
        ? '/jokes/recent'
        : 'http://localhost:8000/jokes/recent';

      const response = await fetch(API_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recent jokes: ${response.status}`);
      }
      
      const data = await response.json();
      setJokes(data);
    } catch (error: any) {
      console.error('Error fetching recent jokes:', error);
      toast.error(`Failed to fetch recent jokes: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm">
      <div 
        className="cyber-panel w-full max-w-3xl p-6 m-4 overflow-hidden animate-slide-up"
        style={{
          background: 'linear-gradient(to bottom, rgba(18, 18, 18, 0.95), rgba(18, 18, 18, 0.98))'
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-orbitron flex items-center gap-2 text-cyber-blue cyber-glow">
            <History size={22} className="text-cyber-blue" />
            <span>RECENT JOKE ARCHIVE</span>
          </h2>
          
          <button 
            onClick={onClose} 
            className="cyber-button px-4 py-2 text-sm"
            aria-label="Close recent jokes"
          >
            <span className="font-mono text-cyber-blue">[ CLOSE ]</span>
          </button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="h-1 w-48 bg-cyber-blue/20 overflow-hidden rounded mb-4">
              <div className="h-full w-1/2 bg-cyber-blue animate-[slide_1.5s_ease-in-out_infinite]" 
                   style={{
                     backgroundImage: 'linear-gradient(90deg, transparent, rgba(10, 188, 249, 0.8), transparent)'
                   }} 
              />
            </div>
            <p className="text-cyber-blue/70 font-mono animate-pulse">ACCESSING DATABASE...</p>
          </div>
        ) : jokes.length > 0 ? (
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-cyber-blue/30">
                  <TableHead className="text-cyber-blue font-mono">#ID</TableHead>
                  <TableHead className="text-cyber-blue font-mono">JOKE</TableHead>
                  <TableHead className="text-cyber-blue font-mono text-right">TIMESTAMP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jokes.map((joke) => (
                  <TableRow 
                    key={joke.id}
                    className="border-b border-cyber-blue/10 hover:bg-cyber-blue/5 transition-colors"
                  >
                    <TableCell className="font-mono text-cyber-blue/80">{joke.id}</TableCell>
                    <TableCell>{joke.joke_text}</TableCell>
                    <TableCell className="font-mono text-xs text-right text-cyber-blue/60">
                      {formatDate(joke.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-cyber-blue/70 font-mono">NO JOKES FOUND IN DATABASE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentJokes;
