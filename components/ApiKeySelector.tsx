import React from 'react';
import { Key } from 'lucide-react';
import Button from './Button';
import { promptApiKeySelection } from '../services/geminiService';

interface ApiKeySelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

const ApiKeySelector: React.FC<ApiKeySelectorProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const handleSelectKey = async () => {
    await promptApiKeySelection();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400">
            <Key size={32} />
          </div>
          <h2 className="text-xl font-bold text-white">API Key Required</h2>
          <p className="text-zinc-400 text-sm">
            To use the <strong>Pro</strong> model or high-resolution features, you must select a valid API key from a paid Google Cloud Project.
            <br /><br />
            See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">Billing Documentation</a> for more details.
          </p>
          <div className="flex gap-3 w-full mt-2">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSelectKey} className="flex-1">
              Select Key
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeySelector;