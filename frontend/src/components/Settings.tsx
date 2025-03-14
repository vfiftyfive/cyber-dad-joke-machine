
import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { toast } from 'sonner';
import { getApiKey, setApiKey } from '../utils/storage';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKeyState] = useState(getApiKey());

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }
    
    setApiKey(apiKey.trim());
    toast.success('API key saved successfully');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="cyber-panel w-full max-w-md p-6 rounded-lg relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-cyber-blue/70 hover:text-cyber-blue transition-colors"
          aria-label="Close settings"
        >
          <X size={20} />
        </button>
        
        <h2 
          className="text-2xl font-orbitron font-bold mb-6 text-center"
          style={{ 
            textShadow: '0 0 10px rgba(10, 188, 249, 0.6), 0 0 20px rgba(10, 188, 249, 0.4)'
          }}
        >
          Settings
        </h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-mono text-cyber-blue mb-2">
              OpenAI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKeyState(e.target.value)}
              className="w-full bg-black/60 border border-cyber-blue/30 text-white font-mono p-2 rounded focus:outline-none focus:border-cyber-blue"
              placeholder="sk-..."
            />
            <p className="mt-2 text-xs text-cyber-blue/50 font-mono">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="bg-cyber-blue/20 hover:bg-cyber-blue/30 text-cyber-blue font-mono py-2 px-4 rounded flex items-center gap-2 transition-colors border border-cyber-blue/40"
            >
              <Save size={16} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
