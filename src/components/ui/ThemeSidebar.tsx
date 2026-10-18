"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KEYBOARD_THEMES, type KeyboardTheme } from "@/lib/themes";
import { 
  X, Palette, Check, 
  Gamepad2, Settings, ArrowLeft, ChevronRight,
  Sliders, BarChart3
} from "lucide-react";

interface ThemeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: KeyboardTheme;
  onSelectTheme: (theme: KeyboardTheme) => void;
  currentPage?: string;
  onNavigate?: (page: any) => void;
  colorZones?: boolean;
  onToggleColorZones?: () => void;
}

export function ThemeSidebar({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  currentPage = "start",
  onNavigate,
  colorZones = false,
  onToggleColorZones,
}: ThemeSidebarProps) {
  const [view, setView] = useState<"menu" | "settings">("settings");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Light", "Pastel", "Retro", "Dark"];

  const filteredThemes =
    activeCategory === "All"
      ? KEYBOARD_THEMES
      : KEYBOARD_THEMES.filter((t) => t.category === activeCategory);

  // Lock background page scroll when sidebar is open and reset view on close/open
  React.useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    } else {
      // Reset to settings view when closed
      setView("settings");
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            onWheel={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity overscroll-contain"
          />

          {/* Left Sidebar Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
            className="fixed top-0 left-0 bottom-0 w-full max-w-[270px] bg-white text-slate-900 z-50 shadow-2xl border-r border-slate-200 flex flex-col overflow-hidden overscroll-contain touch-pan-y"
          >
            {/* ======================================================== */}
            {/* VIEW 1: NAVIGATION MENU (Let's Play, Settings)           */}
            {/* ======================================================== */}
            {view === "menu" ? (
              <div className="flex flex-col h-full">
                {/* Navigation Menu List (Header completely removed) */}
                <div className="flex-1 p-3 pt-16 space-y-2.5 overflow-y-auto">

                  {/* 1. Let's Play Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onNavigate?.("start");
                      handleClose();
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      currentPage === "start" || currentPage === "academy" || currentPage === "speedtest" || currentPage === "fallingwords" || currentPage === "soundmatrix" || currentPage === "shortcuts" || currentPage === "codesprint" || currentPage === "blindtyping"
                        ? "border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900">Let's Play</div>
                        <div className="text-[10px] text-slate-500">Arcade & Games Hub</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </motion.button>

                  {/* 2. Dashboard Button (User Data, Bar Graph & Line Graph) */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => {
                      onNavigate?.("dashboard");
                      handleClose();
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      currentPage === "dashboard"
                        ? "border-orange-500 bg-orange-50/50 shadow-xs ring-1 ring-orange-200"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Dashboard</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                            Stats
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">User Data, Graphs & WPM</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </motion.button>

                  {/* 3. Keyboard Settings Button (Opens Theme Palette & Color Zones) */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setView("settings")}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50/30 flex items-center justify-between text-left transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-orange-100 text-slate-700 group-hover:text-orange-600 transition-colors">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Keyboard Settings</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="truncate max-w-[90px]">{currentTheme.name}</span>
                          <span>• Palette</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end text-xs text-slate-500">
                  <button
                    onClick={handleClose}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              /* ======================================================== */
              /* VIEW 2: SETTINGS / THEME PALETTE VIEW                    */
              /* ======================================================== */
              <div className="flex flex-col h-full">
                {/* Header with Back Button */}
                <div className="px-3.5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 pl-13">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setView("menu")}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs text-xs font-bold"
                      title="Back to Navigation"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-1.5 pl-0.5">
                      <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 border border-orange-200 shadow-xs">
                        <Palette className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h2 className="text-xs font-black tracking-tight text-slate-900">
                          Theme Palette
                        </h2>
                        <p className="text-[10px] text-slate-500">
                          Keycap colors
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Finger Color Zones Toggle Bar */}
                {onToggleColorZones && (
                  <div className="px-3.5 py-2 border-b border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full transition-colors ${colorZones ? "bg-orange-500 animate-pulse" : "bg-slate-300"}`} />
                      <div>
                        <div className="text-xs font-black text-slate-900">Color Zones</div>
                        <div className="text-[10px] text-slate-500">Touch typing RGB</div>
                      </div>
                    </div>

                    <button
                      onClick={onToggleColorZones}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border ${
                        colorZones
                          ? "bg-orange-500 text-white border-orange-600 shadow-xs"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colorZones ? "bg-white" : "bg-slate-400"}`} />
                      <span>{colorZones ? "ON" : "OFF"}</span>
                    </button>
                  </div>
                )}

                {/* Category Filter Pills */}
                <div className="px-3.5 pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-slate-100 bg-slate-50/50">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        activeCategory === cat
                          ? "bg-slate-900 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Theme List */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2.5 no-scrollbar">
                  {filteredThemes.map((theme) => {
                    const isSelected = currentTheme.id === theme.id;

                    return (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onSelectTheme(theme)}
                        className={`relative p-3 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? "border-orange-500 bg-orange-50/40 shadow-xs ring-1 ring-orange-200"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                        }`}
                      >
                        {/* Top Row: Theme Name + Badge + Check */}
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-slate-900">
                              {theme.name}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              {theme.category}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Tagline */}
                        <p className="text-[11px] text-slate-500 mb-2 line-clamp-1">
                          {theme.tagline}
                        </p>

                        {/* Palette Swatches & Mini Keycap Mockup */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                          {/* Color dots swatch */}
                          <div className="flex items-center gap-1">
                            {theme.previewColors.map((hex, idx) => (
                              <div
                                key={idx}
                                className="w-3.5 h-3.5 rounded-full border border-slate-300/80 shadow-xs"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </div>

                          {/* Mini visual preview keycaps */}
                          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200">
                            <span
                              className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-mono font-bold shadow-xs"
                              style={{
                                backgroundColor: theme.previewColors[1],
                                color: theme.previewColors[2],
                                border: `1px solid ${theme.previewColors[2]}`,
                              }}
                            >
                              A
                            </span>
                            <span
                              className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-mono font-bold shadow-xs text-white"
                              style={{
                                backgroundColor: theme.previewColors[3],
                              }}
                            >
                              ESC
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer with Back Button */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                  <button
                    onClick={() => setView("menu")}
                    className="flex items-center gap-1 font-bold text-slate-700 hover:text-slate-900 cursor-pointer text-xs"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default ThemeSidebar;
