import './index.css';
import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Slide6 from './Slide6';

// --- Audio Manager ---
const audioSources = {
  marker: { local: '/sounds/marker.mp3', fallback: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' },
  click: { local: '/sounds/click.mp3', fallback: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  'modal-open': { local: '/sounds/modal-open.mp3', fallback: 'https://assets.mixkit.co/active_storage/sfx/2405/2405-preview.mp3' },
  'modal-close': { local: '/sounds/modal-close.mp3', fallback: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  'envelope-open': { local: '/sounds/envelope-open.mp3', fallback: 'https://assets.mixkit.co/active_storage/sfx/2405/2405-preview.mp3' },
  pop: { local: '/sounds/pop.mp3', fallback: 'https://cdn.freesound.org/previews/399/399303_5121236-lq.mp3' },
  bgm: { local: '/sounds/bgm.mp3', fallback: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3' }
};

const audioCache = {};
export let isGlobalMuted = true;

// Preload all audio to ensure perfect sync (zero delay on first play)
if (typeof window !== 'undefined') {
  Object.keys(audioSources).forEach(type => {
    const source = audioSources[type];
    const audio = new Audio(source.local);
    audio.preload = "auto";
    audio.onerror = () => {
      if (source.fallback && audio.src !== source.fallback) {
        audio.src = source.fallback;
      }
    };
    if (type === 'bgm') {
      audio.loop = true;
      audio.volume = 0.2;
    } else if (type === 'marker') {
      audio.volume = 1.0;
    } else {
      audio.volume = 0.5;
    }
    audioCache[type] = audio;
  });
}

const fadeAudioIn = (audio, targetVolume, duration) => {
  if (!audio) return;
  audio.volume = 0;
  const stepTime = 50;
  const steps = duration / stepTime;
  const volumeStep = targetVolume / steps;

  clearInterval(audio.fadeInterval);
  audio.fadeInterval = setInterval(() => {
    let newVolume = audio.volume + volumeStep;
    if (newVolume >= targetVolume) {
      audio.volume = targetVolume;
      clearInterval(audio.fadeInterval);
    } else {
      audio.volume = newVolume;
    }
  }, stepTime);
};

export const setGlobalMute = (muted) => {
  isGlobalMuted = muted;
  if (!muted) {
    if (audioCache['bgm']) {
      audioCache['bgm'].play().catch(() => { });
    }
  } else if (audioCache['bgm']) {
    audioCache['bgm'].pause();
  }
};

export const playSound = (type) => {
  if (typeof window === 'undefined') return;

  const audio = audioCache[type];
  if (!audio) return;

  if (type === 'bgm') {
    if (!isGlobalMuted) audio.play().catch(() => { });
    return;
  }

  if (isGlobalMuted) return;

  if (type === 'pop' || type === 'click' || type === 'marker') {
    const clone = audio.cloneNode();
    clone.volume = audio.volume;
    clone.play().catch(() => { });

    // Sesuaikan durasi suara marker dengan animasi (500ms) dan logika ducking BGM
    if (type === 'marker') {
      const bgm = audioCache['bgm'];
      if (bgm && !isGlobalMuted) {
        bgm.volume = 0;
        bgm.play().catch(() => { });
      }
      setTimeout(() => {
        clone.pause();
        if (bgm && !isGlobalMuted) {
          fadeAudioIn(bgm, 0.2, 800);
        }
      }, 500);
    }
  } else {
    audio.currentTime = 0;
    audio.play().catch(() => { });
  }
};


// --- Ornaments for Slide 1 ---
const StickyNote = () => (
  <img
    src={`${import.meta.env.BASE_URL}stickynote.png`}
    alt="Sticky Note"
    className="absolute pointer-events-none select-none z-10"
    style={{
      width: 'clamp(240px, 24vw, 340px)',
      top: '-35px',
      left: '-25px',
      transform: 'rotate(-18deg)',
      filter: 'drop-shadow(12px 14px 18px rgba(0, 0, 0, 0.22))'
    }}
  />
);

const HighlighterMarker = () => (
  <img
    src={`${import.meta.env.BASE_URL}highlighter.png`}
    alt="Highlighter"
    className="absolute pointer-events-none select-none z-20"
    style={{
      width: 'clamp(280px, 32vw, 420px)',
      top: '0%',
      right: 'calc(-4% - 240px)',
      transform: 'rotate(28deg)',
      transformOrigin: 'top right',
      filter: 'drop-shadow(-14px 18px 20px rgba(0, 0, 0, 0.22))'
    }}
  />
);

const RealisticMarkerStroke = () => (
  <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-1 opacity-95" fill="#CCFF00" style={{ transform: "scale(1.05, 1.3)" }}>
    <path d="M 1 12 C 15 8, 45 5, 80 8 C 95 10, 99 5, 99 15 C 99 30, 98 75, 99 85 C 98 96, 85 93, 50 96 C 25 98, 5 95, 2 85 C -1 70, 0 25, 1 12 Z" />
    <path d="M 0 20 Q 3 15, 5 25 Q 2 60, 0 80 Z" fill="#CCFF00" opacity="0.5" />
    <path d="M 98 15 Q 101 25, 99 40 Q 102 70, 98 85 Z" fill="#CCFF00" opacity="0.5" />
  </svg>
);

// --- Transition Components ---
const InterstitialScreen = ({ targetSlide }) => {
  const slideLabel = targetSlide === 1 ? "SLIDE 1" : targetSlide === 2 ? "SLIDE 2" : targetSlide === 3 ? "SLIDE 3" : targetSlide === 4 ? "SLIDE 4" : "SLIDE 5";
  const rawText = targetSlide === 1 ? "COVER SLIDE" : targetSlide === 2 ? "MASALAHNYA" : targetSlide === 3 ? "SOLUSINYA" : targetSlide === 4 ? "BUKTI NYATA" : "AMBIL PERANMU";

  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 - 22 : 0);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight - 100 : 0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX - 22);
      mouseY.set(e.clientY - 22);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const containerVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.3, delayChildren: 0.1 } },
    exit: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const wordContainerVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    exit: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const wordVariants = {
    hidden: { opacity: 1 },
    show: { opacity: 1, transition: { staggerChildren: 0.03 } },
    exit: { opacity: 1, transition: { staggerChildren: 0.02 } }
  };

  const letterVariantsSmall = {
    hidden: { y: 40, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { y: -40, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
  };

  const letterVariantsBig = {
    hidden: { y: 80, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { y: -80, opacity: 0, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="exit"
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-[#F3EBDD] overflow-hidden cursor-none"
    >
      <motion.div variants={containerVariants} className="flex flex-col items-center pointer-events-none">
        {/* FIRST SENTENCE */}
        <motion.div variants={wordContainerVariants} className="text-sm font-medium tracking-[0.4em] mb-12 uppercase text-gray-800 font-sans flex flex-wrap justify-center gap-x-3 pointer-events-none">
          {slideLabel.split(" ").map((word, wIdx) => (
            <motion.span key={wIdx} variants={wordVariants} className="flex">
              {word.split("").map((char, cIdx) => (
                <motion.span key={cIdx} variants={letterVariantsSmall} style={{ display: "inline-block" }}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
          ))}
        </motion.div>

        {/* SECOND SENTENCE */}
        <motion.div variants={wordContainerVariants} className="text-6xl md:text-8xl lg:text-9xl font-black text-black tracking-tight uppercase text-center flex flex-wrap justify-center gap-x-6 gap-y-4 px-4 pointer-events-none" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
          {rawText.split(" ").map((word, wIdx) => (
            <motion.span key={wIdx} variants={wordVariants} className="flex">
              {word.split("").map((char, cIdx) => (
                <motion.span key={cIdx} variants={letterVariantsBig} style={{ display: "inline-block" }}>
                  {char}
                </motion.span>
              ))}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { duration: 0.5, delay: 0.8 } },
          exit: { opacity: 0, transition: { duration: 0.2 } }
        }}
        className="fixed top-0 left-0 pointer-events-none z-[80]"
        style={{ x: mouseX, y: mouseY }}
      >
        <svg
          width="44"
          height="44"
          viewBox="-4 -4 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="z-[80]"
        >
          {/* Glass interior (white) */}
          <path d="M7 6 L11.5 12 L7 18 H17 L12.5 12 L17 6 Z" fill="white" />

          {/* Sand in bottom half */}
          <path d="M11.5 12 L17 18 H7 Z" fill="black" />

          {/* Glass Body Outlines */}
          <path d="M7 6 L11.5 12 L7 18" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6 L12.5 12 L17 18" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Lids */}
          <rect x="4" y="2" width="16" height="4" rx="2" fill="white" stroke="black" strokeWidth="2.5" />
          <rect x="4" y="18" width="16" height="4" rx="2" fill="white" stroke="black" strokeWidth="2.5" />
        </svg>
      </motion.div>
    </motion.div>
  );
};

const SlideUpCurtain = ({ triggerKey, bgColor }) => {
  if (!triggerKey) return null;
  return (
    <motion.div
      key={triggerKey}
      initial={{ y: "100vh" }}
      animate={{ y: "-200vh" }}
      transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
      className="fixed left-0 w-full z-[70]"
      style={{ height: "200vh", backgroundColor: bgColor }}
    >
      <div className="absolute top-0 left-0 w-full h-[150px]" style={{ transform: "translateY(-100%)" }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full block">
          <path d="M 0 0 L 100 0 L 100 50 Q 50 100 0 50 Z" fill="#CCFF00" />
        </svg>
      </div>
    </motion.div>
  );
};

// --- SLIDE 1 ---
const Slide1 = () => {
  const highlightControls = useAnimation();
  const [bumpStates, setBumpStates] = useState(Array(7).fill({ x: 0, r: 0 }));
  const resetTimers = useRef(Array(7).fill(null));
  const lastHoveredIndex = useRef(-1);
  const containerRef = useRef(null);

  const [poppedLetters, setPoppedLetters] = useState({});
  const [particles, setParticles] = useState([]);

  const handleLetterClick = (index, e) => {
    if (poppedLetters[index]) return;
    playSound('pop');

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const colors = ['#D2FF00', '#FF6584', '#FFFFFF'];
    const newParticles = Array.from({ length: 12 }).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 50 + Math.random() * 50;
      return {
        id: Date.now() + '-' + index + '-' + i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 8
      };
    });

    setParticles(prev => [...prev, ...newParticles]);
    setPoppedLetters(prev => ({ ...prev, [index]: true }));

    setTimeout(() => {
      setPoppedLetters(prev => ({ ...prev, [index]: false }));
    }, 800);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => !p.id.includes('-' + index + '-')));
    }, 1200);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      playSound('marker');
      highlightControls.start({
        scaleX: 1,
        transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
      });
    }, 400);
    return () => {
      clearTimeout(timer);
      resetTimers.current.forEach(t => t && clearTimeout(t));
    };
  }, [highlightControls]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));

    const totalLetters = 7;
    const hoveredIndex = Math.floor(ratio * totalLetters);

    if (hoveredIndex !== lastHoveredIndex.current && hoveredIndex >= 0 && hoveredIndex < totalLetters) {
      const direction = Math.sign(e.movementX) || 1;
      const neighbor = hoveredIndex + direction;

      if (neighbor >= 0 && neighbor < totalLetters) {
        setBumpStates(prev => {
          const newBumps = [...prev];
          newBumps[neighbor] = { x: 12 * direction, r: 2.5 * direction };
          return newBumps;
        });

        if (resetTimers.current[neighbor]) clearTimeout(resetTimers.current[neighbor]);
        resetTimers.current[neighbor] = setTimeout(() => {
          setBumpStates(prev => {
            const newBumps = [...prev];
            newBumps[neighbor] = { x: 0, r: 0 };
            return newBumps;
          });
        }, 100);
      }

      lastHoveredIndex.current = hoveredIndex;
    }
  };

  const handleMouseLeave = () => {
    lastHoveredIndex.current = -1;
  };

  const baseRotations = [-6, -4, -1.5, 1.5, 3, 5, 6];
  const yOffsets = [18, 7, 0, 0, 5, 11, 18];
  const letters = "MAHREEN".split('');
  const totalLetters = letters.length;

  const stickerShadow = `
    6px 6px 0 #000, -6px -6px 0 #000, 6px -6px 0 #000, -6px 6px 0 #000, 
    0 6px 0 #000, 0 -6px 0 #000, 6px 0 0 #000, -6px 0 0 #000, 0 16px 0 #000
  `;

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen max-h-screen overflow-hidden relative px-4 bg-[#FF8FA3] text-[#111827] selection:bg-[#E9FF32] selection:text-black">
      <StickyNote />
      <HighlighterMarker />

      {/* PARTICLES LAYER */}
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, scale: 1, opacity: 1 }}
            animate={{ x: p.x + p.vx, y: p.y + p.vy, scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed rounded-full z-50 pointer-events-none"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: 0,
              top: 0,
              transformOrigin: "center"
            }}
          />
        ))}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center w-full relative z-10" style={{ transform: 'translateY(-50px)' }}>
        <p className="text-xs md:text-sm font-bold tracking-[0.25em] mb-8 uppercase text-black/80 z-10 font-sans">
          KAMI ADALAH
        </p>

        <div
          ref={containerRef}
          className="relative flex justify-center z-20 cursor-crosshair overflow-visible w-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            width: 'fit-content',
            margin: '0 auto',
            filter: 'drop-shadow(0px 10px 0px #000000) drop-shadow(0px 20px 0px #000000)'
          }}
        >
          {/* STATIC BACKGROUND LAYER */}
          <div className="absolute top-0 left-0 right-0 flex justify-center z-0 pointer-events-none">
            {letters.map((char, i) => {
              const isPopped = poppedLetters[i];
              const targetX = bumpStates[i].x;
              const targetRotate = baseRotations[i] + bumpStates[i].r;

              return (
                <motion.span
                  key={`static-${i}`}
                  initial={false}
                  animate={{
                    x: targetX,
                    y: yOffsets[i],
                    rotate: targetRotate,
                    scale: isPopped ? [1, 1.25, 0] : [0, 1.1, 1],
                    opacity: isPopped ? [1, 1, 0] : 1
                  }}
                  transition={{
                    type: "spring", stiffness: 600, damping: 28, mass: 0.5,
                    scale: isPopped
                      ? { times: [0, 0.4, 1], duration: 0.25, ease: "easeOut" }
                      : { times: [0, 0.5, 1], duration: 0.5, ease: "backOut" },
                    opacity: isPopped
                      ? { times: [0, 0.8, 1], duration: 0.25 }
                      : { duration: 0.2 }
                  }}
                  style={{ display: "inline-block", position: "relative", fontFamily: "'Titan One', cursive, sans-serif", WebkitTextStroke: "32px black", color: "black", fontSize: "clamp(7rem, 16vw, 15.5rem)", letterSpacing: "-0.08em", paintOrder: "stroke fill" }}
                  className="leading-none tracking-tighter uppercase origin-bottom"
                >
                  {char}
                </motion.span>
              );
            })}
          </div>

          {/* INTERACTIVE FRONT LAYER */}
          <div className="relative flex justify-center z-10">
            {letters.map((char, i) => {
              const isPopped = poppedLetters[i];
              const targetX = bumpStates[i].x;
              const targetRotate = baseRotations[i] + bumpStates[i].r;

              return (
                <motion.span
                  key={`interactive-${i}`}
                  onClick={(e) => handleLetterClick(i, e)}
                  initial={false}
                  animate={{
                    x: targetX,
                    y: yOffsets[i],
                    rotate: targetRotate,
                    scale: isPopped ? [1, 1.25, 0] : [0, 1.1, 1],
                    opacity: isPopped ? [1, 1, 0] : 1
                  }}
                  transition={{
                    type: "spring", stiffness: 600, damping: 28, mass: 0.5,
                    scale: isPopped
                      ? { times: [0, 0.4, 1], duration: 0.25, ease: "easeOut" }
                      : { times: [0, 0.5, 1], duration: 0.5, ease: "backOut" },
                    opacity: isPopped
                      ? { times: [0, 0.8, 1], duration: 0.25 }
                      : { duration: 0.2 }
                  }}
                  style={{ display: "inline-block", position: "relative", fontFamily: "'Titan One', cursive, sans-serif", WebkitTextStroke: "2px black", color: "white", fontSize: "clamp(7rem, 16vw, 15.5rem)", letterSpacing: "-0.08em", paintOrder: "stroke fill" }}
                  className="leading-none tracking-tighter uppercase select-none origin-bottom cursor-pointer"
                >
                  {char}
                </motion.span>
              );
            })}
          </div>
        </div>

        <div
          className="relative z-30 w-full text-center select-none"
          style={{ marginTop: '54px' }}
        >
          <p className="font-medium text-black text-sm md:text-base lg:text-lg tracking-wide leading-relaxed m-0 p-0">
            EKOSISTEM TALENTA DAN KARYA YANG FOKUS MEMBERIKAN{' '}
            <span
              className="relative inline-block text-black font-semibold"
              style={{ padding: '2px 8px', margin: '0 2px' }}
            >
              <motion.div
                initial={{ scaleX: 0, transformOrigin: "left" }}
                animate={highlightControls}
                className="absolute inset-0 z-0 pointer-events-none"
              >
                <RealisticMarkerStroke />
              </motion.div>
              <span className="relative z-10">DAMPAK NYATA</span>
            </span>,
          </p>
          <p className="font-medium text-black text-sm md:text-base lg:text-lg tracking-wide leading-relaxed mt-1">
            BUKAN WACANA.
          </p>
        </div>
      </div>
    </div>
  );
};

