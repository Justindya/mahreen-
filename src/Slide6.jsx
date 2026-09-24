import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Slide6 = ({ onReset }) => {
  const [showContent, setShowContent] = useState(false);

  // Mahreen mini logo
  const letters = "MAHREEN".split('');
  const baseRotations = [-6, -3, -1, 0, 1, 3, 6];
  const yOffsets = [3, 1, -1, -2, -1, 1, 3];
  const stickerShadow = `2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 0 #000`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 900); // 0.9s delay
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col items-center justify-between bg-[#F4EBE1] relative py-8 px-8 md:px-12 pointer-events-auto">

      {/* Header - Mini Logo */}
      <div className="absolute top-0 flex flex-col items-center w-full mt-6 z-10 pointer-events-none">
        <div className="relative flex justify-center scale-50 origin-top h-[50px] mb-2">
          <div className="absolute top-0 left-0 right-0 flex justify-center z-0">
            {letters.map((char, i) => (
              <span key={`mini-bg-${i}`} style={{ transform: `translateY(${yOffsets[i]}px) rotate(${baseRotations[i]}deg)`, fontFamily: "'Titan One', cursive, sans-serif", WebkitTextStroke: "6px black", textShadow: stickerShadow, color: "black" }} className="text-[5vw] md:text-[3vw] leading-none uppercase origin-bottom">{char}</span>
            ))}
          </div>
          <div className="relative flex justify-center z-10">
            {letters.map((char, i) => (
              <span key={`mini-fg-${i}`} style={{ transform: `translateY(${yOffsets[i]}px) rotate(${baseRotations[i]}deg)`, fontFamily: "'Titan One', cursive, sans-serif", WebkitTextStroke: "1.5px black", color: "white" }} className="text-[5vw] md:text-[3vw] leading-none uppercase origin-bottom">{char}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Zona Atas (Teks & Tombol) */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full flex flex-col items-center justify-start px-6 text-center select-none z-40 pointer-events-auto mt-28 md:mt-32 flex-shrink-0"
          >
            <div className="mb-4 w-full flex flex-col items-center">
              <h2 className="tracking-wide text-2xl md:text-4xl font-black text-black uppercase leading-tight" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                PRESENTASI SELESAI.
              </h2>
              <h3 className="tracking-wide text-xl md:text-3xl font-black text-neutral-800 uppercase leading-tight mt-2" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                SAATNYA MEMULAI EKSEKUSI.
              </h3>
            </div>
            <button
              onClick={onReset}
              className="px-6 py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black rounded-lg shadow-[3px_3px_0px_#000] hover:bg-neutral-100 hover:scale-105 active:translate-x-1 active:translate-y-1 transition-all cursor-pointer"
            >
              EKSPLORASI DARI AWAL
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zona Bawah (Ilustrasi Sampah) */}
      <div className="flex-grow w-full z-20 pointer-events-none mt-6 flex justify-center items-end pb-8">
        <div className="relative w-[280px] h-[216px] md:w-[360px] md:h-[278px] pointer-events-none z-20 flex-shrink-0">

          {/* Layer 1: Back (Inner rim and dark shadow gradient) z-10 */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <svg viewBox="0 0 440 340" className="w-full h-full">
              <defs>
                <linearGradient id="binDepth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#09090b" stopOpacity="0.9" />
                </linearGradient>
              </defs>
              <path d="M 10 30 C 10 10, 430 10, 430 30 L 360 340 L 80 340 Z" fill="url(#binDepth)" />
              <path d="M 10 30 C 10 10, 430 10, 430 30" fill="none" stroke="#3f3f46" strokeWidth="3" />
            </svg>
          </div>

          {/* Layer 2: Photorealistic Crumpled Paper Ball z-[15] */}
          <AnimatePresence>
            {showContent && (
              <motion.div
                initial={{ scale: 2.2, rotate: 0, x: "-50%", y: -300, opacity: 0, filter: "drop-shadow(0px 20px 25px rgba(0,0,0,0.3))" }}
                animate={{
                  scale: [2.2, 0.9, 0.75],
                  rotate: [0, 90, 180],
                  x: ["-50%", "-50%", "-50%"],
                  y: [-300, 40, 140],
                  opacity: 1
                }}
                transition={{
                  duration: 1.1,
                  times: [0, 0.6, 1],
                  ease: [0.25, 1, 0.5, 1]
                }}
                className="absolute top-0 left-1/2 z-[15] w-32 h-32 md:w-40 md:h-40 flex items-center justify-center font-black text-black/50 text-[12px] md:text-[14px] uppercase select-none"
                style={{
                  backgroundColor: "#FF7597",
                  clipPath: "polygon(12% 6%, 45% 0%, 82% 10%, 98% 35%, 90% 75%, 72% 96%, 30% 100%, 5% 82%, 0% 45%)",
                  boxShadow: "inset 10px 10px 20px rgba(0,0,0,0.3), inset -15px -15px 30px rgba(255,255,255,0.4), inset 5px -5px 15px rgba(0,0,0,0.4)",
                  backgroundImage: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 40%), linear-gradient(135deg, transparent 40%, rgba(0,0,0,0.3) 100%)"
                }}
              >
                <span style={{ transform: "rotate(-15deg)" }}>WACANA</span>

                {/* Crinkle overlay lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 mix-blend-multiply" viewBox="0 0 100 100">
                  <path d="M10 20 Q 30 50 80 10 M5 40 Q 50 60 90 30 M15 70 Q 60 90 95 60 M40 5 Q 50 50 30 95 M70 15 Q 60 50 80 90" fill="none" stroke="black" strokeWidth="2" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Layer 3: Front Wire Mesh (Pure CSS & SVG) z-30 */}
          <div className="absolute inset-0 z-30 pointer-events-none drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]">
            {/* Front Metallic Chrome Rim */}
            <div
              className="absolute top-0 left-0 w-full h-[60px] border-[4px] border-zinc-400 rounded-[50%]"
              style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
            ></div>

            {/* Front Mesh Grid */}
            <svg viewBox="0 0 440 340" className="w-full h-full opacity-85">
              {/* Outer Wire Frame */}
              <path d="M 10 30 L 80 340 L 360 340 L 430 30" fill="none" stroke="#a1a1aa" strokeWidth="2" />

              {/* Vertical Wires */}
              <line x1="52" y1="35" x2="110" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="94" y1="40" x2="140" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="136" y1="45" x2="170" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="178" y1="50" x2="200" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="220" y1="50" x2="220" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="262" y1="50" x2="240" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="304" y1="45" x2="270" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="346" y1="40" x2="300" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="388" y1="35" x2="330" y2="340" stroke="#a1a1aa" strokeWidth="1.5" />

              {/* Horizontal Wires */}
              <line x1="22" y1="80" x2="418" y2="80" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="33" y1="130" x2="407" y2="130" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="44" y1="180" x2="396" y2="180" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="55" y1="230" x2="385" y2="230" stroke="#a1a1aa" strokeWidth="1.5" />
              <line x1="66" y1="280" x2="374" y2="280" stroke="#a1a1aa" strokeWidth="1.5" />
            </svg>
          </div>

        </div>
      </div>

      {/* Footer Minimalis */}
      <div className="w-full flex justify-between items-end pb-2 font-bold text-[10px] md:text-xs font-sans tracking-widest text-black/60 uppercase z-50 pointer-events-none">
        <div>©2026 MAHREEN INDONESIA</div>
        <div>BERKARYA UNTUK INDONESIA</div>
      </div>
    </div>
  );
};

export default Slide6;
