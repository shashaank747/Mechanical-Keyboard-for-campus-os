"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { bgMusic } from "@/lib/bgMusic";
import { Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  isDark: boolean;
}

export function MusicPlayer({ isDark }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(bgMusic.getIsPlaying());
  const [isMuted, setIsMuted] = useState<boolean>(bgMusic.getIsMuted());
  const [volume, setVolume] = useState<number>(bgMusic.getVolume());
  const [currentTrack, setCurrentTrack] = useState(bgMusic.getCurrentTrack());
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const volumeContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = bgMusic.subscribe(() => {
      setIsPlaying(bgMusic.getIsPlaying());
      setIsMuted(bgMusic.getIsMuted());
      setVolume(bgMusic.getVolume());
      setCurrentTrack(bgMusic.getCurrentTrack());
    });
    return () => unsubscribe();
  }, []);

  // Close volume popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        volumeContainerRef.current &&
        !volumeContainerRef.current.contains(e.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    }
    if (showVolumeSlider) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showVolumeSlider]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    bgMusic.toggleMute();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    bgMusic.setVolume(val);
  };

  return (
    <div className="relative flex items-center" ref={volumeContainerRef}>
      {/* Pill Container */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all ${
          isPlaying
            ? "bg-white border-blue-400 text-slate-900 shadow-md shadow-blue-500/10"
            : "bg-white border-blue-200 text-slate-700 hover:border-blue-300 shadow-xs"
        }`}
      >
        {/* Animated Soundwave Visualizer Bars */}
        <div className="flex items-end gap-0.5 h-3.5 px-0.5">
          {[
            { delay: 0, height: "h-3.5" },
            { delay: 0.15, height: "h-2" },
            { delay: 0.3, height: "h-3" },
            { delay: 0.45, height: "h-1.5" },
          ].map((bar, idx) => (
            <span
              key={idx}
              className={`w-0.5 rounded-full transition-all duration-300 ${
                isPlaying
                  ? "bg-blue-600 animate-pulse"
                  : "bg-slate-300 h-1"
              } ${isPlaying ? bar.height : "h-1"}`}
              style={{
                animationDuration: isPlaying ? "0.8s" : undefined,
                animationDelay: isPlaying ? `${bar.delay}s` : undefined,
              }}
            />
          ))}
        </div>

        {/* Track Title */}
        <div
          className="flex items-center gap-1.5 select-none"
          title={`Now Playing: ${currentTrack.title}`}
        >
          <span className="text-[11px] font-bold tracking-tight truncate max-w-[130px] sm:max-w-[170px] text-slate-800">
            {currentTrack.title}
          </span>
        </div>

        {/* Volume / Mute Button */}
        <div className="relative flex items-center">
          <button
            onClick={() => setShowVolumeSlider((prev) => !prev)}
            onDoubleClick={handleToggleMute}
            className="p-1 rounded-full text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
            title="Volume / Mute"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Popover Volume Slider (Positioned BELOW the Pill) */}
          <AnimatePresence>
            {showVolumeSlider && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 p-2.5 rounded-2xl border-2 border-blue-200 bg-white text-slate-900 shadow-xl backdrop-blur-xl flex flex-col items-center gap-2 z-50"
              >
                <div className="flex items-center justify-between gap-3 w-28 text-[10px] font-mono font-bold">
                  <span className="text-slate-400">BGM Volume</span>
                  <span className="text-blue-400 font-extrabold">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-28 accent-blue-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