const EraserOrnament = () => (
  <svg
    width="400"
    height="400"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="absolute -top-[60px] -right-[60px] z-0 hidden md:block pointer-events-none drop-shadow-[15px_20px_25px_rgba(0,0,0,0.2)] rotate-45"
  >
    <g transform="translate(10, 40) rotate(-10)">
      {/* Side depth (Darker Pink) */}
      <path d="M45 60 L145 60 A 10 10 0 0 1 155 70 L140 100 A 10 10 0 0 1 130 110 L30 110 A 10 10 0 0 1 20 100 L35 70 A 10 10 0 0 1 45 60 Z" fill="#D05070" />
      {/* Front Side Lines */}
      <path d="M20 100 A 10 10 0 0 0 30 110 L130 110 A 10 10 0 0 0 140 100" fill="none" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
      <line x1="30" y1="80" x2="20" y2="100" stroke="#111827" strokeWidth="4" strokeLinecap="round" />
      <line x1="150" y1="80" x2="140" y2="100" stroke="#111827" strokeWidth="4" strokeLinecap="round" />

      {/* Top Face (Soft Pink) */}
      <path d="M55 40 L155 40 A 10 10 0 0 1 165 50 L150 80 A 10 10 0 0 1 140 90 L40 90 A 10 10 0 0 1 30 80 L45 50 A 10 10 0 0 1 55 40 Z" fill="#FF8BA7" stroke="#111827" strokeWidth="4" strokeLinejoin="round" />
    </g>
  </svg>
);

// --- SLIDE 2 ---
const Slide2 = () => {
  // Mini logo constants
  const letters = "MAHREEN".split('');
  const baseRotations = [-6, -3, -1, 0, 1, 3, 6];
  const yOffsets = [3, 1, -1, -2, -1, 1, 3]; // Scaled down offsets
  const stickerShadow = `2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 0 #000`;

  return (
    <div
      style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden' }}
      className={`relative w-screen text-[#111827] flex flex-col justify-between py-6 px-10 selection:bg-[#E9FF32] selection:text-black transition-colors duration-500 ease-in-out bg-[#FF7597]`}
    >

      {/* PHASE 2: CONTENT */}
      {/* Ornaments for Slide 2 */}
      <EraserOrnament />

      <div
        className="flex-grow flex flex-col items-center justify-center w-full z-10"
      >
        {/* Header Container (Top) */}
        <div className="flex flex-col items-center w-full mb-10 mt-6">
          {/* Mini Logo */}
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
          {/* Subtext */}
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-gray-800 font-sans">
            MASALAHNYA
          </p>
        </div>

        {/* Core Problem Statement (Center) */}
        <div
          className="flex flex-col items-center text-center w-full max-w-7xl px-4 gap-2 md:gap-4 uppercase text-black font-black"
          style={{ fontFamily: "'Titan One', cursive, sans-serif", fontSize: "clamp(1.8rem, 3.2vw, 2.8rem)", lineHeight: "1.15" }}
        >
          <div className="z-10">
            SETIAP HARI, RIBUAN PELUANG DIBUAT
          </div>
          <div className="z-10">
            TAPI BANYAK YANG <span className="relative inline-block px-2 py-0.5">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 bg-[#CCFF00] rounded-sm origin-left z-0"
              />
              <span className="relative z-10">MELEWATKAN,</span>
            </span>
          </div>
          <div className="z-10 mt-1 md:mt-2">
            BANYAK YANG <span className="relative inline-block px-2 py-0.5">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 bg-[#CCFF00] rounded-sm origin-left z-0"
              />
              <span className="relative z-10">BINGUNG MEMULAI,</span>
            </span> DAN
          </div>
          <div className="z-10 mt-1 md:mt-2">
            KARYA HANYA <span className="relative inline-block px-2 py-0.5">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.9, ease: [0.25, 1, 0.5, 1] }}
                className="absolute inset-0 bg-[#CCFF00] rounded-sm origin-left z-0"
              />
              <span className="relative z-10">BERAKHIR WACANA.</span>
            </span>
          </div>
        </div>
      </div>

      {/* Invisible spacer to reserve space for the fixed bottom navigation bar and prevent overlap */}
      <div className="h-24 w-full flex-shrink-0"></div>
    </div>
  );
};

