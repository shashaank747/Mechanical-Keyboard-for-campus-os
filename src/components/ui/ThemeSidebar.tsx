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
  const [view, setView] = useState<"menu" | "settings">("menu");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(KEYBOARD_THEMES.map((t) => t.category)))];

  const filteredThemes =
    activeCategory === "All"
      ? KEYBOARD_THEMES
      : KEYBOARD_THEMES.filter((t) => t.category === activeCategory);

  // Lock background page scroll when sidebar is open and reset view on close/open
  React.useEffect(() => {
    if (isOpen) {
      setView("menu");
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    } else {
      // Reset to menu view when closed
      setView("menu");
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
            className="fixed top-0 left-0 bottom-0 w-full max-w-[270px] bg-white text-slate-900 z-50 shadow-2xl border-r-2 border-blue-200 flex flex-col overflow-hidden overscroll-contain touch-pan-y"
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
                        ? "border-2 border-blue-500 bg-blue-50 shadow-xs ring-1 ring-blue-300 text-slate-900"
                        : "border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
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
                        ? "border-2 border-blue-500 bg-blue-50 shadow-xs ring-1 ring-blue-300 text-slate-900"
                        : "border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 text-slate-800 shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Dashboard</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
                    className="w-full p-3 rounded-xl border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-between text-left transition-all cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white transition-colors border border-blue-200">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          <span>Keyboard Settings</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="truncate max-w-[90px] font-semibold text-blue-600">{currentTheme.name}</span>
                          <span>• Palette</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </motion.button>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-blue-200 bg-slate-50/80 flex items-center justify-end text-xs text-slate-500">
                  <button
                    onClick={handleClose}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
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
                {/* Header */}
                <div className="px-3.5 py-3 border-b border-blue-200 flex items-center justify-between bg-white pl-13">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 pl-0.5">
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 shadow-xs">
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
                  <div className="px-3.5 py-2 border-b border-blue-100 bg-blue-50/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full transition-colors ${colorZones ? "bg-blue-600 animate-pulse" : "bg-slate-400"}`} />
                      <div>
                        <div className="text-xs font-black text-slate-900">Color Zones</div>
                        <div className="text-[10px] text-slate-500">Touch typing RGB</div>
                      </div>
                    </div>

                    <button
                      onClick={onToggleColorZones}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 border ${
                        colorZones
                          ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                          : "bg-white border-blue-200 text-slate-700 hover:bg-blue-50"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${colorZones ? "bg-white" : "bg-slate-400"}`} />
                      <span>{colorZones ? "ON" : "OFF"}</span>
                    </button>
                  </div>
                )}

                {/* Category Filter Pills */}
                <div className="px-3.5 pt-2 pb-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-blue-100 bg-white">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        activeCategory === cat
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 border border-blue-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Theme List */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-2 no-scrollbar">
                  {filteredThemes.map((theme) => {
                    const isSelected = currentTheme.id === theme.id;

                    return (
                      <motion.div
                        key={theme.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => onSelectTheme(theme)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between gap-2 shadow-xs ${
                          isSelected
                            ? "border-2 border-blue-500 bg-blue-50/70 ring-1 ring-blue-300"
                            : "border border-blue-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-slate-800"
                        }`}
                      >
                        {/* Header Name & Selected Check */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isSelected && (
                            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {theme.name}
                          </span>
                        </div>

                        {/* What Colour It Is: Color dots swatch */}
                        <div className="flex items-center gap-1 shrink-0">
                          {theme.previewColors.map((hex, idx) => (
                            <div
                              key={idx}
                              className="w-3.5 h-3.5 rounded-full border border-blue-200 shadow-2xs"
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-blue-200 bg-slate-50/80 flex items-center justify-end text-xs text-slate-500">
                  <button
                    onClick={handleClose}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
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
