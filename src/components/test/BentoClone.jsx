import React from 'react';

const BentoClone = () => {
  // Radius of the "bite" in pixels.
  // The orb is roughly 160px (w-40) + padding. Let's say 100px radius for the cut.
  const biteRadius = '100px';

  return (
    <div className="min-h-screen bg-[#050509] text-white p-8 font-sans flex items-center justify-center overflow-hidden">
      <div className="relative max-w-7xl w-full aspect-video">
        
        {/* Grid Container */}
        <div className="grid grid-cols-4 grid-rows-4 gap-4 w-full h-full">
          
          {/* --- COLUMN 1 --- */}
          
          {/* 1. Effortless Prompt Perfection (Top Left) */}
          <div className="col-start-1 row-start-1 row-span-2 bg-[#13131f] rounded-3xl p-6 flex flex-col justify-between border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/20"></div>
            <div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <span className="text-xl font-bold">P</span>
              </div>
              <h2 className="text-3xl font-medium leading-tight text-gray-100">
                Effortless<br />
                <span className="text-gray-400">Prompt</span><br />
                Perfection
              </h2>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">14 days trial</p>
              <p className="text-xs text-gray-600">after - $5/month</p>
            </div>
          </div>

          {/* 5. 12K Happy Users (Bottom Left 1) */}
          <div className="col-start-1 row-start-3 bg-[#13131f] rounded-3xl p-6 flex flex-col justify-center border border-white/5">
             <h3 className="text-4xl font-bold text-orange-200 mb-1 text-center">12K</h3>
             <p className="text-xs text-gray-500 text-center mb-4">happy users</p>
             <div className="flex justify-center -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#13131f] bg-gray-700 overflow-hidden">
                     <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
             </div>
          </div>

          {/* 6. Generate Button (Bottom Left 2) */}
          <div className="col-start-1 row-start-4 bg-[#13131f] rounded-3xl p-6 flex items-center justify-center border border-white/5">
             <button className="w-full py-3 px-6 bg-[#6d28d9] hover:bg-[#5b21b6] text-white rounded-full font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/20">
                <span>Generate</span>
             </button>
          </div>


          {/* --- CENTER COLUMN (2 & 3) --- */}

          {/* 2. Your AI Prompt Companion (Top Center) */}
          <div 
            className="col-start-2 col-span-2 row-start-1 row-span-2 bg-[#5b21b6] rounded-3xl p-8 flex flex-col items-center text-center relative overflow-hidden border border-white/10"
            style={{
              maskImage: `radial-gradient(circle at 50% calc(100% + 8px), transparent ${biteRadius}, black ${biteRadius})`,
              WebkitMaskImage: `radial-gradient(circle at 50% calc(100% + 8px), transparent ${biteRadius}, black ${biteRadius})`
            }}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#7c3aed] to-[#4c1d95] opacity-100"></div>
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center h-full pt-4">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <span className="text-yellow-300">✨</span>
                <span className="text-sm font-medium tracking-wide">PromptPal</span>
              </div>
              <h1 className="text-5xl font-bold mb-2 tracking-tight">Your AI Prompt</h1>
              <h1 className="text-5xl font-bold mb-8 tracking-tight text-purple-100">Companion</h1>
              
              {/* Decorative rings inside the card (clipped by mask) */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full pointer-events-none"></div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full pointer-events-none"></div>
            </div>
          </div>

          {/* 7. Branching Paths (Bottom Center Left) */}
          <div 
            className="col-start-2 row-start-3 row-span-2 bg-[#13131f] rounded-3xl p-6 flex flex-col justify-end border border-white/5 relative group overflow-hidden"
            style={{
              maskImage: `radial-gradient(circle at calc(100% + 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`,
              WebkitMaskImage: `radial-gradient(circle at calc(100% + 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`
            }}
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-orange-500/50 to-transparent"></div>
             <div className="absolute top-20 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_10px_orange]"></div>
             
             <div className="absolute top-24 left-0 w-full h-32 opacity-20">
                <svg width="100%" height="100%">
                   <path d="M100 0 Q 100 50 50 100" stroke="orange" fill="none" strokeWidth="2" />
                   <path d="M100 0 Q 100 50 150 100" stroke="orange" fill="none" strokeWidth="2" />
                </svg>
             </div>

             <div className="relative z-10">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center mb-3 text-orange-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-1">Branching paths</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Explore multiple prompt directions with branching.</p>
             </div>
          </div>

          {/* 8. Keyword Enhancer (Bottom Center Right) */}
          <div 
            className="col-start-3 row-start-3 row-span-2 bg-[#13131f] rounded-3xl p-6 flex flex-col justify-end border border-white/5 relative overflow-hidden"
            style={{
              maskImage: `radial-gradient(circle at calc(0% - 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`,
              WebkitMaskImage: `radial-gradient(circle at calc(0% - 8px) calc(0% - 8px), transparent ${biteRadius}, black ${biteRadius})`
            }}
          >
             <div className="absolute top-10 right-4 w-2 h-10 bg-purple-500/20 rounded-full blur-sm"></div>
             <div className="absolute top-20 right-8 w-1 h-1 bg-purple-400 rounded-full shadow-[0_0_5px_purple]"></div>

             <div className="relative z-10">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-200 mb-1">Keyword enhancer</h3>
                <p className="text-xs text-gray-500 leading-relaxed">Boost your prompt precision with keywords.</p>
             </div>
          </div>


          {/* --- COLUMN 4 --- */}

          {/* 3. Toggle Switch (Top Right) */}
          <div className="col-start-4 row-start-1 bg-[#13131f] rounded-3xl p-6 flex items-center justify-center border border-white/5">
            <div className="w-full h-full flex items-center justify-center">
               <div className="w-20 h-10 bg-[#2a2a35] rounded-full p-1 relative cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg flex items-center justify-center translate-x-10">
                     <span className="text-white text-xs">✨</span>
                  </div>
               </div>
            </div>
          </div>

          {/* 4. 25M Created Prompts (Middle Right) */}
          <div className="col-start-4 row-start-2 bg-[#13131f] rounded-3xl p-6 flex flex-col justify-center border border-white/5 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="text-5xl font-bold text-purple-200 mb-2">25M</h3>
               <div className="flex items-center gap-2">
                  <div className="h-px bg-purple-500/50 w-4"></div>
                  <p className="text-sm text-gray-400">created prompts</p>
                  <div className="h-px bg-purple-500/50 w-4"></div>
               </div>
             </div>
             <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
          </div>

          {/* 9. Prompt Templates (Bottom Right) */}
          <div className="col-start-4 row-start-3 row-span-2 bg-[#13131f] rounded-3xl p-6 flex flex-col border border-white/5 relative">
             <h3 className="text-lg font-semibold text-gray-200 mb-2">Prompt templates</h3>
             <p className="text-xs text-gray-500 mb-6">Use pre-made templates to jumpstart creativity.</p>
             
             <div className="relative flex-1">
                <div className="absolute right-0 top-0 bg-[#2a2a35] px-3 py-1 rounded-full text-xs border border-white/10 rotate-12 translate-x-2">14 days trial</div>
                
                <div className="absolute bottom-10 left-0 flex flex-col gap-2">
                   <div className="bg-[#2a2a35] px-3 py-1.5 rounded-full text-xs border border-white/10 w-fit flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span> Rewrite
                   </div>
                   <div className="bg-[#2a2a35] px-3 py-1.5 rounded-full text-xs border border-white/10 w-fit flex items-center gap-1 ml-4">
                      <span>🎁</span>
                   </div>
                </div>

                <div className="absolute bottom-0 right-0 flex flex-col gap-2 items-end">
                   <div className="flex gap-1 -rotate-45 origin-bottom-right">
                      <span className="text-[10px] text-gray-600">JPG</span>
                      <span className="text-[10px] text-gray-400">PNG</span>
                      <span className="text-[10px] text-gray-600">PDF</span>
                   </div>
                   <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                   </div>
                </div>
             </div>
          </div>

        </div>

        {/* CENTRAL ORB - Positioned absolutely in the center of the grid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none z-50 flex items-center justify-center">
           {/* Outer Ring (Visual Border for the cutouts) */}
           {/* Since we can't easily border the cutouts, we place a ring here that matches the cut radius */}
           {/* biteRadius is 100px, so diameter is 200px */}
           <div className="absolute inset-0 rounded-full border border-white/10 shadow-[0_0_30px_rgba(124,58,237,0.2)]"></div>
           
           {/* Inner Spinning Rings */}
           <div className="absolute w-[180px] h-[180px] border border-white/5 rounded-full animate-[spin_10s_linear_infinite]"></div>
           <div className="absolute w-[160px] h-[160px] border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
           
           {/* Core Orb */}
           <div className="w-32 h-32 rounded-full bg-black relative overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.6)] border border-white/20">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 via-purple-600 to-blue-500 opacity-80 blur-md animate-pulse"></div>
              <div className="absolute inset-2 bg-black rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30"></div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-50 animate-[spin_3s_linear_infinite]"></div>
              </div>
           </div>
           
           {/* Floating Code Text */}
           <div className="absolute text-[8px] text-white/30 font-mono tracking-widest w-full text-center top-1/2 -translate-y-1/2 rotate-12 pointer-events-none">
              100 110101 100011
           </div>
        </div>

      </div>
    </div>
  );
};

export default BentoClone;
