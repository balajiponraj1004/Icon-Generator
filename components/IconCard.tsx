import React, { useState } from 'react';
import { IconData } from '../types';
import { Copy, Download, Code } from 'lucide-react';

interface IconCardProps {
  icon: IconData;
}

const IconCard: React.FC<IconCardProps> = ({ icon }) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct full SVG for download/preview
  const svgContent = `
<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    ${icon.svgPath}
  </g>
</svg>`.trim();

  // Create a blob url for download
  const handleDownload = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${icon.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative bg-slate-900 rounded-xl border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Icon Preview */}
      <div className="h-40 flex items-center justify-center p-6 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative">
        <div className="absolute inset-0 bg-slate-950/50"></div>
        <div className="text-slate-200 w-16 h-16 transition-transform group-hover:scale-110 duration-300 relative z-10">
           <svg 
             viewBox="0 0 48 48" 
             className="w-full h-full"
             fill="none" 
             stroke="currentColor" 
             strokeWidth="2" 
             strokeLinecap="round" 
             strokeLinejoin="round"
             dangerouslySetInnerHTML={{ __html: icon.svgPath }}
           />
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20 backdrop-blur-sm">
            <button 
                onClick={handleDownload}
                className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-full text-white transition-colors border border-slate-700 hover:border-indigo-500"
                title="Download SVG"
            >
                <Download size={18} />
            </button>
            <button 
                onClick={() => setShowCode(!showCode)}
                className="p-2.5 bg-slate-800 hover:bg-indigo-600 rounded-full text-white transition-colors border border-slate-700 hover:border-indigo-500"
                title="View Code"
            >
                <Code size={18} />
            </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col border-t border-slate-800 bg-slate-900">
        <h3 className="font-semibold text-slate-200 text-sm truncate" title={icon.name}>{icon.name}</h3>
        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 uppercase tracking-wide font-medium">{icon.description}</p>
      </div>

      {/* Code Modal / Drawer */}
      {showCode && (
        <div className="absolute inset-0 bg-slate-950 z-30 flex flex-col p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-indigo-400">SVG Source</span>
                <button 
                    onClick={() => setShowCode(false)}
                    className="text-slate-400 hover:text-white"
                >
                    &times;
                </button>
            </div>
            <pre className="flex-1 overflow-auto text-[10px] text-slate-400 font-mono p-3 bg-slate-900 rounded border border-slate-800 custom-scrollbar">
                {svgContent}
            </pre>
            <button 
                onClick={handleCopyCode}
                className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
                {copied ? <span>Copied!</span> : <><Copy size={12} /> Copy SVG</>}
            </button>
        </div>
      )}
    </div>
  );
};

export default IconCard;