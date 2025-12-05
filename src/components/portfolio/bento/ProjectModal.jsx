import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ProjectModal = ({ project, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (project) {
      // Small timeout to allow render before animating in
      const timer = setTimeout(() => setIsVisible(true), 10);
      document.body.style.overflow = 'hidden';
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }
  }, [project]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500); // Wait for animation
  };

  if (!project) return null;

  // Images mapping - Hardcoded for demo as requested
  const projectImages = {
    'proj-00': [
      '/projects/coloreverday/coloreveryday.png',
      '/projects/coloreverday/coloreveryday-calendar.png'
    ],
    'proj-01': [
      '/projects/atlas/atlascentromando.png',
      '/projects/atlas/atlasfuego.png',
      '/projects/atlas/atlasinvernadero.png',
      '/projects/atlas/atlasmanos.png',
      '/projects/atlas/Atlasnotas.png'
    ],
    'proj-02': [
      '/projects/vrhat/vrhatintro.png',
      '/projects/vrhat/vrhatpiso.png'
    ]
  };

  const images = projectImages[project.id] || [];

  const ImagePlaceholder = ({ label }) => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0f0f16] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
      </div>
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
        <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <span className="text-gray-600 font-mono text-xs uppercase tracking-widest">{label}</span>
    </div>
  );

  return createPortal(
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-500 ${isVisible ? 'bg-black/80 backdrop-blur-sm' : 'bg-black/0 pointer-events-none'}`}
      onClick={handleClose}
    >
      <div 
        className={`
          bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row 
          w-[90vw] max-w-5xl h-[70vh] shadow-2xl 
          transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] transform origin-right
          ${isVisible ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-20'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Column 1: Project Info */}
        <div className="flex-1 p-8 md:p-10 flex flex-col overflow-y-auto border-r border-white/5 bg-gradient-to-b from-[#1a1a24] to-[#12121a]">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-mono text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded bg-purple-500/10">
                {project.year}
              </span>
              <span className="text-xs font-mono text-gray-500 uppercase tracking-wider">
                {project.role}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              {project.name}
            </h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
            <p>{project.description.normal}</p>
            
            {project.metrics && (
              <div className="bg-white/5 rounded-xl p-5 border border-white/5">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Key Metrics</h4>
                <ul className="space-y-2">
                  {project.metrics.map((metric, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-purple-400 mt-1">▹</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto pt-8 flex gap-4">
             <button className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200 transition-colors text-sm">
               View Case Study
             </button>
          </div>
        </div>

        {/* Column 2: Images Container */}
        <div className="hidden md:flex flex-col w-80 border-l border-white/5 overflow-y-auto bg-black/20">
          {/* Video Section */}
          {project.links?.video && (
            <div className="w-full aspect-video border-b border-white/5 shrink-0">
              <iframe 
                width="100%" 
                height="100%" 
                src={(() => {
                  const url = project.links.video;
                  if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
                  if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`;
                  return url;
                })()}
                title="Project Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          )}

          {/* Images Gallery */}
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div key={idx} className="w-full aspect-video relative overflow-hidden group border-b border-white/5 shrink-0">
                <img 
                  src={img} 
                  alt={`${project.name} preview ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-medium">Image {idx + 1}</span>
                </div>
              </div>
            ))
          ) : (
             !project.links?.video && (
              <div className="flex-1">
                <ImagePlaceholder label="Preview Unavailable" />
              </div>
             )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectModal;