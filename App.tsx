import React, { useState } from 'react';
import { generateIconPack } from './services/geminiService';
import { generateIllustratorScript } from './utils/scriptGenerator';
import { IconPack, GenerationStatus } from './types';
import IconCard from './components/IconCard';
import { 
  Wand2, PenTool, LayoutGrid, Search, AlertCircle, Loader2, 
  Bot, Home, Bitcoin, Stethoscope, ShoppingCart, Cloud, Shield, 
  GraduationCap, Leaf, DollarSign, Gamepad2, Plane, Utensils, 
  Share2, Camera, Dumbbell, Building, Car, Music, Sun, FileCode
} from 'lucide-react';

const TRENDING_THEMES = [
  { name: 'Artificial Intelligence', icon: Bot },
  { name: 'Smart Home', icon: Home },
  { name: 'Cryptocurrency', icon: Bitcoin },
  { name: 'Medical & Health', icon: Stethoscope },
  { name: 'E-commerce', icon: ShoppingCart },
  { name: 'Cloud Computing', icon: Cloud },
  { name: 'Cyber Security', icon: Shield },
  { name: 'Education', icon: GraduationCap },
  { name: 'Eco & Nature', icon: Leaf },
  { name: 'Finance & Banking', icon: DollarSign },
  { name: 'Gaming', icon: Gamepad2 },
  { name: 'Travel', icon: Plane },
  { name: 'Food & Delivery', icon: Utensils },
  { name: 'Social Media', icon: Share2 },
  { name: 'Photography', icon: Camera },
  { name: 'Fitness', icon: Dumbbell },
  { name: 'Real Estate', icon: Building },
  { name: 'Automotive', icon: Car },
  { name: 'Music', icon: Music },
  { name: 'Weather', icon: Sun },
];

