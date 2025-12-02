import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { Button } from './components/Button';
import { ComparisonSlider } from './components/ComparisonSlider';
import { generateSketch } from './services/geminiService';
import { LoadingState, SketchOptions } from './types';
import { Eraser, PenTool, Download, RefreshCw, AlertCircle, Wand2 } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  const [options, setOptions] = useState<SketchOptions>({
    style: 'classic',
    intensity: 'medium',
  });

  const handleImageSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setGeneratedUrl(null);
    setError(null);
    setLoadingState(LoadingState.IDLE);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleGenerate = async () => {
    if (!previewUrl || !file) return;

    setLoadingState(LoadingState.LOADING);
    setError(null);

    try {
      // previewUrl is the base64 string
      const sketchUrl = await generateSketch(previewUrl, file.type, options);
      setGeneratedUrl(sketchUrl);
      setLoadingState(LoadingState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate sketch. Please try again.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setGeneratedUrl(null);
    setLoadingState(LoadingState.IDLE);
    setError(null);
  };

  const handleDownload = () => {
    if (!generatedUrl) return;
    const link = document.createElement('a');
    link.href = generatedUrl;
    link.download = `sketchify-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen text-charcoal-900 font-sans pb-20 paper-texture">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-charcoal-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-charcoal-900 rounded-lg text-white">
              <PenTool size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight font-handwriting">Sketchify AI</span>
          </div>
          {loadingState === LoadingState.LOADING && (
             <span className="text-sm text-charcoal-500 animate-pulse font-medium">
               Artist is working...
             </span>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        
        {/* API Key Check */}
        {!process.env.API_KEY && (
             <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center text-red-700">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                <p>Missing API Key. Please add <code className="bg-red-100 px-1 rounded">API_KEY</code> to your environment variables.</p>
             </div>
        )}

        {/* Hero Section */}
        {!previewUrl && (
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-extrabold text-charcoal-900 mb-6 tracking-tight">
              Turn Photos into <br/>
              <span className="text-charcoal-500 font-handwriting">Masterpiece Sketches</span>
            </h1>
            <p className="text-lg text-charcoal-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload any image and watch our AI artist meticulously convert it into a detailed pencil sketch in seconds.
            </p>
            
            <div className="max-w-xl mx-auto">
              <UploadZone onImageSelected={handleImageSelected} />
            </div>
          </div>
        )}

        {/* Workspace */}
        {previewUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl shadow-xl shadow-charcoal-200/50 p-6 border border-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Sketch Styles
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-charcoal-600 mb-2">Technique</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['classic', 'charcoal', 'minimalist', 'colored'] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setOptions({ ...options, style: s })}
                          className={`px-3 py-2 rounded-lg text-sm border-2 transition-all capitalize
                            ${options.style === s 
                              ? 'border-charcoal-800 bg-charcoal-800 text-white' 
                              : 'border-charcoal-100 text-charcoal-600 hover:border-charcoal-300'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-600 mb-2">Stroke Intensity</label>
                    <div className="flex bg-charcoal-50 p-1 rounded-xl">
                      {(['light', 'medium', 'heavy'] as const).map((i) => (
                        <button
                          key={i}
                          onClick={() => setOptions({ ...options, intensity: i })}
                          className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                            ${options.intensity === i 
                              ? 'bg-white shadow-sm text-charcoal-900' 
                              : 'text-charcoal-500 hover:text-charcoal-700'}`}
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    {loadingState !== LoadingState.SUCCESS ? (
                      <Button 
                        onClick={handleGenerate} 
                        isLoading={loadingState === LoadingState.LOADING}
                        disabled={!process.env.API_KEY}
                        className="w-full shadow-xl shadow-charcoal-900/10"
                      >
                        Generate Sketch
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                         <Button 
                          onClick={handleGenerate} 
                          variant="secondary"
                          className="flex-1"
                          isLoading={loadingState === LoadingState.LOADING}
                        >
                          Regenerate
                        </Button>
                         <Button 
                          onClick={handleDownload} 
                          className="flex-1"
                          leftIcon={<Download size={18}/>}
                        >
                          Save
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      variant="outline" 
                      onClick={handleReset} 
                      className="w-full border-dashed"
                      leftIcon={<Eraser size={18} />}
                    >
                      Clear Canvas
                    </Button>
                  </div>
                </div>
              </div>

               {/* Hint */}
               <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-blue-800 text-sm">
                  <p className="font-semibold mb-1 flex items-center"><PenTool className="w-3 h-3 mr-1"/> Pro Tip:</p>
                  <p className="opacity-80">Experiment with "Charcoal" for dramatic portraits or "Minimalist" for architectural photos.</p>
               </div>
            </div>

            {/* Main Preview Area */}
            <div className="lg:col-span-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center animate-in slide-in-from-top-2">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}

              {generatedUrl ? (
                 <div className="animate-in fade-in duration-700">
                    <div className="mb-4 flex items-center justify-between">
                       <h2 className="text-2xl font-handwriting font-bold text-charcoal-800">Result</h2>
                       <span className="text-xs font-mono text-charcoal-400 bg-charcoal-50 px-2 py-1 rounded">
                         Generated by Gemini 2.5 Flash
                       </span>
                    </div>
                   <ComparisonSlider originalImage={previewUrl} generatedImage={generatedUrl} />
                   <p className="text-center text-sm text-charcoal-500 mt-2">Drag the slider to compare</p>
                 </div>
              ) : (
                <div className="relative h-[500px] w-full bg-charcoal-100 rounded-2xl overflow-hidden border-4 border-white shadow-inner flex items-center justify-center group">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-contain"
                  />
                  {loadingState === LoadingState.LOADING && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-charcoal-200 border-t-charcoal-800 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <PenTool className="w-6 h-6 text-charcoal-800 animate-pulse" />
                        </div>
                      </div>
                      <p className="mt-4 font-handwriting text-2xl text-charcoal-800">Sketching details...</p>
                    </div>
                  )}
                  {loadingState === LoadingState.IDLE && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                          Original Image
                      </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;