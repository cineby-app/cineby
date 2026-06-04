"use client";

import { useState, useEffect } from 'react';
import { Terminal, Radio, Send, CheckCircle2, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  const sprocketHoles = Array.from({ length: 40 });
  const [problemType, setProblemType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Automatic countdown reset for the confirmation popup
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSent && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isSent && countdown === 0) {
      setIsSent(false);
      setCountdown(5);
    }
    return () => clearTimeout(timer);
  }, [isSent, countdown]);

  const handleTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate high-fidelity secure processing
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#030307] pt-32 pb-24 px-4 relative overflow-hidden selection:bg-[#b50000] selection:text-white flex items-center justify-center">
      
      {/* Infinite celluloid loop animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scrollDown {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes scrollUp {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .animate-film-down {
          animation: scrollDown 18s linear infinite;
        }
        .animate-film-up {
          animation: scrollUp 18s linear infinite;
        }
      `}} />

      {/* Ambient Theater Projector Radiance */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(181,0,0,0.15),rgba(181,0,0,0.02)_45%,transparent_70%)] pointer-events-none" />
      <div className="absolute w-96 h-96 bg-[#b50000]/5 rounded-full filter blur-[130px] pointer-events-none" />

      {/* ================= HIGH-END CENTERED CELLULOID CONSOLE ================= */}
      <div className="w-full max-w-xl relative border-x border-zinc-800/40 bg-gradient-to-b from-zinc-950/60 to-black/80 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden">
        
        {/* LEFT COMPONENT FILM TRACK */}
        <div className="hidden sm:block absolute -left-[30px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
          <div className="flex flex-col gap-5 py-2 animate-film-down h-[200%]">
            {sprocketHoles.map((_, i) => (
              <div key={`left-${i}`} className="w-2.5 h-4 border border-zinc-700/60 rounded-[3px] bg-gradient-to-b from-zinc-900 to-zinc-950 shrink-0" />
            ))}
          </div>
        </div>

        {/* RIGHT COMPONENT FILM TRACK */}
        <div className="hidden sm:block absolute -right-[30px] top-4 bottom-4 w-3 overflow-hidden pointer-events-none opacity-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
          <div className="flex flex-col gap-5 py-2 animate-film-up h-[200%]">
            {sprocketHoles.map((_, i) => (
              <div key={`right-${i}`} className="w-2.5 h-4 border border-zinc-700/60 rounded-[3px] bg-gradient-to-b from-zinc-900 to-zinc-950 shrink-0" />
            ))}
          </div>
        </div>

        {/* INTERFACE PANEL BODY */}
        <div className="p-6 sm:p-10 relative z-10">
          
          {!isSent ? (
            /* CONSOLE CAPTURE SYSTEM */
            <form onSubmit={handleTransmission} className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
              
              {/* Header inside the console wrapper */}
              <div className="text-center pb-4 border-b border-zinc-900/80 relative">
                <div className="absolute top-0 left-0 text-[9px] font-mono text-zinc-600 tracking-widest font-bold">SYS // CORE_INTAKE</div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-red-500/20 bg-red-950/30 backdrop-blur-md mb-3">
                  <Radio className="w-3.5 h-3.5 text-[#b50000] animate-pulse" />
                  <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest font-extrabold">TRANSMISSION LINK</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">PATCH INTO CINEBY</h1>
                <p className="text-zinc-500 text-xs mt-1 font-light">Identify your query path to open the secure console.</p>
              </div>

              {/* DYNAMIC FIELD: PROBLEM CATEGORY SELECT */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Select the Subject Matter</label>
                <div className="relative">
                  <select
                    required
                    value={problemType}
                    onChange={(e) => setProblemType(e.target.value)}
                    className="w-full bg-zinc-950/90 border border-zinc-800 rounded-lg px-4 py-3.5 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#b50000] focus:ring-1 focus:ring-[#b50000]/30 transition-all duration-300 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>-- Select the core issue --</option>
                    <option value="api_error" className="bg-zinc-950 text-white">TMDB Query Error / API Timeouts</option>
                    <option value="account_vault" className="bg-zinc-950 text-white">Account Vault & Sync Problems</option>
                    <option value="ui_glitch" className="bg-zinc-950 text-white">Interface Mosaic Render Bugs</option>
                    <option value="curator_feature" className="bg-zinc-950 text-white">Feature Requests / Ideation</option>
                    <option value="other" className="bg-zinc-950 text-white">Other Issues // Unlisted</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 text-xs font-mono">
                    ▼
                  </div>
                </div>
              </div>

              {/* DYNAMIC SUBTITLE INDICATION FOR "OTHER" OPTION */}
              {problemType === "other" && (
                <div className="p-3 bg-zinc-900/30 border border-dashed border-zinc-800/80 rounded-lg flex items-center gap-2.5 text-xs text-zinc-400 font-light animate-[slideDown_0.25s_ease-out]">
                  <style dangerouslySetInnerHTML={{__html: `@keyframes slideDown { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }`}} />
                  <HelpCircle className="w-4 h-4 text-[#b50000] shrink-0" />
                  <span>Unmapped signal. Detail your custom context explicitly in the interface block below.</span>
                </div>
              )}

              {/* IDENTIFIER FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Curator Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Cinephile"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#b50000] focus:ring-1 focus:ring-[#b50000]/30 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Secure Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="curator@cineby.app"
                    className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#b50000] focus:ring-1 focus:ring-[#b50000]/30 transition-all duration-300"
                  />
                </div>
              </div>

              {/* MESSAGE TEXTAREA */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">Transmission Core Payload</label>
                <textarea 
                  rows={5} 
                  required 
                  placeholder={problemType === "other" ? "Provide complete customized details here..." : "Type your technical logs or notes here..."}
                  className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-[#b50000] focus:ring-1 focus:ring-[#b50000]/30 transition-all duration-300 resize-none h-32"
                />
              </div>

              {/* SUBMISSION ACTION BUTTON */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full group relative flex items-center justify-center gap-2 bg-gradient-to-r from-[#900000] to-[#b50000] hover:from-[#b50000] hover:to-[#e60000] text-white font-mono uppercase text-xs font-bold tracking-widest py-4 px-6 rounded-lg shadow-[0_4px_20px_rgba(181,0,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/5 skew-x-[-20deg] -translate-x-full group-hover:animate-[shine_0.75s_ease-in-out]" />
                <style dangerouslySetInnerHTML={{__html: `@keyframes shine { 100% { transform: translateX(300%); } }`}} />
                {isSubmitting ? (
                  <>
                    <Terminal className="w-4 h-4 animate-spin text-zinc-400" />
                    <span>Engaging Uplink...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    <span>Send Transmission</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* POPUP CONFIRMATION INTERACTION OVERLAY */
            <div className="text-center space-y-6 py-12 animate-[fadeIn_0.4s_ease-out] relative">
              <style dangerouslySetInnerHTML={{__html: `@keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }`}} />
              
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-[#b50000]/20 rounded-full animate-ping opacity-75" />
                <div className="absolute inset-2 bg-gradient-to-br from-[#900000] to-[#b50000] rounded-full shadow-[0_0_25px_rgba(181,0,0,0.4)]" />
                <CheckCircle2 className="w-8 h-8 text-white relative z-10 drop-shadow-md" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto">
                <h3 className="text-xl font-black uppercase text-white tracking-tight">
                  LOG SAVED & TRANSMITTED
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  Your secure payload completely bypassed standard filter obstacles and successfully reached the operations console.
                </p>
              </div>

              {/* Visual Cooldown Bar Component */}
              <div className="inline-flex flex-col items-center gap-2 pt-4">
                <span className="font-mono text-[9px] text-zinc-600 tracking-widest uppercase">
                  [ Recycling Console in 0:0{countdown} ]
                </span>
                <div className="w-32 h-[2px] bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#b50000] transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}