const App: React.FC = () => {
  const [themeInput, setThemeInput] = useState('');
  const [iconCount, setIconCount] = useState<10 | 50 | 100>(10);
  const [status, setStatus] = useState<GenerationStatus>({ status: 'idle' });
  const [progress, setProgress] = useState(0);
  const [iconPack, setIconPack] = useState<IconPack | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeInput.trim()) return;

    setStatus({ status: 'generating' });
    setProgress(0);
    setIconPack(null);
    setSelectedCategory('All');

    try {
      const result = await generateIconPack(themeInput, iconCount, (current, total) => {
        // Calculate percentage but cap at 98 until fully complete
        const percent = Math.min(Math.round((current / total) * 100), 98);
        setProgress(percent);
      });
      
      setIconPack(result);
      setProgress(100);
      setStatus({ status: 'success' });
    } catch (error: any) {
      console.error("App Error:", error);
      setStatus({ status: 'error', message: error.message || "Something went wrong." });
    }
  };

  const handleThemeSelect = (themeName: string) => {
    setThemeInput(themeName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadScript = () => {
    if (!iconPack) return;
    const scriptContent = generateIllustratorScript(iconPack);
    const blob = new Blob([scriptContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${iconPack.packName.replace(/\s+/g, '_')}_script.jsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const allIcons = iconPack ? iconPack.categories.flatMap(c => c.icons.map(i => ({...i, category: c.name}))) : [];
  
  const filteredIcons = allIcons.filter(icon => {
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          icon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                
                <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setStatus({ status: 'idle' })}>
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <PenTool className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">IconGenius AI</h1>
                        <p className="text-xs text-slate-400">Senior Icon Design Architect</p>
                    </div>
                </div>

                <form onSubmit={handleGenerate} className="flex-1 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Wand2 className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            value={themeInput}
                            onChange={(e) => setThemeInput(e.target.value)}
                            placeholder="Describe your icon theme..."
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-inner"
                        />
                    </div>

                    <div className="bg-slate-950 p-1 rounded-lg border border-slate-700 flex shrink-0">
                      {[10, 50, 100].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setIconCount(count as 10 | 50 | 100)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                            iconCount === count 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                    </div>

                    <button 
                        type="submit" 
                        disabled={status.status === 'generating'}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all whitespace-nowrap min-w-[140px]
                            ${status.status === 'generating' 
                                ? 'bg-indigo-800 cursor-not-allowed opacity-80' 
                                : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/25'}`}
                    >
                        {status.status === 'generating' ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" /> {progress}%
                            </span>
                        ) : (
                          `Generate Pack`
                        )}
                    </button>
                </form>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Idle State */}
        {status.status === 'idle' && (
            <div className="space-y-10 animate-in fade-in duration-700">
                <div className="text-center py-10 space-y-4">
                    <h2 className="text-4xl font-bold text-white tracking-tight">Generate Professional SVG Icons</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Select a trending category or describe your own custom theme. <br/>
                        Our AI generates pixel-perfect, consistent icon packs ready for Illustrator.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {TRENDING_THEMES.map((theme) => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeSelect(theme.name)}
                            className="group flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 text-center hover:shadow-xl hover:shadow-indigo-500/5"
                        >
                            <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ring-1 ring-slate-800 group-hover:ring-indigo-500/30 shadow-inner">
                                <theme.icon className="text-indigo-400 group-hover:text-indigo-300" size={24} />
                            </div>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white">{theme.name}</span>
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* Loading State */}
        {status.status === 'generating' && (
            <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-300">
                <div className="w-full max-w-md space-y-8 text-center">
                    <div className="relative inline-block">
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full"></div>
                        <Loader2 className="relative text-indigo-500 animate-spin mx-auto drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" size={64} />
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-semibold text-white mb-2">Architecting Icons</h3>
                        <p className="text-slate-500">
                          Creating {iconCount} distinct {themeInput} vector assets...<br/>
                          <span className="text-xs text-slate-600">This may take up to a minute for large packs.</span>
                        </p>
                    </div>

                    <div className="w-full bg-slate-800/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                         <div className="py-2 border border-slate-800 rounded bg-slate-900/50">Vector Paths</div>
                         <div className="py-2 border border-slate-800 rounded bg-slate-900/50">Grid Align</div>
                         <div className="py-2 border border-slate-800 rounded bg-slate-900/50">Optimization</div>
                    </div>
                </div>
            </div>
        )}

        {/* Error State */}
        {status.status === 'error' && (
            <div className="rounded-xl bg-red-950/30 border border-red-900/50 p-8 flex flex-col items-center text-center gap-4 max-w-lg mx-auto mt-12 animate-in zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-red-900/20 flex items-center justify-center mb-2">
                    <AlertCircle className="text-red-500" size={24} />
                </div>
                <div>
                    <h3 className="text-xl font-medium text-red-400 mb-2">Generation Interrupted</h3>
                    <p className="text-red-300/70 text-sm leading-relaxed mb-6">{status.message}</p>
                    <button 
                        onClick={() => setStatus({ status: 'idle' })}
                        className="px-6 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-sm font-medium rounded-lg transition-colors border border-red-900/30"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        )}

        {/* Success / Results State */}
        {status.status === 'success' && iconPack && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Pack Header */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row gap-6 md:items-end justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                             <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                                AI Generated
                             </span>
                             <span className="text-slate-500 text-xs font-mono">
                                {new Date().toLocaleDateString()}
                             </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">{iconPack.packName}</h2>
                        <p className="text-slate-400 max-w-xl">{iconPack.description}</p>
                    </div>
                    
                    <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
                         <button 
                            onClick={handleDownloadScript}
                            className="flex items-center justify-center gap-2 w-full md:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-emerald-900/20 group"
                        >
                            <FileCode size={18} />
                            <span>Download Illustrator Script (.jsx)</span>
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="sticky top-20 z-10 bg-slate-950/80 backdrop-blur-md py-4 border-b border-slate-800/50 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:static flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                        >
                            All
                        </button>
                        {/* We removed explicit categories for stability, but kept the structure. Usually just 'General' now */}
                        {iconPack.categories.length > 1 && iconPack.categories.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                        <input 
                            type="text" 
                            placeholder="Filter icons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                    {filteredIcons.map((icon, idx) => (
                        <IconCard key={`${icon.name}-${idx}`} icon={icon} />
                    ))}
                </div>

                {filteredIcons.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                        <div className="text-slate-500 mb-2">No icons found in this category.</div>
                        <button onClick={() => setSelectedCategory('All')} className="text-indigo-400 text-sm font-medium hover:underline">View all generated icons</button>
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  );
};

export default App;