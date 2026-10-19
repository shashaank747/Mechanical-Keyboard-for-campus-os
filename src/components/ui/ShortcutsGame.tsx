"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Keyboard from "@/components/ui/keyboard";
import { type KeyboardTheme } from "@/lib/themes";
import { soundEngine } from "@/lib/sound";
import confetti from "canvas-confetti";
import {
  Laptop,
  Table,
  FileCode,
  Compass,
  FileText,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Trophy,
  Zap,
  Layers,
  Flame,
  Command,
  Check,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export interface ShortcutItem {
  id: string;
  keys: string; // e.g. "Ctrl + C"
  title: string;
  desc: string; // Meaning of the shortcut
  keyCodes: string[]; // Codes to highlight on 3D keyboard, e.g. ["ControlLeft", "KeyC"]
  checkMatch: (e: KeyboardEvent) => boolean;
}

export interface ShortcutCategory {
  id: string;
  title: string;
  tagline: string;
  icon: React.ElementType;
  badgeColor: string;
  color: string;
  gradient: string;
  description: string;
  shortcuts: ShortcutItem[];
}

export const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    id: "basic",
    title: "Basic Computer & OS",
    tagline: "Essential Windows & System Hotkeys",
    icon: Laptop,
    badgeColor: "bg-blue-600 text-white",
    color: "#2563eb",
    gradient: "from-blue-600/20 via-indigo-600/10 to-transparent",
    description: "Fundamental operating system shortcuts for clipboard management, undo/redo, file operations, and navigation.",
    shortcuts: [
      {
        id: "ctrl-c",
        keys: "Ctrl + C",
        title: "Copy Selection",
        desc: "Copies selected text, images, or files to your system clipboard without modifying the original.",
        keyCodes: ["ControlLeft", "KeyC"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyC" || e.key.toLowerCase() === "c"),
      },
      {
        id: "ctrl-v",
        keys: "Ctrl + V",
        title: "Paste Clipboard",
        desc: "Inserts the copied or cut item from your clipboard into the active document or folder.",
        keyCodes: ["ControlLeft", "KeyV"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyV" || e.key.toLowerCase() === "v"),
      },
      {
        id: "ctrl-x",
        keys: "Ctrl + X",
        title: "Cut Selection",
        desc: "Removes the selected content from its current position and stores it in clipboard for pasting.",
        keyCodes: ["ControlLeft", "KeyX"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyX" || e.key.toLowerCase() === "x"),
      },
      {
        id: "ctrl-z",
        keys: "Ctrl + Z",
        title: "Undo Action",
        desc: "Reverses your immediately preceding action, typing mistake, or file modification.",
        keyCodes: ["ControlLeft", "KeyZ"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyZ" || e.key.toLowerCase() === "z"),
      },
      {
        id: "ctrl-y",
        keys: "Ctrl + Y",
        title: "Redo Action",
        desc: "Reapplies an action or change that was previously undone by Ctrl + Z.",
        keyCodes: ["ControlLeft", "KeyY"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyY" || e.key.toLowerCase() === "y"),
      },
      {
        id: "ctrl-a",
        keys: "Ctrl + A",
        title: "Select All",
        desc: "Instantly highlights and selects all text, files, or elements in the active window.",
        keyCodes: ["ControlLeft", "KeyA"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyA" || e.key.toLowerCase() === "a"),
      },
      {
        id: "ctrl-s",
        keys: "Ctrl + S",
        title: "Save Document",
        desc: "Safely writes and saves your current file, document, or progress to local storage.",
        keyCodes: ["ControlLeft", "KeyS"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyS" || e.key.toLowerCase() === "s"),
      },
      {
        id: "ctrl-f",
        keys: "Ctrl + F",
        title: "Find on Page",
        desc: "Opens the search bar to locate specific text, numbers, or phrases on your screen.",
        keyCodes: ["ControlLeft", "KeyF"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyF" || e.key.toLowerCase() === "f"),
      },
      {
        id: "alt-tab",
        keys: "Alt + Tab",
        title: "Switch Applications",
        desc: "Toggles smoothly between currently active windows and running background programs.",
        keyCodes: ["AltLeft", "Tab"],
        checkMatch: (e) => e.altKey && (e.code === "Tab" || e.key === "Tab"),
      },
      {
        id: "win-d",
        keys: "Win + D",
        title: "Show Desktop",
        desc: "Instantly minimizes all open program windows to give immediate access to your desktop.",
        keyCodes: ["MetaLeft", "KeyD"],
        checkMatch: (e) => (e.metaKey || e.key === "Meta") && (e.code === "KeyD" || e.key.toLowerCase() === "d"),
      },
      {
        id: "ctrl-p",
        keys: "Ctrl + P",
        title: "Print Document",
        desc: "Launches the print preview and setup dialog to generate physical prints or PDF exports.",
        keyCodes: ["ControlLeft", "KeyP"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyP" || e.key.toLowerCase() === "p"),
      },
      {
        id: "win-period",
        keys: "Win + .",
        title: "Emoji & Symbol Panel",
        desc: "Opens the built-in operating system palette for inserting emojis, kaomojis, and symbols.",
        keyCodes: ["MetaLeft", "Period"],
        checkMatch: (e) => (e.metaKey || e.key === "Meta") && (e.code === "Period" || e.key === "."),
      },
    ],
  },
  {
    id: "excel",
    title: "Microsoft Excel & Sheets",
    tagline: "Grid Navigation, AutoSum & Formulas",
    icon: Table,
    badgeColor: "bg-emerald-600 text-white",
    color: "#059669",
    gradient: "from-emerald-600/20 via-teal-600/10 to-transparent",
    description: "High-speed shortcuts for financial modeling, column/row selection, auto-summing, and formula workflows.",
    shortcuts: [
      {
        id: "ctrl-space",
        keys: "Ctrl + Space",
        title: "Select Entire Column",
        desc: "Highlights and selects the full vertical table column of the active cell.",
        keyCodes: ["ControlLeft", "Space"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "Space" || e.key === " "),
      },
      {
        id: "shift-space",
        keys: "Shift + Space",
        title: "Select Entire Row",
        desc: "Highlights and selects the full horizontal table row across all columns.",
        keyCodes: ["ShiftLeft", "Space"],
        checkMatch: (e) => e.shiftKey && !e.ctrlKey && !e.altKey && (e.code === "Space" || e.key === " "),
      },
      {
        id: "alt-equal",
        keys: "Alt + =",
        title: "AutoSum Formula",
        desc: "Automatically detects adjacent numeric values and inserts a SUM formula.",
        keyCodes: ["AltLeft", "Equal"],
        checkMatch: (e) => e.altKey && (e.code === "Equal" || e.key === "=" || e.key === "+"),
      },
      {
        id: "ctrl-1",
        keys: "Ctrl + 1",
        title: "Format Cells Dialog",
        desc: "Opens the comprehensive Format Cells window for currencies, borders, fonts, and alignment.",
        keyCodes: ["ControlLeft", "Digit1"],
        checkMatch: (e) => e.ctrlKey && (e.code === "Digit1" || e.key === "1"),
      },
      {
        id: "ctrl-d",
        keys: "Ctrl + D",
        title: "Fill Down",
        desc: "Copies the contents and formula of the topmost cell in selected range down through cells.",
        keyCodes: ["ControlLeft", "KeyD"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyD" || e.key.toLowerCase() === "d"),
      },
      {
        id: "ctrl-r",
        keys: "Ctrl + R",
        title: "Fill Right",
        desc: "Copies the contents and formula of the leftmost cell in selected range rightward.",
        keyCodes: ["ControlLeft", "KeyR"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyR" || e.key.toLowerCase() === "r"),
      },
      {
        id: "ctrl-k",
        keys: "Ctrl + K",
        title: "Insert Hyperlink",
        desc: "Binds an external web URL, workbook cell bookmark, or email link to the active cell.",
        keyCodes: ["ControlLeft", "KeyK"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && (e.code === "KeyK" || e.key.toLowerCase() === "k"),
      },
      {
        id: "ctrl-h",
        keys: "Ctrl + H",
        title: "Find & Replace",
        desc: "Opens batch find-and-replace to swap values, account codes, or formula names across the sheet.",
        keyCodes: ["ControlLeft", "KeyH"],
        checkMatch: (e) => e.ctrlKey && (e.code === "KeyH" || e.key.toLowerCase() === "h"),
      },
      {
        id: "ctrl-home",
        keys: "Ctrl + Home",
        title: "Jump to Cell A1",
        desc: "Moves your spreadsheet cursor instantly back to the top-left origin cell (A1).",
        keyCodes: ["ControlLeft", "Home"],
        checkMatch: (e) => e.ctrlKey && (e.code === "Home" || e.key === "Home"),
      },
      {
        id: "f4",
        keys: "F4",
        title: "Repeat / Lock Absolute Ref ($)",
        desc: "Cycles formula cell reference modes (e.g. A1, $A$1, A$1, $A1) or repeats last format action.",
        keyCodes: ["F4"],
        checkMatch: (e) => e.code === "F4" || e.key === "F4",
      },
    ],
  },
  {
    id: "python",
    title: "Python & Coding (VS Code)",
    tagline: "Developer Productivity & IDE Shortcuts",
    icon: FileCode,
    badgeColor: "bg-indigo-600 text-white",
    color: "#4f46e5",
    gradient: "from-indigo-600/20 via-blue-600/10 to-transparent",
    description: "Pro developer shortcuts used in VS Code, PyCharm, and Jupyter for coding, debugging, and multi-editing.",
    shortcuts: [
      {
        id: "ctrl-shift-p",
        keys: "Ctrl + Shift + P",
        title: "Command Palette",
        desc: "Opens the global developer command palette to access every editor action, setting, or extension.",
        keyCodes: ["ControlLeft", "ShiftLeft", "KeyP"],
        checkMatch: (e) => e.ctrlKey && e.shiftKey && (e.code === "KeyP" || e.key.toLowerCase() === "p"),
      },
      {
        id: "ctrl-p",
        keys: "Ctrl + P",
        title: "Quick Open File",
        desc: "Searches fuzzy file names across the entire repository to quickly jump between scripts.",
        keyCodes: ["ControlLeft", "KeyP"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && !e.altKey && (e.code === "KeyP" || e.key.toLowerCase() === "p"),
      },
      {
        id: "ctrl-slash",
        keys: "Ctrl + /",
        title: "Toggle Line Comment",
        desc: "Adds or removes Python '#' or syntax comments on the selected code lines.",
        keyCodes: ["ControlLeft", "Slash"],
        checkMatch: (e) => e.ctrlKey && (e.code === "Slash" || e.key === "/"),
      },
      {
        id: "ctrl-b",
        keys: "Ctrl + B",
        title: "Toggle Sidebar",
        desc: "Hides or displays the project file explorer to maximize coding editor real estate.",
        keyCodes: ["ControlLeft", "KeyB"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyB" || e.key.toLowerCase() === "b"),
      },
      {
        id: "ctrl-backquote",
        keys: "Ctrl + `",
        title: "Toggle Integrated Terminal",
        desc: "Instantly brings up the bash / powershell terminal pane to run python scripts.",
        keyCodes: ["ControlLeft", "Backquote"],
        checkMatch: (e) => e.ctrlKey && (e.code === "Backquote" || e.key === "`" || e.key === "~"),
      },
      {
        id: "ctrl-d",
        keys: "Ctrl + D",
        title: "Multi-Cursor Next Match",
        desc: "Adds a cursor to the next occurrence of the highlighted variable for simultaneous editing.",
        keyCodes: ["ControlLeft", "KeyD"],
        checkMatch: (e) => e.ctrlKey && !e.altKey && !e.shiftKey && (e.code === "KeyD" || e.key.toLowerCase() === "d"),
      },
      {
        id: "alt-up",
        keys: "Alt + Up",
        title: "Move Line Up",
        desc: "Moves the current line or selected block of code up one row without cutting and pasting.",
        keyCodes: ["AltLeft", "ArrowUp"],
        checkMatch: (e) => e.altKey && !e.shiftKey && (e.code === "ArrowUp" || e.key === "ArrowUp"),
      },
      {
        id: "shift-alt-down",
        keys: "Shift + Alt + Down",
        title: "Duplicate Line Down",
        desc: "Clones the current code line directly below it for rapid template expansion.",
        keyCodes: ["ShiftLeft", "AltLeft", "ArrowDown"],
        checkMatch: (e) => e.shiftKey && e.altKey && (e.code === "ArrowDown" || e.key === "ArrowDown"),
      },
      {
        id: "ctrl-shift-f",
        keys: "Ctrl + Shift + F",
        title: "Find in Entire Project",
        desc: "Performs full workspace ripgrep search across all folders, modules, and imported files.",
        keyCodes: ["ControlLeft", "ShiftLeft", "KeyF"],
        checkMatch: (e) => e.ctrlKey && e.shiftKey && (e.code === "KeyF" || e.key.toLowerCase() === "f"),
      },
      {
        id: "f5",
        keys: "F5",
        title: "Run & Debug Python",
        desc: "Starts debugging session or executes the current active Python script.",
        keyCodes: ["F5"],
        checkMatch: (e) => e.code === "F5" || e.key === "F5",
      },
    ],
  },
  {
    id: "browser",
    title: "Web Browser & Research",
    tagline: "Tab Management & Web Navigation",
    icon: Compass,
    badgeColor: "bg-sky-600 text-white",
    color: "#0284c7",
    gradient: "from-sky-600/20 via-blue-600/10 to-transparent",
    description: "Master research and speed up internet browsing across Chrome, Edge, and Firefox.",
    shortcuts: [
      {
        id: "ctrl-t",
        keys: "Ctrl + T",
        title: "Open New Tab",
        desc: "Creates a brand new tab and sets keyboard focus immediately on address search bar.",
        keyCodes: ["ControlLeft", "KeyT"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyT" || e.key.toLowerCase() === "t"),
      },
      {
        id: "ctrl-w",
        keys: "Ctrl + W",
        title: "Close Active Tab",
        desc: "Instantly closes the current webpage tab without having to click the small 'x' button.",
        keyCodes: ["ControlLeft", "KeyW"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyW" || e.key.toLowerCase() === "w"),
      },
      {
        id: "ctrl-shift-t",
        keys: "Ctrl + Shift + T",
        title: "Reopen Closed Tab",
        desc: "Brings back the last tab you accidentally closed with all of its back-forward history.",
        keyCodes: ["ControlLeft", "ShiftLeft", "KeyT"],
        checkMatch: (e) => e.ctrlKey && e.shiftKey && (e.code === "KeyT" || e.key.toLowerCase() === "t"),
      },
      {
        id: "ctrl-l",
        keys: "Ctrl + L",
        title: "Focus Address Bar",
        desc: "Selects the URL bar so you can type a new search or website URL without touching the mouse.",
        keyCodes: ["ControlLeft", "KeyL"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyL" || e.key.toLowerCase() === "l"),
      },
      {
        id: "ctrl-r",
        keys: "Ctrl + R",
        title: "Reload Page",
        desc: "Refreshes and requests the latest version of the webpage from the web server.",
        keyCodes: ["ControlLeft", "KeyR"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyR" || e.key.toLowerCase() === "r"),
      },
      {
        id: "ctrl-shift-n",
        keys: "Ctrl + Shift + N",
        title: "New Incognito Window",
        desc: "Launches a private browsing session that does not save cookies or local browsing history.",
        keyCodes: ["ControlLeft", "ShiftLeft", "KeyN"],
        checkMatch: (e) => e.ctrlKey && e.shiftKey && (e.code === "KeyN" || e.key.toLowerCase() === "n"),
      },
      {
        id: "ctrl-tab",
        keys: "Ctrl + Tab",
        title: "Cycle Next Tab",
        desc: "Moves forward to the next tab to the right in your browser window.",
        keyCodes: ["ControlLeft", "Tab"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "Tab" || e.key === "Tab"),
      },
      {
        id: "ctrl-shift-tab",
        keys: "Ctrl + Shift + Tab",
        title: "Cycle Previous Tab",
        desc: "Moves backward to the tab on the left in your browser window.",
        keyCodes: ["ControlLeft", "ShiftLeft", "Tab"],
        checkMatch: (e) => e.ctrlKey && e.shiftKey && (e.code === "Tab" || e.key === "Tab"),
      },
    ],
  },
  {
    id: "editing",
    title: "Text Editing & Writing Pro",
    tagline: "Word Jumps, Deletions & Formatting",
    icon: FileText,
    badgeColor: "bg-purple-600 text-white",
    color: "#7c3aed",
    gradient: "from-purple-600/20 via-pink-600/10 to-transparent",
    description: "Accelerate typing documents and essays with whole-word jumps, swift deletions, and quick text styling.",
    shortcuts: [
      {
        id: "ctrl-left",
        keys: "Ctrl + Left",
        title: "Word Jump Left",
        desc: "Jumps the text cursor one full word to the left instead of single character steps.",
        keyCodes: ["ControlLeft", "ArrowLeft"],
        checkMatch: (e) => e.ctrlKey && (e.code === "ArrowLeft" || e.key === "ArrowLeft"),
      },
      {
        id: "ctrl-right",
        keys: "Ctrl + Right",
        title: "Word Jump Right",
        desc: "Jumps the text cursor one full word to the right for rapid text navigation.",
        keyCodes: ["ControlLeft", "ArrowRight"],
        checkMatch: (e) => e.ctrlKey && (e.code === "ArrowRight" || e.key === "ArrowRight"),
      },
      {
        id: "ctrl-backspace",
        keys: "Ctrl + Backspace",
        title: "Delete Word Left",
        desc: "Deletes the entire word immediately preceding the cursor in one keystroke.",
        keyCodes: ["ControlLeft", "Backspace"],
        checkMatch: (e) => e.ctrlKey && (e.code === "Backspace" || e.key === "Backspace"),
      },
      {
        id: "ctrl-delete",
        keys: "Ctrl + Delete",
        title: "Delete Word Right",
        desc: "Deletes the entire word immediately following the cursor.",
        keyCodes: ["ControlLeft", "Delete"],
        checkMatch: (e) => e.ctrlKey && (e.code === "Delete" || e.key === "Delete"),
      },
      {
        id: "ctrl-b",
        keys: "Ctrl + B",
        title: "Bold Formatting",
        desc: "Applies bold weight styling to highlighted words or active writing position.",
        keyCodes: ["ControlLeft", "KeyB"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyB" || e.key.toLowerCase() === "b"),
      },
      {
        id: "ctrl-i",
        keys: "Ctrl + I",
        title: "Italic Formatting",
        desc: "Applies italic slope styling to highlighted text.",
        keyCodes: ["ControlLeft", "KeyI"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyI" || e.key.toLowerCase() === "i"),
      },
      {
        id: "ctrl-u",
        keys: "Ctrl + U",
        title: "Underline Formatting",
        desc: "Draws an underline beneath the selected phrase or heading.",
        keyCodes: ["ControlLeft", "KeyU"],
        checkMatch: (e) => e.ctrlKey && !e.shiftKey && (e.code === "KeyU" || e.key.toLowerCase() === "u"),
      },
      {
        id: "home",
        keys: "Home",
        title: "Jump to Line Start",
        desc: "Instantly positions the writing cursor at the beginning of the active sentence or line.",
        keyCodes: ["Home"],
        checkMatch: (e) => e.code === "Home" || e.key === "Home",
      },
      {
        id: "end",
        keys: "End",
        title: "Jump to Line End",
        desc: "Instantly positions the writing cursor at the very end of the current line.",
        keyCodes: ["End"],
        checkMatch: (e) => e.code === "End" || e.key === "End",
      },
    ],
  },
];

export function ShortcutsGame({
  theme,
  colorZones,
  onBackToHome,
}: {
  theme?: KeyboardTheme;
  colorZones?: boolean;
  onBackToHome?: () => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<ShortcutCategory | null>(null);
  const [activeShortcutIndex, setActiveShortcutIndex] = useState<number>(0);
  const [masteredShortcuts, setMasteredShortcuts] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("setu_mastered_shortcuts");
        if (saved) return new Set(JSON.parse(saved));
      } catch {}
    }
    return new Set();
  });

  const [activePressedCombo, setActivePressedCombo] = useState<string>("");
  const [lastSuccessId, setLastSuccessId] = useState<string | null>(null);
  const [keyboardTestedKeys, setKeyboardTestedKeys] = useState<Set<string>>(new Set());

  const activeCategory = selectedCategory;
  const activeShortcut = activeCategory ? activeCategory.shortcuts[activeShortcutIndex] : null;
  const activeItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeItemRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, [activeShortcutIndex]);

  // Persist mastered shortcuts
  useEffect(() => {
    try {
      localStorage.setItem("setu_mastered_shortcuts", JSON.stringify(Array.from(masteredShortcuts)));
    } catch {}
  }, [masteredShortcuts]);

  // Handle Hardware Keyboard Interception
  useEffect(() => {
    if (!activeCategory || !activeShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Safe interception of browser default hotkeys
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.startsWith("F") || e.key === "Tab") {
        e.preventDefault();
      }

      // Build readable live combo string
      const parts: string[] = [];
      if (e.ctrlKey) parts.push("Ctrl");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");
      if (e.metaKey) parts.push("Win");

      const cleanKey =
        e.key === "Control" || e.key === "Alt" || e.key === "Shift" || e.key === "Meta"
          ? ""
          : e.key.length === 1
          ? e.key.toUpperCase()
          : e.key;

      if (cleanKey) parts.push(cleanKey);

      const comboStr = parts.join(" + ");
      setActivePressedCombo(comboStr || e.key);

      // Light up key on 3D mechanical keyboard
      setKeyboardTestedKeys((prev) => {
        const next = new Set(prev);
        if (e.code) next.add(e.code);
        return next;
      });

      // Play authentic mechanical key acoustic
      soundEngine.playKeySound(e.key);

      // Check if current target shortcut matches
      if (activeShortcut.checkMatch(e)) {
        triggerSuccess(activeShortcut);
      } else {
        // Check if any other shortcut in this category matches
        const matched = activeCategory.shortcuts.find((sc) => sc.checkMatch(e));
        if (matched) {
          triggerSuccess(matched);
        }
      }
    };

    const handleKeyUp = () => {
      // Clear live combo string after small delay
      setTimeout(() => {
        setActivePressedCombo("");
      }, 500);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeCategory, activeShortcut]);

  const triggerSuccess = (shortcut: ShortcutItem) => {
    setMasteredShortcuts((prev) => new Set(prev).add(shortcut.id));
    setLastSuccessId(shortcut.id);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {}

    // Auto-advance to next unmastered shortcut in category if current is mastered
    if (activeCategory) {
      setTimeout(() => {
        setLastSuccessId(null);
        const nextIndex = (activeShortcutIndex + 1) % activeCategory.shortcuts.length;
        setActiveShortcutIndex(nextIndex);
      }, 700);
    }
  };

  const handleSelectShortcut = (index: number) => {
    setActiveShortcutIndex(index);
    soundEngine.playKeySound("Enter");
  };

  const handleResetCategory = () => {
    if (!activeCategory) return;
    setMasteredShortcuts((prev) => {
      const next = new Set(prev);
      activeCategory.shortcuts.forEach((sc) => next.delete(sc.id));
      return next;
    });
    soundEngine.playKeySound("Backspace");
  };

  // =========================================================================
  // VIEW 1: CATEGORY SELECTION HUB (CARDS)
  // =========================================================================
  if (!selectedCategory) {
    return (
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-8 flex flex-col items-center gap-8 animate-in fade-in duration-300">
        {/* Standardized Suite Header */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
          <div className="flex items-center gap-2.5 flex-wrap">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
                title="Back to Games Hub"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Games Hub</span>
              </button>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
              <img
                src="/shortcutsdojoemblem.png"
                alt="Keyboard Shortcuts Dojo"
                className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer"
              />
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
                Keyboard Shortcuts Dojo
              </span>
            </div>

            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Interactive Hotkey Master
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-blue-700 text-xs font-mono font-bold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {masteredShortcuts.size} /{" "}
              {SHORTCUT_CATEGORIES.reduce((acc, cat) => acc + cat.shortcuts.length, 0)} Mastered
            </span>
          </div>
        </div>

        {/* Section Intro */}
        <div className="w-full flex flex-col items-start gap-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-black tracking-wider uppercase border border-blue-200 shadow-2xs">
            <Command className="w-3.5 h-3.5 text-blue-600" />
            <span>Select Shortcut Category</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Choose Your Practice Matrix
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Choose a software environment to practice essential hotkeys, learn the meaning and purpose of each command, and observe the live keys press on the virtual 3D mechanical keyboard.
          </p>
        </div>

        {/* Category Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SHORTCUT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const masteredCount = cat.shortcuts.filter((s) => masteredShortcuts.has(s.id)).length;
            const isCompleted = masteredCount === cat.shortcuts.length;

            return (
              <motion.div
                key={cat.id}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setSelectedCategory(cat);
                  setActiveShortcutIndex(0);
                  soundEngine.playKeySound("Enter");
                }}
                className="rounded-3xl border border-slate-200/90 bg-white hover:border-blue-400 text-slate-900 cursor-pointer shadow-[0_10px_28px_-6px_rgba(15,23,42,0.08),0_4px_10px_-2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_22px_45px_-10px_rgba(37,99,235,0.18)] flex flex-col justify-between group overflow-hidden ring-1 ring-black/[0.03]"
              >
                <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
                  {/* Category Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-2xs ${cat.badgeColor}`}>
                      {cat.shortcuts.length} Shortcuts
                    </span>
                    {isCompleted && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                        <Check className="w-3 h-3" />
                        <span>Mastered</span>
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-14 h-14 rounded-2xl border flex items-center justify-center p-2 shrink-0 transition-all duration-300 ease-out group-hover:scale-105 shadow-sm"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        borderColor: `${cat.color}40`,
                        color: cat.color,
                      }}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">
                        {cat.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                    {cat.description}
                  </p>

                  {/* Sample Shortcuts Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
                    {cat.shortcuts.slice(0, 4).map((sc) => (
                      <span
                        key={sc.id}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold border border-slate-200 bg-slate-50 text-slate-700"
                      >
                        {sc.keys}
                      </span>
                    ))}
                    {cat.shortcuts.length > 4 && (
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400">
                        +{cat.shortcuts.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-6 sm:px-7 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-600">
                    {masteredCount} / {cat.shortcuts.length} Practiced
                  </span>
                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform">
                    <span>ENTER DOJO</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: INTERACTIVE PRACTICE DOJO FOR SELECTED CATEGORY
  // =========================================================================
  const masteredCount = activeCategory.shortcuts.filter((s) => masteredShortcuts.has(s.id)).length;
  const isTargetMastered = activeShortcut ? masteredShortcuts.has(activeShortcut.id) : false;

  return (
    <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center gap-6 animate-in fade-in duration-300">
      {/* Top Header Navigation Bar (Standardized Suite Header) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-200">
        <div className="flex items-center gap-2.5 flex-wrap">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-600 text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Back to Games Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Games Hub</span>
            </button>
          )}

          <button
            onClick={() => {
              setSelectedCategory(null);
              soundEngine.playKeySound("Enter");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Switch Shortcut Category"
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>All Categories</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
            <img
              src="/shortcutsdojoemblem.png"
              alt="Keyboard Shortcuts Dojo"
              className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer"
            />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              {activeCategory.title}
            </span>
          </div>

          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {activeCategory.tagline}
          </span>
        </div>

        {/* Category Mastered Progress Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-blue-700 text-xs font-mono font-bold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span>
              {masteredCount} / {activeCategory.shortcuts.length} Mastered
            </span>
          </div>

          {masteredCount > 0 && (
            <button
              onClick={handleResetCategory}
              className="p-1.5 rounded-xl border border-blue-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
              title="Reset Category Progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Practice Container */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Current Target Shortcut & Live Input HUD (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Active Shortcut Card with Meaning */}
          {activeShortcut && (
            <div className="h-full p-6 sm:p-7 rounded-3xl border border-blue-200/90 bg-white shadow-[0_12px_32px_-6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] flex flex-col justify-between gap-4 relative overflow-hidden ring-1 ring-black/[0.03]">
              {/* Top Accent Gradient Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: activeCategory.color }}
              />

              <div className="flex items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Target Shortcut #{activeShortcutIndex + 1}</span>
                </span>

                {isTargetMastered && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mastered!</span>
                  </span>
                )}
              </div>

              {/* Big Shortcut Prompt Display */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    {activeShortcut.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    Press these keys together on your physical keyboard:
                  </p>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeShortcut.keys.split(" + ").map((keyStr, idx, arr) => (
                    <React.Fragment key={idx}>
                      <span className="px-3.5 py-2 rounded-xl border border-blue-300 bg-gradient-to-b from-blue-50 to-blue-100 text-blue-800 font-mono font-black text-base shadow-sm ring-1 ring-blue-500/20">
                        {keyStr}
                      </span>
                      {idx < arr.length - 1 && (
                        <span className="text-sm font-black text-slate-400">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Meaning & Purpose Section */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-3 h-3 text-blue-600" />
                  <span>Command Purpose & Action</span>
                </span>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
                  {activeShortcut.desc}
                </p>
              </div>

              {/* Live Input HUD & Status */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Your Live Input:
                  </span>
                  {activePressedCombo ? (
                    <span className="font-mono text-sm font-black px-3 py-1 rounded-xl bg-blue-600 text-white shadow-sm animate-pulse">
                      {activePressedCombo}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Press shortcut keys on your keyboard...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-mono text-slate-500">
                    Safe Browser Override
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Shortcuts Directory in this Category (5 Cols) */}
        <div className="lg:col-span-5 relative flex flex-col min-h-[360px] lg:min-h-0">
          <div className="lg:absolute lg:inset-0 p-5 sm:p-6 rounded-3xl border border-blue-200/90 bg-white shadow-[0_12px_32px_-6px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-black/[0.03] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Shortcuts in this Dojo ({activeCategory.shortcuts.length})
              </span>
              <span className="text-[10px] font-bold text-slate-500">
                Click any shortcut to practice
              </span>
            </div>

            <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1 min-h-0 pt-3">
              {activeCategory.shortcuts.map((sc, index) => {
                const isActive = index === activeShortcutIndex;
                const isMastered = masteredShortcuts.has(sc.id);
                const isJustSuccess = lastSuccessId === sc.id;

                return (
                  <div
                    key={sc.id}
                    ref={isActive ? activeItemRef : undefined}
                    onClick={() => handleSelectShortcut(index)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isJustSuccess
                        ? "bg-emerald-100 border-emerald-500 shadow-md scale-102"
                        : isActive
                        ? "bg-blue-50/90 border-blue-400 shadow-sm"
                        : isMastered
                        ? "bg-emerald-50/60 border-emerald-200 hover:border-emerald-300"
                        : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`px-2.5 py-1 rounded-xl font-mono text-xs font-bold border shrink-0 ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : isMastered
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        {sc.keys}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {sc.title}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {sc.desc}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isMastered ? (
                        <span className="p-1 rounded-full bg-emerald-100 text-emerald-600 inline-block">
                          <Check className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          #{index + 1}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3D Virtual Mechanical Keyboard */}
      <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 rounded-3xl border border-slate-200/90 bg-white shadow-[0_12px_32px_-6px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]">
        <div className="w-full flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
              Interactive 3D Mechanical Keyboard
            </span>
          </div>
          <span className="text-[11px] font-bold text-blue-600">
            Keys for &quot;{activeShortcut?.keys}&quot; highlighted with glowing accents
          </span>
        </div>

        <Keyboard
          className="mx-auto"
          theme={theme}
          colorZones={colorZones}
          testedKeys={keyboardTestedKeys}
          onTestedKeysChange={setKeyboardTestedKeys}
          interactive={true}
          allowMouseClick={true}
          highlightKeyCodes={activeShortcut ? activeShortcut.keyCodes : []}
          onKeyPress={(key, code) => {
            soundEngine.playKeySound(key);
            setActivePressedCombo(key.toUpperCase());
          }}
        />
      </div>
    </div>
  );
}
