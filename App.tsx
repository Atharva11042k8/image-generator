import React, { useState, useEffect, useRef } from 'react';
import { 
  Wand2, 
  Image as ImageIcon, 
  Download, 
  Maximize2, 
  Trash2, 
  Settings2,
  Sparkles,
  Upload,
  X
} from 'lucide-react';
import { 
  AspectRatio, 
  GeneratedImage, 
  ModelType, 
  GenerationConfig 
} from './types';
import { 
  ASPECT_RATIO_OPTIONS, 
  DEFAULT_ASPECT_RATIO, 
  DEFAULT_MODEL, 
  MODEL_OPTIONS 
} from './constants';
import { generateImage, checkApiKeySelection, promptApiKeySelection } from './services/geminiService';
import Button from './components/Button';
import { TextArea, Select } from './components/Input';
import ApiKeySelector from './components/ApiKeySelector';
import ImageHistory from './components/ImageHistory';

// Types specifically for component state
type AppMode = 'generate' | 'edit';

function App() {
  // State
  const [mode, setMode] = useState<AppMode>('generate');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(DEFAULT_ASPECT_RATIO);
  const [model, setModel] = useState<ModelType>(DEFAULT_MODEL);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [referenceImageMime, setReferenceImageMime] = useState<string | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from local storage if desired, keeping it simple for now
  useEffect(() => {
    // Optional: Load history from localStorage
  }, []);

  // Handle Generate
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setError(null);

    // Check Key for Pro
    if (model === ModelType.PRO) {
      const hasKey = await checkApiKeySelection();
      if (!hasKey) {
        setShowKeySelector(true);
        return;
      }
    }

    setIsGenerating(true);
    try {
      const config: GenerationConfig = {
        prompt,
        aspectRatio,
        model,
        referenceImage: referenceImage ? referenceImage.split(',')[1] : undefined,
        referenceImageMimeType: referenceImageMime || undefined
      };

      const imageUrl = await generateImage(config);

      const newImage: GeneratedImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt,
        model,
        timestamp: Date.now(),
        aspectRatio
      };

      setCurrentImage(newImage);
      setHistory(prev => [newImage, ...prev]);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size too large. Please use an image under 5MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setReferenceImage(result);
        setReferenceImageMime(file.type);
        setMode('edit'); // Switch to edit mode automatically
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    setReferenceImageMime(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = `lumina-${currentImage.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Lumina Studio
            </h1>
          </div>

          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setMode('generate')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'generate' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Generate
            </button>
            <button
              onClick={() => setMode('edit')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === 'edit' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Edit
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          
          {/* Controls Panel */}
          <div className="w-80 border-r border-zinc-800 bg-zinc-900/30 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 z-10">
            
            {/* Mode Specific Inputs */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                {mode === 'generate' ? <Wand2 size={18} className="text-indigo-400"/> : <ImageIcon size={18} className="text-indigo-400"/>}
                {mode === 'generate' ? 'Text to Image' : 'Image Editing'}
              </h2>
              
              <div className="space-y-1">
                <TextArea
                  label="Prompt"
                  placeholder={mode === 'generate' ? "A futuristic city with flying cars, neon lights, rainy atmosphere..." : "Describe how to change the image (e.g., 'Make it snowy')"}
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="h-32 text-sm leading-relaxed"
                />
              </div>

              {/* Image Upload for Edit Mode */}
              {mode === 'edit' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Reference Image</label>
                  {!referenceImage ? (
                    <div 
                      className="border-2 border-dashed border-zinc-700 rounded-lg p-6 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all cursor-pointer text-center group"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-zinc-500 group-hover:text-indigo-400" />
                      <p className="text-xs text-zinc-400">Click to upload image</p>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden border border-zinc-700 group">
                      <img src={referenceImage} alt="Reference" className="w-full h-32 object-cover opacity-70" />
                      <button 
                        onClick={clearReferenceImage}
                        className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-md text-white hover:bg-red-500/80 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Configs */}
            <div className="space-y-4">
               <h3 className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <Settings2 size={14} /> Configuration
               </h3>
               
               <Select 
                  label="Aspect Ratio"
                  options={ASPECT_RATIO_OPTIONS}
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
               />

               <Select
                  label="Model"
                  options={MODEL_OPTIONS}
                  value={model}
                  onChange={(e) => setModel(e.target.value as ModelType)}
               />
               
               {model === ModelType.PRO && (
                 <p className="text-xs text-amber-500/80 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                   Note: Pro model requires a paid API key selection.
                 </p>
               )}
            </div>

            <div className="mt-auto">
              <Button 
                onClick={handleGenerate} 
                className="w-full" 
                isLoading={isGenerating}
                disabled={!prompt || (mode === 'edit' && !referenceImage)}
              >
                {mode === 'generate' ? 'Generate Image' : 'Edit Image'}
              </Button>
              {error && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                  {error}
                </div>
              )}
            </div>

          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-black/40 relative flex items-center justify-center p-8 overflow-hidden">
             {/* Background Grid Pattern */}
             <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '24px 24px'
             }}></div>

             {currentImage ? (
               <div className="relative max-w-full max-h-full flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
                  <div className="relative group rounded-lg overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                    <img 
                      src={currentImage.url} 
                      alt={currentImage.prompt} 
                      className="max-h-[80vh] object-contain w-auto h-auto bg-zinc-900"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-center p-4 opacity-0 group-hover:opacity-100">
                       <div className="flex gap-2">
                          <Button variant="secondary" onClick={handleDownload} className="backdrop-blur-md bg-black/50 border-white/10 text-white" icon={<Download size={16}/>}>
                            Download
                          </Button>
                       </div>
                    </div>
                  </div>
               </div>
             ) : (
               <div className="text-center text-zinc-600 space-y-4">
                  <div className="w-24 h-24 bg-zinc-900/50 rounded-2xl mx-auto flex items-center justify-center border border-zinc-800">
                    <Sparkles className="w-10 h-10 opacity-20" />
                  </div>
                  <p>Your imagination is the limit.<br/>Enter a prompt to begin.</p>
               </div>
             )}
          </div>

          {/* Right Sidebar - History */}
          <div className="w-72 shrink-0 hidden lg:block h-full">
            <ImageHistory 
              images={history} 
              onSelect={(img) => {
                setCurrentImage(img);
                setPrompt(img.prompt);
                setModel(img.model);
                if(img.aspectRatio) setAspectRatio(img.aspectRatio);
              }}
              onDelete={(id) => {
                setHistory(prev => prev.filter(img => img.id !== id));
                if (currentImage?.id === id) setCurrentImage(null);
              }}
            />
          </div>
        </div>
      </div>

      <ApiKeySelector 
        isVisible={showKeySelector} 
        onClose={() => setShowKeySelector(false)} 
      />
    </div>
  );
}

export default App;