// --- SLIDE 3 ---
const Slide3 = () => {
  // Mini logo constants
  const letters = "MAHREEN".split('');
  const baseRotations = [-6, -3, -1, 0, 1, 3, 6];
  const yOffsets = [3, 1, -1, -2, -1, 1, 3]; // Scaled down offsets
  const stickerShadow = `2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 0 #000`;

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 2px, transparent 2px)',
        backgroundSize: '24px 24px'
      }}
      className={`relative w-screen text-[#111827] flex flex-col justify-between py-6 px-10 selection:bg-[#E9FF32] selection:text-black transition-colors duration-500 ease-in-out bg-[#FF7597]`}
    >
      {/* PHASE 2: CONTENT */}
      <div
        className="flex-grow flex flex-col items-center justify-center w-full z-10"
      >
        {/* Header Container (Top) */}
        <div className="flex flex-col items-center w-full mb-8 mt-6">
          {/* Mini Logo */}
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
          {/* Subtext */}
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-gray-800 font-sans">
            SOLUSINYA
          </p>
        </div>

        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-black uppercase mb-12 text-center" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
          PILIH PERANMU UNTUK INDONESIA.
        </h2>

        {/* 3 Neo-Brutalism Cards */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center w-full max-w-6xl px-4 z-20 pointer-events-auto">
          {/* Card 1 */}
          <div
            className="flex-1 flex"
            style={{ animation: 'smoothWaveFloat 3.8s ease-in-out infinite', animationDelay: '0s' }}
          >
            <motion.div
              whileHover={{ y: -8, boxShadow: "10px 10px 0px #000" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full bg-[#EFE8D8] border-[3px] border-black rounded-xl py-10 px-6 md:py-12 md:px-8 flex flex-col items-start cursor-pointer shadow-[6px_6px_0px_#000]"
            >
              <div className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 font-sans">
                01 / DIGITAL & KREATIF
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-black text-black uppercase leading-tight" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                KREASI KONTEN, TEKNOLOGI, DAN MEDIA BARU.
              </div>
            </motion.div>
          </div>

          {/* Card 2 */}
          <div
            className="flex-1 flex"
            style={{ animation: 'smoothWaveFloat 3.8s ease-in-out infinite', animationDelay: '0.4s' }}
          >
            <motion.div
              whileHover={{ y: -8, boxShadow: "10px 10px 0px #000" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full bg-[#EFE8D8] border-[3px] border-black rounded-xl py-10 px-6 md:py-12 md:px-8 flex flex-col items-start cursor-pointer shadow-[6px_6px_0px_#000]"
            >
              <div className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 font-sans">
                02 / BISNIS & TALENTA
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-black text-black uppercase leading-tight" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                PENGEMBANGAN INOVASI DAN RINTISAN USAHA.
              </div>
            </motion.div>
          </div>

          {/* Card 3 */}
          <div
            className="flex-1 flex"
            style={{ animation: 'smoothWaveFloat 3.8s ease-in-out infinite', animationDelay: '0.8s' }}
          >
            <motion.div
              whileHover={{ y: -8, boxShadow: "10px 10px 0px #000" }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full bg-[#EFE8D8] border-[3px] border-black rounded-xl py-10 px-6 md:py-12 md:px-8 flex flex-col items-start cursor-pointer shadow-[6px_6px_0px_#000]"
            >
              <div className="text-xs md:text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 font-sans">
                03 / DAMPAK SOSIAL
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-black text-black uppercase leading-tight" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                GERAKAN KOMUNITAS DAN AKSI SOSIAL NYATA.
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invisible spacer to reserve space for the fixed bottom navigation bar and prevent overlap */}
      <div className="h-24 w-full flex-shrink-0"></div>
    </div>
  );
};

// --- SLIDE 4 (Stacked Carousel) ---
const cardsData = [
  {
    id: 'c1',
    category: 'STUDI KASUS 01\nMEDIA KREATIF',
    headline: '1 IDE.\n1 KONTEN.\n100K AUDIENS TERGERAK.',
    bg: '#FF7597',
    detailCategory: 'CATATAN EKSEKUSI / 01',
    detailTitle: 'DIBUAT DALAM 3 HARI. DITONTON 100K+ KALI.',
    detailText: 'Kita nggak butuh tim produksi raksasa atau sewa agensi mahal. Modalnya cuma satu ide berani, riset keresahan audiens selama 2 hari, dan eksekusi visual yang langsung nendang di feed. Hasilnya? Konten bergerak organik, ribuan komentar masuk, dan bukti bahwa pesan yang jujur selalu nemu jalannya sendiri.',
    detailFooter: 'BIAYA IKLAN: RP 0 · TIM KREATIF: 2 ORANG'
  },
  {
    id: 'c2',
    category: 'STUDI KASUS 02\nPENGEMBANGAN TALENTA',
    headline: 'DARI TUGAS KULIAH\nJADI PRODUK DILIRIK INVESTOR.',
    bg: '#CCFF00',
    detailCategory: 'CATATAN EKSEKUSI / 02',
    detailTitle: 'BUKAN MAGANG FOTOKOPI DAN BIKIN KOPI.',
    detailText: 'Dari hari pertama, anak-anak magang langsung pegang data riil dan ambil keputusan. Validasi pasar langsung ke pengguna, bedah masalah operasional, dan uji coba produk langsung di lapangan. Pengalaman kerja nyata nggak bisa dipelajari dari teori buku teks.',
    detailFooter: 'HASIL: 1 PRODUK TERVALIDASI DI PASAR'
  },
  {
    id: 'c3',
    category: 'STUDI KASUS 03\nGERAKAN KOMUNITAS',
    headline: '50 VOLUNTEER.\n5 KOTA.\n1 GERAKAN NYATA.',
    bg: '#FFFFFF',
    detailCategory: 'CATATAN EKSEKUSI / 03',
    detailTitle: '1 GERAKAN. 5 KOTA. BERGERAK SERENTAK.',
    detailText: 'Nggak ada rapat birokrasi bertele-tele. Semua berawal dari grup obrolan singkat yang diterjemahkan jadi aksi nyata di 5 titik. Relawan turun bukan untuk formalitas foto bersama, tapi memastikan program benar-benar dirasakan manfaatnya oleh warga sekitar.',
    detailFooter: 'STATUS: AKSI SELESAI · DAMPAK TERUKUR'
  }
];

const Slide4 = () => {
  const [subCardIndex, setSubCardIndex] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const totalSubCards = cardsData.length;
  const activeDetail = cardsData[subCardIndex];

  const letters = "MAHREEN".split('');
  const baseRotations = [-6, -3, -1, 0, 1, 3, 6];
  const yOffsets = [3, 1, -1, -2, -1, 1, 3];
  const stickerShadow = `2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 0 #000`;

  const handleNextCard = () => {
    if (subCardIndex >= totalSubCards - 1) return;
    setIsDetailOpen(false);
    setSubCardIndex(prev => prev + 1);
  };

  const handlePrevCard = () => {
    if (subCardIndex <= 0) return;
    setIsDetailOpen(false);
    setSubCardIndex(prev => prev - 1);
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden flex flex-col items-center justify-start pt-6 pb-24 px-8 relative text-[#111827] selection:bg-[#E9FF32] selection:text-black bg-[#F4EBE1]">
      <div className="flex-grow flex flex-col items-center justify-center w-full z-10 relative">
        {/* Header Container */}
        <div className="absolute top-0 flex flex-col items-center w-full mt-6">
          {/* Mini Logo */}
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
        </div>        {/* Left Arrow (Fixed to screen) */}
        <button
          onClick={handlePrevCard}
          disabled={subCardIndex === 0}
          className={`absolute left-6 md:left-10 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${subCardIndex === 0
            ? 'opacity-30 bg-neutral-200 border-neutral-400 text-neutral-400 pointer-events-none cursor-not-allowed shadow-none'
            : 'bg-white border-black text-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-neutral-100 pointer-events-auto'
            }`}
        >
          <span className="font-black text-xl">〈</span>
        </button>

        {/* Right Arrow (Fixed to screen) */}
        <button
          onClick={handleNextCard}
          disabled={subCardIndex === totalSubCards - 1}
          className={`absolute right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${subCardIndex === totalSubCards - 1
            ? 'opacity-30 bg-neutral-200 border-neutral-400 text-neutral-400 pointer-events-none cursor-not-allowed shadow-none'
            : 'bg-white border-black text-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-neutral-100 pointer-events-auto'
            }`}
        >
          <span className="font-black text-xl">〉</span>
        </button>

        {/* Carousel Container */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[20vh] w-[58vw] md:w-[62vw] max-w-3xl h-[130vh]">
          {/* Cards */}
          <div className="relative w-full h-full perspective-[1000px]">
            {cardsData.map((data, dataIndex) => {
              let rotateOffset = 0;
              let xOffset = 0;
              let zIndex = 10;

              if (dataIndex === 0) {
                if (subCardIndex === 0) { rotateOffset = 0; xOffset = 0; zIndex = 30; }
                else if (subCardIndex === 1) { rotateOffset = -3; xOffset = -28; zIndex = 20; }
                else if (subCardIndex === 2) { rotateOffset = -5.5; xOffset = -54; zIndex = 10; }
              } else if (dataIndex === 1) {
                if (subCardIndex === 0) { rotateOffset = 3; xOffset = 28; zIndex = 20; }
                else if (subCardIndex === 1) { rotateOffset = 0; xOffset = 0; zIndex = 30; }
                else if (subCardIndex === 2) { rotateOffset = -3; xOffset = -28; zIndex = 20; }
              } else if (dataIndex === 2) {
                if (subCardIndex === 0) { rotateOffset = 5.5; xOffset = 54; zIndex = 10; }
                else if (subCardIndex === 1) { rotateOffset = 3; xOffset = 28; zIndex = 20; }
                else if (subCardIndex === 2) { rotateOffset = 0; xOffset = 0; zIndex = 30; }
              }

              return (
                <motion.div
                  key={data.id}
                  initial={false}
                  animate={{
                    zIndex,
                    scale: 1,
                    y: 0,
                    x: xOffset,
                    rotate: rotateOffset,
                    opacity: 1
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 rounded-t-xl rounded-b-none border-t-[3px] border-l-[3px] border-r-[3px] border-b-0 border-black pt-6 md:pt-8 px-6 md:px-10 pb-32 md:pb-36 flex flex-col justify-start w-full h-full pointer-events-none"
                  style={{ backgroundColor: data.bg, transformOrigin: "bottom center" }}
                >
                  <div className="flex justify-between items-start w-full flex-shrink-0">
                    <span className="font-bold text-xs font-sans tracking-widest uppercase text-black/80 whitespace-pre-line text-left">
                      {data.category}
                    </span>
                    <button onClick={() => setIsDetailOpen(true)} className="bg-white px-4 py-2 rounded-2xl border-2 border-black font-black text-sm shadow-[2px_2px_0px_#000] flex items-center gap-2 flex-shrink-0 pointer-events-auto hover:bg-neutral-100 transition-colors">
                      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" xmlns="http://www.w3.org/2000/svg">
                        <ellipse cx="7" cy="12" rx="4" ry="6" fill="white" stroke="black" strokeWidth="2" />
                        <circle cx="5" cy="12" r="2" fill="black" />
                        <ellipse cx="17" cy="12" rx="4" ry="6" fill="white" stroke="black" strokeWidth="2" />
                        <circle cx="15" cy="12" r="2" fill="black" />
                      </svg>
                      LIHAT KARYA
                    </button>
                  </div>
                  <div className="flex-grow flex flex-col justify-start mt-4 md:mt-6">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-[1.05] tracking-tight text-left whitespace-pre-line text-black" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                      {data.headline}
                    </h2>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Project Detail Drawer */}
      <AnimatePresence>
        {isDetailOpen && (
          <>
            {/* Dimmer Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-[1px]"
              onClick={() => setIsDetailOpen(false)}
            />
            
            {/* Drawer Wrapper */}
            <motion.div
              initial={{ x: "100%", y: "20%" }}
              animate={{ x: 0, y: 0 }}
              exit={{ x: "100%", y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-0 right-0 h-full w-[90vw] sm:w-[48vw] md:w-[34vw] lg:w-[30vw] z-50 pointer-events-auto"
            >
              {/* Floating Side Trigger (Close) */}
              <button 
                onClick={() => setIsDetailOpen(false)} 
                className="absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#D2FF00] border-2 border-black shadow-[2px_2px_0px_#000] flex items-center justify-center font-black text-xl hover:scale-105 transition-transform z-50"
              >
                ✕
              </button>

              {/* White Panel (No Border, No Scroll) */}
              <div className="w-full h-full bg-white p-7 md:p-9 flex flex-col justify-between select-none overflow-hidden">
                {/* Bagian Atas: Kategori, Judul */}
                <div>
                  <span className="font-bold text-[10px] md:text-xs font-sans tracking-widest uppercase text-black/60 mb-2 block whitespace-pre-line">
                    {activeDetail.detailCategory}
                  </span>
                  <h3 className="font-black text-3xl md:text-5xl uppercase leading-[1] tracking-tight text-black" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                    {activeDetail.detailTitle}
                  </h3>
                </div>

                {/* Bagian Tengah: Teks narasi padat */}
                <div className="flex-1 flex flex-col justify-center py-4 gap-6">
                  <p className="font-medium text-sm md:text-base leading-snug text-black" dangerouslySetInnerHTML={{ __html: activeDetail.detailText }} />
                </div>

                {/* Bagian Bawah: Catatan Kaki */}
                <div className="mt-auto">
                  <span className="inline-block bg-black text-[#F4EBE1] text-[10px] md:text-xs font-bold px-3 py-1.5 uppercase tracking-wide">
                    {activeDetail.detailFooter}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-24 w-full flex-shrink-0"></div>
    </div>
  );
};

// --- SLIDE 5 ---
const Slide5 = () => {
  const [showModal, setShowModal] = useState(false);
  const letters = "MAHREEN".split('');
  const baseRotations = [-6, -3, -1, 0, 1, 3, 6];
  const yOffsets = [3, 1, -1, -2, -1, 1, 3]; // Scaled down offsets
  const stickerShadow = `2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 0 2px 0 #000, 0 -2px 0 #000, 2px 0 0 #000, -2px 0 0 #000, 0 6px 0 #000`;

  return (
    <div
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 2px, transparent 2px)',
        backgroundSize: '24px 24px'
      }}
      className="h-screen w-screen max-h-screen overflow-hidden flex flex-col justify-between items-center py-8 px-12 relative text-[#111827] selection:bg-[#E9FF32] selection:text-black bg-[#FF7597]"
    >
      <div className="flex-grow flex flex-col justify-center items-center w-full z-10 px-4">
        
        {/* Restored Mini Logo Above Card */}
        <div className="relative flex justify-center scale-[0.55] origin-top h-[60px] mb-6 md:mb-8 mt-4">
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

        {/* The Action Card (Neo-Brutalist) */}
        <div className="w-[84vw] md:w-[60vw] max-w-3xl h-auto bg-[#EFE8D8] border-[3.5px] border-black rounded-2xl shadow-[6px_6px_0px_#000] py-6 md:py-8 px-6 md:px-12 flex flex-col items-center justify-center text-center mb-20 md:mb-24 -translate-y-8 md:-translate-y-12">
          
          {/* Tag Atas */}
          <div className="mb-4">
            <span className="text-[11px] font-bold tracking-widest uppercase bg-black text-[#D2FF00] px-3 py-1 border border-black inline-block">
              MAHREEN BATCH 02 · SELEKSI KARYA
            </span>
          </div>

          {/* Headline Utama */}
          <h2 className="text-2xl md:text-4xl font-black uppercase text-center leading-tight mb-4 text-black" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
            KAMI TIDAK CARI PENONTON.<br />
            KAMI CARI EKSEKUTOR.
          </h2>

          {/* Sub-teks Realistis */}
          <p className="text-base md:text-xl lg:text-2xl font-bold text-black mt-5 md:mt-6 max-w-2xl text-center leading-snug mb-2">
            Tiga bulan pembuktian langsung di lapangan. Ruang kerja nyata untuk kamu yang siap berkarya untuk Indonesia.
          </p>

          {/* Call to Action Button */}
          <div className="pointer-events-auto flex justify-center mt-6 md:mt-8">
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3.5 bg-[#D2FF00] hover:bg-[#bceb00] text-black font-black text-sm md:text-base tracking-wider uppercase border-[2.5px] border-black rounded-xl shadow-[3px_3px_0px_#000] hover:-translate-y-1 hover:shadow-[3px_5px_0px_#000] transition-all cursor-pointer"
            >
              AMBIL TANTANGAN SEKARANG
            </button>
          </div>
          
        </div>
      </div>

      {/* Invisible spacer to reserve space for the fixed bottom navigation bar and prevent overlap */}
      <div className="h-24 w-full flex-shrink-0"></div>

      {/* Neo-brutalism Modal/Alert */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-[4px] border-black rounded-xl p-8 max-w-lg shadow-[8px_8px_0px_#000000] relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-[#FF8FA3] border-[3px] border-black rounded-full shadow-[3px_3px_0px_#000] flex items-center justify-center font-bold text-xl hover:scale-110 active:scale-95 transition-transform"
              >
                ×
              </button>
              <h3 className="font-black text-2xl mb-4 uppercase" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>Panggilan Diterima!</h3>
              <p className="font-bold text-lg leading-relaxed font-sans text-gray-800">
                Terima kasih telah mengambil peran! Mari berkarya nyata untuk Indonesia bersama Mahreen Batch 2.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN APP (Slide Orchestrator) ---
export default function App() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSlideUp, setShowSlideUp] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [transitionTarget, setTransitionTarget] = useState(1);
  const [triggerKey, setTriggerKey] = useState(0);
  const [isSlidesOpen, setIsSlidesOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(1);
  const carouselRef = useRef(null);
  const cardRefs = useRef([]);

  const [isMuted, setIsMuted] = useState(true);

  // Initialize BGM and unmute on first interaction
  useEffect(() => {
    const handleFirstClick = () => {
      setIsMuted(false);
      setGlobalMute(false);

      // Unlock all Audio instances on first user interaction to bypass Autoplay Policy
      if (typeof window !== 'undefined') {
        Object.values(audioCache).forEach(audio => {
          if (audio && audio.paused && audio !== audioCache['bgm']) {
            audio.play().then(() => {
              audio.pause();
              audio.currentTime = 0;
            }).catch(() => { });
          }
        });
      }

      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    window.addEventListener('touchstart', handleFirstClick); // Support for mobile
    return () => {
      window.removeEventListener('click', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
  }, []);

  // Inject Titan One font just in case
  useEffect(() => {
    if (!document.getElementById('titan-one-font')) {
      const link = document.createElement('link');
      link.id = 'titan-one-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Titan+One&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // Auto-Scroll to active card when carouselIndex changes
  useEffect(() => {
    if (isSlidesOpen && cardRefs.current[carouselIndex]) {
      // Small timeout ensures modal is fully rendered before scrolling
      setTimeout(() => {
        cardRefs.current[carouselIndex].scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 50);
    }
  }, [carouselIndex, isSlidesOpen]);

  // Sync carouselIndex with currentSlide when modal is first opened
  useEffect(() => {
    if (isSlidesOpen) {
      setCarouselIndex(currentSlide);
    }
  }, [isSlidesOpen, currentSlide]);

  const scrollCarousel = (direction) => {
    setCarouselIndex(prev => Math.max(1, Math.min(6, prev + direction)));
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSlidesOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const executeTransition = (target) => {
    setTransitionTarget(target);
    setIsTransitioning(true); // hides bottom bar immediately
    setShowInterstitial(false); // Pastikan layar teks disembunyikan di awal

    // 1. Tirai 1 mulai naik (0ms)
    setTriggerKey(prev => prev + 1);
    setShowSlideUp(true);

    // 2. Tirai 1 menutupi layar (400ms). Tampilkan teks Interstitial, 
    // teks akan otomatis melompat masuk (stagger IN) dari bawah
    setTimeout(() => {
      setShowInterstitial(true);
    }, 400);

    // 3. Teks mulai menghilang terbang ke atas (stagger OUT) pada 3000ms
    setTimeout(() => {
      setShowInterstitial(false);
    }, 3000);

    // 4. Tirai 2 mulai naik (3400ms) untuk menyapu sisa-sisa dan menyiapkan slide baru
    setTimeout(() => {
      setTriggerKey(prev => prev + 1);
      setShowSlideUp(true);
    }, 3400);

    // 5. Tirai 2 menutupi layar (3800ms). Kita ganti konten di baliknya menjadi Slide baru
    setTimeout(() => {
      setCurrentSlide(target);
    }, 3800);

    // 6. Tirai 2 selesai lewat (4200ms). Transisi selesai.
    setTimeout(() => {
      setShowSlideUp(false);
      setIsTransitioning(false); // bottom bar muncul lagi
    }, 4300); // 100ms extra buffer untuk aman
  };

  const handleNext = () => {
    playSound('click');
    if (currentSlide < 6) executeTransition(currentSlide + 1);
  };

  const handlePrev = () => {
    playSound('click');
    if (currentSlide > 1) executeTransition(currentSlide - 1);
  };

  return (
    <>
      <AnimatePresence>
        {showInterstitial && <InterstitialScreen key="interstitial" targetSlide={transitionTarget} />}
      </AnimatePresence>

      {showSlideUp && (
        <SlideUpCurtain
          triggerKey={triggerKey}
          bgColor={transitionTarget === 1 ? '#FF8FA3' : '#FF7597'}
        />
      )}

      {/* Render Active Slide - NO isTransitioning check, it stays rendered UNDER the curtain */}
      {currentSlide === 1 && <Slide1 />}
      {currentSlide === 2 && <Slide2 />}
      {currentSlide === 3 && <Slide3 />}
      {currentSlide === 4 && <Slide4 />}
      {currentSlide === 5 && <Slide5 />}
      {currentSlide === 6 && <Slide6 onReset={() => executeTransition(1)} />}

      {/* GLOBAL Bottom Navigation Bar */}
      {!isTransitioning && currentSlide !== 6 && (
        <div className="fixed bottom-8 left-0 w-full px-6 md:px-12 z-40 font-sans pointer-events-none">
          <div className="flex justify-between items-center bg-transparent w-full pointer-events-auto">
            {/* Left */}
            <div className="w-1/3 text-left">
              {/* Removed Catatan Program text as requested */}
            </div>

            {/* Center Controls */}
            <div className="w-1/3 flex justify-center items-center gap-4 md:gap-6">
              {/* PREV */}
              <button
                onClick={handlePrev}
                disabled={currentSlide === 1}
                className={`px-6 py-2.5 rounded-xl border-[4px] border-black font-black text-sm md:text-base uppercase text-[#111827] transition-all shadow-[4px_4px_0px_0px_#000] ${currentSlide === 1 ? 'bg-[#E5A9B4] opacity-90 cursor-not-allowed' : 'bg-white hover:bg-gray-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'}`}
              >
                〈 Prev
              </button>

              {/* MENU */}
              <button
                onClick={() => { playSound('click'); setIsSlidesOpen(true); }}
                className="w-14 h-14 rounded-full bg-[#E9FF32] border-[4px] border-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform flex-shrink-0 shadow-[4px_4px_0px_0px_#000] z-10"
              >
                <div className="flex flex-col gap-1">
                  <div className="w-6 h-[4px] bg-black rounded-full"></div>
                  <div className="w-6 h-[4px] bg-black rounded-full"></div>
                  <div className="w-6 h-[4px] bg-black rounded-full"></div>
                </div>
              </button>

              {/* NEXT */}
              <button
                onClick={handleNext}
                disabled={currentSlide === 6}
                className={`px-6 py-2.5 rounded-xl border-[4px] border-black font-black text-sm md:text-base uppercase text-[#111827] transition-all shadow-[4px_4px_0px_0px_#000] ${currentSlide === 6 ? 'bg-[#E5A9B4] opacity-40 cursor-not-allowed' : 'bg-white hover:bg-gray-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none cursor-pointer'}`}
              >
                Next 〉
              </button>
            </div>

            {/* Right */}
            <div className="w-1/3 flex justify-end items-center gap-3 md:gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newMute = !isMuted;
                  setIsMuted(newMute);
                  setGlobalMute(newMute);
                }}
                className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-black flex items-center justify-center transition-all cursor-pointer flex-shrink-0 pointer-events-auto ${isMuted
                  ? 'bg-white'
                  : 'bg-[#D2FF00] shadow-[-4px_4px_0px_0px_#000] -translate-y-1 translate-x-1'
                  }`}
              >
                {isMuted ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px]">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <line x1="2" y1="2" x2="22" y2="22" strokeWidth="3"></line>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="translate-x-[1px]">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  </svg>
                )}
              </button>
              <span className="font-medium text-sm md:text-base uppercase tracking-wider text-black" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                SLIDE {currentSlide}/6
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slide Navigator Modal */}
      <AnimatePresence>
        {isSlidesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-[2px]"
            onClick={(e) => {
              // Close if clicking outside the modal content
              if (e.target === e.currentTarget) {
                playSound('click');
                setIsSlidesOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-[#F4EEDD] border-[4px] border-black rounded-2xl shadow-[8px_8px_0px_0px_#000000] max-w-5xl w-[90vw] overflow-visible py-4 px-6 md:py-5 md:px-8 relative flex flex-col items-center"
            >
              <button
                onClick={() => { playSound('click'); setIsSlidesOpen(false); }}
                className="absolute top-3 right-3 md:top-4 md:right-4 w-[36px] h-[36px] md:w-[40px] md:h-[40px] rounded-full border-[3px] border-black bg-white flex items-center justify-center font-black text-lg hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0px_0px_#000000] z-20 text-black"
              >
                ✕
              </button>

              <h2 className="text-2xl md:text-3xl font-black uppercase text-center text-black mb-3 md:mb-4 tracking-wide" style={{ fontFamily: "'Titan One', cursive, sans-serif" }}>
                SLIDES
              </h2>

              <div
                ref={carouselRef}
                className="flex flex-row overflow-hidden gap-3 md:gap-5 w-full py-2 px-2"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={num}
                    ref={el => cardRefs.current[num] = el}
                    onClick={() => {
                      playSound('click');
                      setIsSlidesOpen(false);
                      if (currentSlide !== num) executeTransition(num);
                    }}
                    className={`flex-none aspect-video w-[180px] md:w-[220px] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 relative bg-white flex items-center justify-center ${currentSlide === num ? 'border-[3.5px] border-[#D2FF00] scale-[1.02]' : 'border-[2.5px] border-black hover:-translate-y-1'}`}
                  >
                    {/* Number Badge */}
                    <span className="absolute top-2 left-2.5 z-20 font-bold text-xs text-black pointer-events-none">
                      {num}
                    </span>

                    {/* Scaled Real Slide Preview */}
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      <div className="w-[1000px] h-[562px] origin-top-left scale-[0.18] md:scale-[0.22] flex items-center justify-center">
                        {num === 1 && <Slide1 />}
                        {num === 2 && <Slide2 />}
                        {num === 3 && <Slide3 />}
                        {num === 4 && <Slide4 />}
                        {num === 5 && <Slide5 />}
                        {num === 6 && <Slide6 onReset={() => { }} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-center gap-4 md:gap-6 mt-3">
                <button
                  onClick={() => { playSound('click'); scrollCarousel(-1); }}
                  disabled={carouselIndex <= 1}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-black text-black bg-white flex items-center justify-center font-bold text-lg transition-all hover:bg-neutral-100 active:scale-95 shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 disabled:bg-neutral-200 disabled:border-neutral-400 disabled:text-neutral-400 disabled:shadow-none disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  〈
                </button>

                <div className="flex items-center gap-2 md:gap-3">
                  {[1, 2, 3].map((page) => {
                    // Logika: 1 titik mewakili 2 slide (Halaman 1 = Slide 1 & 2, dst)
                    const isActive = Math.ceil(carouselIndex / 2) === page;
                    return (
                      <button
                        key={page}
                        onClick={() => {
                          playSound('click');
                          const targetSlide = page * 2 - 1; // Halaman 1 ke Slide 1, Halaman 2 ke Slide 3, dst
                          setIsSlidesOpen(false);
                          if (currentSlide !== targetSlide) executeTransition(targetSlide);
                        }}
                        className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-[3px] border-black transition-all duration-300 cursor-pointer hover:scale-110 ${isActive ? 'bg-[#D2FF00] scale-125' : 'bg-white'}`}
                      />
                    );
                  })}
                </div>

                <button
                  onClick={() => { playSound('click'); scrollCarousel(1); }}
                  disabled={carouselIndex >= 6}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] border-black text-black bg-white flex items-center justify-center font-bold text-lg transition-all hover:bg-neutral-100 active:scale-95 shadow-[2px_2px_0px_0px_#000] disabled:opacity-30 disabled:bg-neutral-200 disabled:border-neutral-400 disabled:text-neutral-400 disabled:shadow-none disabled:active:scale-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  〉
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
