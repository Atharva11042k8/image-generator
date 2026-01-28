import React from 'react';
import { GeneratedImage } from '../types';
import { Download, Trash2, Clock } from 'lucide-react';

interface ImageHistoryProps {
  images: GeneratedImage[];
  onSelect: (image: GeneratedImage) => void;
  onDelete: (id: string) => void;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ images, onSelect, onDelete }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-2 p-8 text-center border-l border-zinc-800 bg-zinc-900/50">
        <Clock size={32} className="opacity-50" />
        <p className="text-sm">No history yet.<br/>Generate something amazing!</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col border-l border-zinc-800 bg-zinc-900/50">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-medium text-zinc-300">History ({images.length})</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {images.map((img) => (
          <div key={img.id} className="group relative bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-indigo-500 transition-colors">
            <div 
              className="aspect-square w-full cursor-pointer bg-zinc-950" 
              onClick={() => onSelect(img)}
            >
              <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-xs text-zinc-400 line-clamp-2 mb-2" title={img.prompt}>{img.prompt}</p>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold px-1.5 py-0.5 rounded bg-zinc-900">
                  {img.model.includes('flash') ? 'Flash' : 'Pro'}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(img.id); }}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageHistory;