import React, { useState } from 'react';
import { generateIconPack } from './services/geminiService';
import { IconPack, GenerationStatus } from './types';
import IconCard from './components/IconCard';
import { 
  Wand2, PenTool, LayoutGrid, Search, AlertCircle, Loader2, 
  Bot, Home, Bitcoin, Stethoscope, ShoppingCart, Cloud, Shield, 
  GraduationCap, Leaf, DollarSign, Gamepad2, Plane, Utensils, 
  Share2, Camera, Dumbbell, Building, Car, Music, Sun
} from 'lucide-react';

// Trending Themes Data
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
  const [iconPack, setIconPack] = useState<IconPack | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeInput.trim()) return;

    setStatus({ status: 'generating' });
    setIconPack(null);
    setSelectedCategory('All');

    try {
      const result = await generateIconPack(themeInput, iconCount);
      setIconPack(result);
      setStatus({ status: 'success' });
    } catch (error: any) {
      setStatus({ status: 'error', message: error.message });
    }
  };

  const handleThemeSelect = (themeName: string) => {
    setThemeInput(themeName);
    // Optionally auto-focus input or scroll up
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter Logic
  const allIcons = iconPack ? iconPack.categories.flatMap(c => c.icons.map(i => ({...i, category: c.name}))) : [];
  
  const filteredIcons = allIcons.filter(icon => {
    const matchesCategory = selectedCategory === 'All' || icon.category === selectedCategory;
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          icon.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      
      {/* Header / Hero */}
      <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                
                {/* Logo Area */}
                <div className="flex items-center gap-3 shrink-0">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <PenTool className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-tight">IconGenius AI</h1>
                        <p className="text-xs text-slate-400">Senior Icon Design Architect</p>
                    </div>
                </div>

                {/* Controls Area */}
                <form onSubmit={handleGenerate} className="flex-1 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    
                    {/* Input */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Wand2 className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            value={themeInput}
                            onChange={(e) => setThemeInput(e.target.value)}
                            placeholder="Enter a theme (e.g., Medical, Crypto...)"
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-700 rounded-lg leading-5 bg-slate-950 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
                        />
                    </div>

                    {/* Quantity Selector */}
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

                    {/* Submit */}
                    <button 
                        type="submit" 
                        disabled={status.status === 'generating'}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all whitespace-nowrap
                            ${status.status === 'generating' 
                                ? 'bg-indigo-800 cursor-not-allowed opacity-80' 
                                : 'bg-indigo-600 hover:bg-indigo-500'}`}
                    >
                        {status.status === 'generating' ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" /> Generating...
                            </span>
                        ) : (
                          `Generate ${iconCount} Icons`
                        )}
                    </button>
                </form>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Idle State: Trending Grid */}
        {status.status === 'idle' && (
            <div className="space-y-8 animate-in fade-in duration-700">
                <div className="text-center py-8">
                    <h2 className="text-3xl font-bold text-white mb-3">Trending Themes</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Select a popular category below to instantly configure your icon pack, or type a custom theme above. 
                        Choose between 10, 50, or 100 consistent icons.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {TRENDING_THEMES.map((theme) => (
                        <button
                            key={theme.name}
                            onClick={() => handleThemeSelect(theme.name)}
                            className="group flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all duration-300 text-center"
                        >
                            <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ring-1 ring-slate-800 group-hover:ring-indigo-500/30">
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
            <div className="flex flex-col items-center justify-center py-32 animate-pulse">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                    <Loader2 className="relative text-indigo-500 animate-spin mb-4" size={48} />
                </div>
                <h3 className="text-xl font-medium text-white">Crafting {iconCount} {themeInput} icons...</h3>
                <div className="mt-2 flex flex-col items-center gap-1">
                    <p className="text-slate-500 text-sm">Applying 2px stroke consistency</p>
                    <p className="text-slate-500 text-sm">Setting 48px grid alignment</p>
                    <p className="text-slate-500 text-sm">Refining Bézier curves</p>
                </div>
            </div>
        )}

        {/* Error State */}
        {status.status === 'error' && (
            <div className="rounded-lg bg-red-900/20 border border-red-900/50 p-6 flex items-start gap-4 max-w-2xl mx-auto mt-8">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-lg font-medium text-red-400">Generation Failed</h3>
                    <p className="text-red-300/80 mt-1">{status.message}</p>
                    <button 
                        onClick={() => setStatus({ status: 'idle' })}
                        className="mt-4 text-sm text-red-400 hover:text-red-300 underline underline-offset-4"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )}

        {/* Results View */}
        {status.status === 'success' && iconPack && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                
                {/* Pack Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                        <button 
                            onClick={() => setStatus({ status: 'idle' })}
                            className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 hover:text-indigo-300 transition-colors"
                        >
                            ← Back to Trends
                        </button>
                        <h2 className="text-3xl font-bold text-white">{iconPack.packName}</h2>
                        <p className="text-slate-400 mt-2 max-w-2xl">{iconPack.description}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-white">{allIcons.length}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wide font-medium">Icons Generated</div>
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory('All')}
                            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === 'All' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                        >
                            All
                        </button>
                        {iconPack.categories.map(cat => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.name ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                        <input 
                            type="text" 
                            placeholder="Find icon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filteredIcons.map((icon, idx) => (
                        <IconCard key={`${icon.name}-${idx}`} icon={icon} />
                    ))}
                </div>

                {filteredIcons.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                        <div className="text-slate-500">No icons found matching your filters.</div>
                        <button onClick={() => setSelectedCategory('All')} className="text-indigo-400 text-sm mt-2 hover:underline">Clear filters</button>
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  );
};

export default App;