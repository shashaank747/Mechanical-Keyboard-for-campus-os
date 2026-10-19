"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, FINGER_MAPPING, KEY_ZONE_COLORS } from "./keyboard";
import { type KeyboardTheme } from "@/lib/themes";
import { soundEngine } from "@/lib/sound";
import {
  Trophy,
  Sparkles,
  Flame,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  HelpCircle,
  Zap,
  Target,
  Award,
  ArrowRight,
  ArrowLeft,
  Layers,
  Volume2,
  ShieldCheck,
  Check,
  Lock,
  Unlock,
} from "lucide-react";
import confetti from "canvas-confetti";
import { updateStudentProgress } from "@/lib/db";

export interface GameStep {
  code: string;
  label: string;
  instruction: string;
  highlightCodes?: string[];
  tip?: string;
}

export interface GameLevel {
  id: number;
  title: string;
  subtitle: string;
  category: "basics" | "mapping" | "fingers" | "left_hand" | "right_hand";
  fingerFocus?: "all" | "index" | "middle" | "ring" | "pinky" | "left" | "right";
  description: string;
  steps: GameStep[];
}

// 16 COMPREHENSIVE LEVELS DESIGNED FOR STEP-BY-STEP MASTERY
export const GAME_LEVELS: GameLevel[] = [
  // ==========================================
  // LEVEL 1: Key Landmarks & Locations Basics
  // ==========================================
  {
    id: 1,
    title: "Key Map & Landmarks",
    subtitle: "Level 1 • The Foundation",
    category: "basics",
    fingerFocus: "all",
    description: "Learn where home row tactile bumps, edge anchors, and essential keys are located.",
    steps: [
      {
        code: "KeyF",
        label: "F",
        instruction: "Find Home Row Anchor: Press 'F' (feel the tactile bump on your physical key!)",
        tip: "Left Index Finger rests on 'F'. Look for the small raised tactile ridge.",
      },
      {
        code: "KeyJ",
        label: "J",
        instruction: "Find Home Row Anchor: Press 'J' (the other tactile ridge key)",
        tip: "Right Index Finger rests on 'J'. Your two index fingers anchor your entire typing posture!",
      },
      {
        code: "Space",
        label: "SPACE",
        instruction: "Find Center Bar: Press 'SPACE' (the widest key on the board)",
        tip: "Both thumbs hover over the Spacebar for effortless thumb taps.",
      },
      {
        code: "KeyA",
        label: "A",
        instruction: "Find Left Home Edge: Press 'A'",
        tip: "Left Pinky rests on 'A' — the leftmost letter on the home row.",
      },
      {
        code: "Semicolon",
        label: ";",
        instruction: "Find Right Home Edge: Press ';'",
        tip: "Right Pinky rests on ';' — the rightmost punctuation on the home row.",
      },
      {
        code: "Enter",
        label: "ENTER",
        instruction: "Find Action Command: Press 'ENTER'",
        tip: "Right Pinky swings right to confirm commands and start new lines.",
      },
      {
        code: "Backspace",
        label: "BACKSPACE",
        instruction: "Find Delete Command: Press 'BACKSPACE'",
        tip: "Top right corner key to delete mistakes.",
      },
      {
        code: "KeyE",
        label: "E",
        instruction: "Find Top Row Vowel: Press 'E'",
        tip: "Left Middle finger moves one row up from 'D'. 'E' is the most common English letter!",
      },
      {
        code: "KeyI",
        label: "I",
        instruction: "Find Top Row Vowel: Press 'I'",
        tip: "Right Middle finger moves one row up from 'K'.",
      },
      {
        code: "KeyO",
        label: "O",
        instruction: "Find Top Row Vowel: Press 'O'",
        tip: "Right Ring finger moves one row up from 'L'.",
      },
      {
        code: "KeyU",
        label: "U",
        instruction: "Find Top Row Vowel: Press 'U'",
        tip: "Right Index finger moves one row up from 'J'.",
      },
      {
        code: "KeyZ",
        label: "Z",
        instruction: "Find Bottom Left Corner: Press 'Z'",
        tip: "Left Pinky reaches down from 'A'.",
      },
      {
        code: "KeyM",
        label: "M",
        instruction: "Find Bottom Row Letter: Press 'M'",
        tip: "Right Index reaches down-left from 'J'.",
      },
      {
        code: "Escape",
        label: "ESC",
        instruction: "Find Master Escape: Press 'ESC'",
        tip: "Top left accent key to cancel dialogs and escape menus.",
      },
    ],
  },

  // ==========================================
  // LEVEL 2: 10-Finger & Hand Mapping
  // ==========================================
  {
    id: 2,
    title: "10-Finger Mapping",
    subtitle: "Level 2 • Ergonomic Rules",
    category: "mapping",
    fingerFocus: "all",
    description: "Discover which exact finger and hand controls each key column on the keyboard.",
    steps: [
      {
        code: "KeyF",
        label: "F",
        instruction: "Left Index Domain: Press 'F' (covers 4, 5, R, T, F, G, V, B)",
        highlightCodes: ["Digit4", "Digit5", "KeyR", "KeyT", "KeyF", "KeyG", "KeyV", "KeyB"],
        tip: "Left Index finger is a workhorse! It covers 2 vertical columns.",
      },
      {
        code: "KeyJ",
        label: "J",
        instruction: "Right Index Domain: Press 'J' (covers 6, 7, Y, U, H, J, N, M)",
        highlightCodes: ["Digit6", "Digit7", "KeyY", "KeyU", "KeyH", "KeyJ", "KeyN", "KeyM"],
        tip: "Right Index finger covers the right center columns.",
      },
      {
        code: "KeyD",
        label: "D",
        instruction: "Left Middle Domain: Press 'D' (covers 3, E, D, C)",
        highlightCodes: ["Digit3", "KeyE", "KeyD", "KeyC"],
        tip: "Left Middle finger travels straight up and down Column 3.",
      },
      {
        code: "KeyK",
        label: "K",
        instruction: "Right Middle Domain: Press 'K' (covers 8, I, K, comma)",
        highlightCodes: ["Digit8", "KeyI", "KeyK", "Comma"],
        tip: "Right Middle finger travels straight up and down Column 8.",
      },
      {
        code: "KeyS",
        label: "S",
        instruction: "Left Ring Domain: Press 'S' (covers 2, W, S, X)",
        highlightCodes: ["Digit2", "KeyW", "KeyS", "KeyX"],
        tip: "Left Ring finger travels straight up and down Column 2.",
      },
      {
        code: "KeyL",
        label: "L",
        instruction: "Right Ring Domain: Press 'L' (covers 9, O, L, period)",
        highlightCodes: ["Digit9", "KeyO", "KeyL", "Period"],
        tip: "Right Ring finger travels straight up and down Column 9.",
      },
      {
        code: "KeyA",
        label: "A",
        instruction: "Left Pinky Domain: Press 'A' (covers 1, Q, A, Z, Tab, Caps, Shift)",
        highlightCodes: ["Digit1", "KeyQ", "KeyA", "KeyZ", "Tab", "CapsLock", "ShiftLeft", "Escape"],
        tip: "Left Pinky handles outer left keys and modifiers.",
      },
      {
        code: "Semicolon",
        label: ";",
        instruction: "Right Pinky Domain: Press ';' (covers 0, P, ;, slash, Enter, Backspace)",
        highlightCodes: ["Digit0", "Minus", "Equal", "Backspace", "KeyP", "BracketLeft", "BracketRight", "Semicolon", "Quote", "Enter", "Slash", "ShiftRight"],
        tip: "Right Pinky controls punctuation and the entire right flank!",
      },
      {
        code: "Space",
        label: "SPACE",
        instruction: "Thumbs Domain: Press 'SPACE'",
        highlightCodes: ["Space"],
        tip: "Thumbs rest naturally on the space bar and never cross onto letters.",
      },
    ],
  },

  // ==========================================
  // LEVEL 3: Index Fingers Mastery
  // ==========================================
  {
    id: 3,
    title: "Index Fingers Mastery",
    subtitle: "Level 3 • The Dual Workhorses",
    category: "fingers",
    fingerFocus: "index",
    description: "Drill rapid reflexes across both index fingers (covering 4 key columns in total!).",
    steps: [
      { code: "KeyF", label: "F", instruction: "Left Index Home: Press 'F'", highlightCodes: ["KeyF", "KeyJ"] },
      { code: "KeyJ", label: "J", instruction: "Right Index Home: Press 'J'", highlightCodes: ["KeyF", "KeyJ"] },
      { code: "KeyR", label: "R", instruction: "Left Index Up: Press 'R'", highlightCodes: ["KeyR", "KeyU"] },
      { code: "KeyU", label: "U", instruction: "Right Index Up: Press 'U'", highlightCodes: ["KeyR", "KeyU"] },
      { code: "KeyV", label: "V", instruction: "Left Index Down: Press 'V'", highlightCodes: ["KeyV", "KeyM"] },
      { code: "KeyM", label: "M", instruction: "Right Index Down: Press 'M'", highlightCodes: ["KeyV", "KeyM"] },
      { code: "KeyG", label: "G", instruction: "Left Index Inward: Press 'G'", highlightCodes: ["KeyG", "KeyH"] },
      { code: "KeyH", label: "H", instruction: "Right Index Inward: Press 'H'", highlightCodes: ["KeyG", "KeyH"] },
      { code: "KeyT", label: "T", instruction: "Left Index High Reach: Press 'T'", highlightCodes: ["KeyT", "KeyY"] },
      { code: "KeyY", label: "Y", instruction: "Right Index High Reach: Press 'Y'", highlightCodes: ["KeyT", "KeyY"] },
      { code: "KeyB", label: "B", instruction: "Left Index Low Reach: Press 'B'", highlightCodes: ["KeyB", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Right Index Low Reach: Press 'N'", highlightCodes: ["KeyB", "KeyN"] },
      { code: "KeyF", label: "F", instruction: "Quick Rhythm: Press 'F'", highlightCodes: ["KeyF", "KeyJ", "KeyR", "KeyU"] },
      { code: "KeyJ", label: "J", instruction: "Quick Rhythm: Press 'J'", highlightCodes: ["KeyF", "KeyJ", "KeyR", "KeyU"] },
      { code: "KeyR", label: "R", instruction: "Quick Rhythm: Press 'R'", highlightCodes: ["KeyF", "KeyJ", "KeyR", "KeyU"] },
      { code: "KeyU", label: "U", instruction: "Quick Rhythm: Press 'U'", highlightCodes: ["KeyF", "KeyJ", "KeyR", "KeyU"] },
    ],
  },

  // ==========================================
  // LEVEL 4: Middle Fingers Mastery
  // ==========================================
  {
    id: 4,
    title: "Middle Fingers Mastery",
    subtitle: "Level 4 • The Tall Columns",
    category: "fingers",
    fingerFocus: "middle",
    description: "Train vertical agility with your longest and most precise fingers.",
    steps: [
      { code: "KeyD", label: "D", instruction: "Left Middle Home: Press 'D'", highlightCodes: ["KeyD", "KeyK"] },
      { code: "KeyK", label: "K", instruction: "Right Middle Home: Press 'K'", highlightCodes: ["KeyD", "KeyK"] },
      { code: "KeyE", label: "E", instruction: "Left Middle Up: Press 'E'", highlightCodes: ["KeyE", "KeyI"] },
      { code: "KeyI", label: "I", instruction: "Right Middle Up: Press 'I'", highlightCodes: ["KeyE", "KeyI"] },
      { code: "KeyC", label: "C", instruction: "Left Middle Down: Press 'C'", highlightCodes: ["KeyC", "Comma"] },
      { code: "Comma", label: ",", instruction: "Right Middle Down: Press ',' (comma)", highlightCodes: ["KeyC", "Comma"] },
      { code: "Digit3", label: "3", instruction: "Left Middle Top Reach: Press '3'", highlightCodes: ["Digit3", "Digit8"] },
      { code: "Digit8", label: "8", instruction: "Right Middle Top Reach: Press '8'", highlightCodes: ["Digit3", "Digit8"] },
      { code: "KeyD", label: "D", instruction: "Vertical Column Sweep: Press 'D'", highlightCodes: ["KeyD", "KeyE", "KeyC"] },
      { code: "KeyE", label: "E", instruction: "Vertical Column Sweep: Press 'E'", highlightCodes: ["KeyD", "KeyE", "KeyC"] },
      { code: "KeyC", label: "C", instruction: "Vertical Column Sweep: Press 'C'", highlightCodes: ["KeyD", "KeyE", "KeyC"] },
      { code: "KeyK", label: "K", instruction: "Vertical Column Sweep: Press 'K'", highlightCodes: ["KeyK", "KeyI", "Comma"] },
      { code: "KeyI", label: "I", instruction: "Vertical Column Sweep: Press 'I'", highlightCodes: ["KeyK", "KeyI", "Comma"] },
      { code: "Comma", label: ",", instruction: "Vertical Column Sweep: Press ','", highlightCodes: ["KeyK", "KeyI", "Comma"] },
    ],
  },

  // ==========================================
  // LEVEL 5: Ring Fingers Mastery
  // ==========================================
  {
    id: 5,
    title: "Ring Fingers Mastery",
    subtitle: "Level 5 • Precision & Agility",
    category: "fingers",
    fingerFocus: "ring",
    description: "Build independent control and muscle strength for your ring fingers.",
    steps: [
      { code: "KeyS", label: "S", instruction: "Left Ring Home: Press 'S'", highlightCodes: ["KeyS", "KeyL"] },
      { code: "KeyL", label: "L", instruction: "Right Ring Home: Press 'L'", highlightCodes: ["KeyS", "KeyL"] },
      { code: "KeyW", label: "W", instruction: "Left Ring Up: Press 'W'", highlightCodes: ["KeyW", "KeyO"] },
      { code: "KeyO", label: "O", instruction: "Right Ring Up: Press 'O'", highlightCodes: ["KeyW", "KeyO"] },
      { code: "KeyX", label: "X", instruction: "Left Ring Down: Press 'X'", highlightCodes: ["KeyX", "Period"] },
      { code: "Period", label: ".", instruction: "Right Ring Down: Press '.' (period)", highlightCodes: ["KeyX", "Period"] },
      { code: "Digit2", label: "2", instruction: "Left Ring Number Reach: Press '2'", highlightCodes: ["Digit2", "Digit9"] },
      { code: "Digit9", label: "9", instruction: "Right Ring Number Reach: Press '9'", highlightCodes: ["Digit2", "Digit9"] },
      { code: "KeyS", label: "S", instruction: "Ring Word Combo: Press 'S'", highlightCodes: ["KeyS", "KeyL", "KeyO", "KeyW"] },
      { code: "KeyL", label: "L", instruction: "Ring Word Combo: Press 'L'", highlightCodes: ["KeyS", "KeyL", "KeyO", "KeyW"] },
      { code: "KeyO", label: "O", instruction: "Ring Word Combo: Press 'O'", highlightCodes: ["KeyS", "KeyL", "KeyO", "KeyW"] },
      { code: "KeyW", label: "W", instruction: "Ring Word Combo: Press 'W' (Spells SLOW!)", highlightCodes: ["KeyS", "KeyL", "KeyO", "KeyW"] },
    ],
  },

  // ==========================================
  // LEVEL 6: Pinky & Modifiers Mastery
  // ==========================================
  {
    id: 6,
    title: "Pinky & Modifiers Mastery",
    subtitle: "Level 6 • The Reach Champions",
    category: "fingers",
    fingerFocus: "pinky",
    description: "Conquer the outer edges, action keys, and punctuation with confidence.",
    steps: [
      { code: "KeyA", label: "A", instruction: "Left Pinky Home: Press 'A'", highlightCodes: ["KeyA", "Semicolon"] },
      { code: "Semicolon", label: ";", instruction: "Right Pinky Home: Press ';'", highlightCodes: ["KeyA", "Semicolon"] },
      { code: "KeyQ", label: "Q", instruction: "Left Pinky Top: Press 'Q'", highlightCodes: ["KeyQ", "KeyP"] },
      { code: "KeyP", label: "P", instruction: "Right Pinky Top: Press 'P'", highlightCodes: ["KeyQ", "KeyP"] },
      { code: "KeyZ", label: "Z", instruction: "Left Pinky Bottom: Press 'Z'", highlightCodes: ["KeyZ", "Slash"] },
      { code: "Slash", label: "/", instruction: "Right Pinky Bottom: Press '/' (slash)", highlightCodes: ["KeyZ", "Slash"] },
      { code: "Tab", label: "TAB", instruction: "Left Pinky Reach: Press 'TAB'", highlightCodes: ["Tab"] },
      { code: "Enter", label: "ENTER", instruction: "Right Pinky Command: Press 'ENTER'", highlightCodes: ["Enter"] },
      { code: "Backspace", label: "BACKSPACE", instruction: "Right Pinky Top Reach: Press 'BACKSPACE'", highlightCodes: ["Backspace"] },
      { code: "ShiftLeft", label: "SHIFT", instruction: "Left Pinky Base: Press Left 'SHIFT'", highlightCodes: ["ShiftLeft"] },
      { code: "Space", label: "SPACE", instruction: "Grand Finale: Press 'SPACE' to complete the training!", highlightCodes: ["Space"] },
    ],
  },

  // =========================================================================
  // LEFT HAND ONLY SPECIALIST LEVELS (LEVELS 7 TO 11)
  // =========================================================================
  {
    id: 7,
    title: "Left Hand • Home Row Anchor",
    subtitle: "Left Hand Specialist • Level 1",
    category: "left_hand",
    fingerFocus: "left",
    description: "Build rapid left-hand muscle memory exclusively across A, S, D, F, and G.",
    steps: [
      { code: "KeyF", label: "F", instruction: "Left Index Anchor: Press 'F' (feel the tactile bump)", highlightCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"], tip: "Anchor your left index finger on 'F'." },
      { code: "KeyD", label: "D", instruction: "Left Middle Anchor: Press 'D'", highlightCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"], tip: "Left middle finger home base." },
      { code: "KeyS", label: "S", instruction: "Left Ring Anchor: Press 'S'", highlightCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"], tip: "Left ring finger home base." },
      { code: "KeyA", label: "A", instruction: "Left Pinky Anchor: Press 'A'", highlightCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"], tip: "Left pinky home base." },
      { code: "KeyG", label: "G", instruction: "Left Index Stretch: Press 'G'", highlightCodes: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG"], tip: "Left index reaches right to 'G'." },
      { code: "KeyA", label: "A", instruction: "Left Home Combo: Press 'A'", highlightCodes: ["KeyA", "KeyS"] },
      { code: "KeyS", label: "S", instruction: "Left Home Combo: Press 'S' (Spells AS)", highlightCodes: ["KeyA", "KeyS"] },
      { code: "KeyD", label: "D", instruction: "Left Home Combo: Press 'D'", highlightCodes: ["KeyD", "KeyA"] },
      { code: "KeyA", label: "A", instruction: "Left Home Combo: Press 'A'", highlightCodes: ["KeyD", "KeyA"] },
      { code: "KeyD", label: "D", instruction: "Left Home Combo: Press 'D' (Spells DAD)", highlightCodes: ["KeyD", "KeyA"] },
      { code: "KeyF", label: "F", instruction: "Left Home Combo: Press 'F'", highlightCodes: ["KeyF", "KeyA", "KeyD"] },
      { code: "KeyA", label: "A", instruction: "Left Home Combo: Press 'A'", highlightCodes: ["KeyF", "KeyA", "KeyD"] },
      { code: "KeyD", label: "D", instruction: "Left Home Combo: Press 'D' (Spells FAD)", highlightCodes: ["KeyF", "KeyA", "KeyD"] },
      { code: "KeyG", label: "G", instruction: "Left Home Combo: Press 'G'", highlightCodes: ["KeyG", "KeyA", "KeyS"] },
      { code: "KeyA", label: "A", instruction: "Left Home Combo: Press 'A'", highlightCodes: ["KeyG", "KeyA", "KeyS"] },
      { code: "KeyS", label: "S", instruction: "Left Home Combo: Press 'S' (Spells GAS)", highlightCodes: ["KeyG", "KeyA", "KeyS"] },
    ],
  },
  {
    id: 8,
    title: "Left Hand • Upper Row Reaches",
    subtitle: "Left Hand Specialist • Level 2",
    category: "left_hand",
    fingerFocus: "left",
    description: "Master upward reaches strictly with the left hand (Q, W, E, R, T).",
    steps: [
      { code: "KeyR", label: "R", instruction: "Left Index Up: Press 'R'", highlightCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"], tip: "Index moves up from 'F'." },
      { code: "KeyT", label: "T", instruction: "Left Index Up & Right: Press 'T'", highlightCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"], tip: "Index reaches up-right from 'F'." },
      { code: "KeyE", label: "E", instruction: "Left Middle Up: Press 'E'", highlightCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"], tip: "Middle finger moves up from 'D'." },
      { code: "KeyW", label: "W", instruction: "Left Ring Up: Press 'W'", highlightCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"], tip: "Ring finger moves up from 'S'." },
      { code: "KeyQ", label: "Q", instruction: "Left Pinky Up: Press 'Q'", highlightCodes: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT"], tip: "Pinky reaches up from 'A'." },
      { code: "KeyW", label: "W", instruction: "Left Word Combo: Press 'W'", highlightCodes: ["KeyW", "KeyE", "KeyT"] },
      { code: "KeyE", label: "E", instruction: "Left Word Combo: Press 'E'", highlightCodes: ["KeyW", "KeyE", "KeyT"] },
      { code: "KeyT", label: "T", instruction: "Left Word Combo: Press 'T' (Spells WET)", highlightCodes: ["KeyW", "KeyE", "KeyT"] },
      { code: "KeyT", label: "T", instruction: "Left Word Combo: Press 'T'", highlightCodes: ["KeyT", "KeyR", "KeyE"] },
      { code: "KeyR", label: "R", instruction: "Left Word Combo: Press 'R'", highlightCodes: ["KeyT", "KeyR", "KeyE"] },
      { code: "KeyE", label: "E", instruction: "Left Word Combo: Press 'E'", highlightCodes: ["KeyT", "KeyR", "KeyE"] },
      { code: "KeyE", label: "E", instruction: "Left Word Combo: Press 'E' (Spells TREE)", highlightCodes: ["KeyT", "KeyR", "KeyE"] },
      { code: "KeyW", label: "W", instruction: "Left Word Combo: Press 'W'", highlightCodes: ["KeyW", "KeyA", "KeyT", "KeyE", "KeyR"] },
      { code: "KeyA", label: "A", instruction: "Left Word Combo: Press 'A'", highlightCodes: ["KeyW", "KeyA", "KeyT", "KeyE", "KeyR"] },
      { code: "KeyT", label: "T", instruction: "Left Word Combo: Press 'T'", highlightCodes: ["KeyW", "KeyA", "KeyT", "KeyE", "KeyR"] },
      { code: "KeyE", label: "E", instruction: "Left Word Combo: Press 'E'", highlightCodes: ["KeyW", "KeyA", "KeyT", "KeyE", "KeyR"] },
      { code: "KeyR", label: "R", instruction: "Left Word Combo: Press 'R' (Spells WATER)", highlightCodes: ["KeyW", "KeyA", "KeyT", "KeyE", "KeyR"] },
    ],
  },
  {
    id: 9,
    title: "Left Hand • Lower Row Precision",
    subtitle: "Left Hand Specialist • Level 3",
    category: "left_hand",
    fingerFocus: "left",
    description: "Navigate downward extensions with pinpoint precision (Z, X, C, V, B).",
    steps: [
      { code: "KeyV", label: "V", instruction: "Left Index Down: Press 'V'", highlightCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], tip: "Index drops down from 'F'." },
      { code: "KeyB", label: "B", instruction: "Left Index Down & Right: Press 'B'", highlightCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], tip: "Index drops down-right from 'F'." },
      { code: "KeyC", label: "C", instruction: "Left Middle Down: Press 'C'", highlightCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], tip: "Middle drops down from 'D'." },
      { code: "KeyX", label: "X", instruction: "Left Ring Down: Press 'X'", highlightCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], tip: "Ring drops down from 'S'." },
      { code: "KeyZ", label: "Z", instruction: "Left Pinky Down: Press 'Z'", highlightCodes: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB"], tip: "Pinky drops down from 'A'." },
      { code: "KeyC", label: "C", instruction: "Left Combo: Press 'C'", highlightCodes: ["KeyC", "KeyA", "KeyB"] },
      { code: "KeyA", label: "A", instruction: "Left Combo: Press 'A'", highlightCodes: ["KeyC", "KeyA", "KeyB"] },
      { code: "KeyB", label: "B", instruction: "Left Combo: Press 'B' (Spells CAB)", highlightCodes: ["KeyC", "KeyA", "KeyB"] },
      { code: "KeyB", label: "B", instruction: "Left Combo: Press 'B'", highlightCodes: ["KeyB", "KeyE", "KeyA", "KeyR"] },
      { code: "KeyE", label: "E", instruction: "Left Combo: Press 'E'", highlightCodes: ["KeyB", "KeyE", "KeyA", "KeyR"] },
      { code: "KeyA", label: "A", instruction: "Left Combo: Press 'A'", highlightCodes: ["KeyB", "KeyE", "KeyA", "KeyR"] },
      { code: "KeyR", label: "R", instruction: "Left Combo: Press 'R' (Spells BEAR)", highlightCodes: ["KeyB", "KeyE", "KeyA", "KeyR"] },
      { code: "KeyC", label: "C", instruction: "Left Combo: Press 'C'", highlightCodes: ["KeyC", "KeyA", "KeyF", "KeyE"] },
      { code: "KeyA", label: "A", instruction: "Left Combo: Press 'A'", highlightCodes: ["KeyC", "KeyA", "KeyF", "KeyE"] },
      { code: "KeyF", label: "F", instruction: "Left Combo: Press 'F'", highlightCodes: ["KeyC", "KeyA", "KeyF", "KeyE"] },
      { code: "KeyE", label: "E", instruction: "Left Combo: Press 'E' (Spells CAFE)", highlightCodes: ["KeyC", "KeyA", "KeyF", "KeyE"] },
    ],
  },
  {
    id: 10,
    title: "Left Hand • Numbers & Modifiers",
    subtitle: "Left Hand Specialist • Level 4",
    category: "left_hand",
    fingerFocus: "left",
    description: "Reach the left numerical row and auxiliary control keys (1-5, TAB, SHIFT, ESC).",
    steps: [
      { code: "Escape", label: "ESC", instruction: "Left Pinky Top-Left: Press 'ESC'", highlightCodes: ["Escape"] },
      { code: "Digit1", label: "1", instruction: "Left Pinky Reach: Press '1'", highlightCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"] },
      { code: "Digit2", label: "2", instruction: "Left Ring Reach: Press '2'", highlightCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"] },
      { code: "Digit3", label: "3", instruction: "Left Middle Reach: Press '3'", highlightCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"] },
      { code: "Digit4", label: "4", instruction: "Left Index Reach: Press '4'", highlightCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"] },
      { code: "Digit5", label: "5", instruction: "Left Index Inner: Press '5'", highlightCodes: ["Digit1", "Digit2", "Digit3", "Digit4", "Digit5"] },
      { code: "Tab", label: "TAB", instruction: "Left Pinky Command: Press 'TAB'", highlightCodes: ["Tab"] },
      { code: "ShiftLeft", label: "SHIFT", instruction: "Left Pinky Anchor: Press Left 'SHIFT'", highlightCodes: ["ShiftLeft"] },
      { code: "CapsLock", label: "CAPS", instruction: "Left Pinky Toggle: Press 'CAPS LOCK'", highlightCodes: ["CapsLock"] },
      { code: "Digit1", label: "1", instruction: "Left Numerical Run: Press '1'", highlightCodes: ["Digit1", "KeyQ"] },
      { code: "KeyQ", label: "Q", instruction: "Left Numerical Run: Press 'Q'", highlightCodes: ["Digit1", "KeyQ"] },
      { code: "Digit2", label: "2", instruction: "Left Numerical Run: Press '2'", highlightCodes: ["Digit2", "KeyW"] },
      { code: "KeyW", label: "W", instruction: "Left Numerical Run: Press 'W'", highlightCodes: ["Digit2", "KeyW"] },
      { code: "Digit3", label: "3", instruction: "Left Numerical Run: Press '3'", highlightCodes: ["Digit3", "KeyE"] },
      { code: "KeyE", label: "E", instruction: "Left Numerical Run: Press 'E'", highlightCodes: ["Digit3", "KeyE"] },
    ],
  },
  {
    id: 11,
    title: "Left Hand • Pure Word Rush",
    subtitle: "Left Hand Specialist • Level 5",
    category: "left_hand",
    fingerFocus: "left",
    description: "Flow through complete English words written 100% using ONLY your left hand!",
    steps: [
      { code: "KeyD", label: "D", instruction: "Spell 'DRAFT': Press 'D'", highlightCodes: ["KeyD", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyR", label: "R", instruction: "Spell 'DRAFT': Press 'R'", highlightCodes: ["KeyD", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyA", label: "A", instruction: "Spell 'DRAFT': Press 'A'", highlightCodes: ["KeyD", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyF", label: "F", instruction: "Spell 'DRAFT': Press 'F'", highlightCodes: ["KeyD", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyT", label: "T", instruction: "Spell 'DRAFT': Press 'T'", highlightCodes: ["KeyD", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyC", label: "C", instruction: "Spell 'CRAFT': Press 'C'", highlightCodes: ["KeyC", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyR", label: "R", instruction: "Spell 'CRAFT': Press 'R'", highlightCodes: ["KeyC", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyA", label: "A", instruction: "Spell 'CRAFT': Press 'A'", highlightCodes: ["KeyC", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyF", label: "F", instruction: "Spell 'CRAFT': Press 'F'", highlightCodes: ["KeyC", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyT", label: "T", instruction: "Spell 'CRAFT': Press 'T'", highlightCodes: ["KeyC", "KeyR", "KeyA", "KeyF", "KeyT"] },
      { code: "KeyS", label: "S", instruction: "Spell 'SECRET': Press 'S'", highlightCodes: ["KeyS", "KeyE", "KeyC", "KeyR", "KeyT"] },
      { code: "KeyE", label: "E", instruction: "Spell 'SECRET': Press 'E'", highlightCodes: ["KeyS", "KeyE", "KeyC", "KeyR", "KeyT"] },
      { code: "KeyC", label: "C", instruction: "Spell 'SECRET': Press 'C'", highlightCodes: ["KeyS", "KeyE", "KeyC", "KeyR", "KeyT"] },
      { code: "KeyR", label: "R", instruction: "Spell 'SECRET': Press 'R'", highlightCodes: ["KeyS", "KeyE", "KeyC", "KeyR", "KeyT"] },
      { code: "KeyE", label: "E", instruction: "Spell 'SECRET': Press 'E'", highlightCodes: ["KeyS", "KeyE", "KeyC", "KeyR", "KeyT"] },
      { code: "KeyT", label: "T", instruction: "Spell 'SECRET': Press 'T' (Grand Left-Hand Word!)", highlightCodes: ["KeyS", "KeyE", "KeyC", "KeyR", "KeyT"] },
    ],
  },

  // =========================================================================
  // RIGHT HAND ONLY SPECIALIST LEVELS (LEVELS 12 TO 16)
  // =========================================================================
  {
    id: 12,
    title: "Right Hand • Home Row Anchor",
    subtitle: "Right Hand Specialist • Level 1",
    category: "right_hand",
    fingerFocus: "right",
    description: "Build rapid right-hand muscle memory exclusively across H, J, K, L, ;, and ENTER.",
    steps: [
      { code: "KeyJ", label: "J", instruction: "Right Index Anchor: Press 'J' (feel the tactile bump)", highlightCodes: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Enter"], tip: "Anchor your right index finger." },
      { code: "KeyH", label: "H", instruction: "Right Index Inner Reach: Press 'H'", highlightCodes: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Enter"], tip: "Index reaches left to 'H'." },
      { code: "KeyK", label: "K", instruction: "Right Middle Anchor: Press 'K'", highlightCodes: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Enter"], tip: "Right middle finger home base." },
      { code: "KeyL", label: "L", instruction: "Right Ring Anchor: Press 'L'", highlightCodes: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Enter"], tip: "Right ring finger home base." },
      { code: "Semicolon", label: ";", instruction: "Right Pinky Anchor: Press ';'", highlightCodes: ["KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Enter"], tip: "Right pinky home base." },
      { code: "Quote", label: "'", instruction: "Right Pinky Outer Reach: Press \"'\"", highlightCodes: ["Quote"] },
      { code: "Enter", label: "ENTER", instruction: "Right Pinky Command: Press 'ENTER'", highlightCodes: ["Enter"] },
      { code: "KeyJ", label: "J", instruction: "Right Home Run: Press 'J'", highlightCodes: ["KeyJ", "KeyK", "KeyL", "Semicolon"] },
      { code: "KeyK", label: "K", instruction: "Right Home Run: Press 'K'", highlightCodes: ["KeyJ", "KeyK", "KeyL", "Semicolon"] },
      { code: "KeyL", label: "L", instruction: "Right Home Run: Press 'L'", highlightCodes: ["KeyJ", "KeyK", "KeyL", "Semicolon"] },
      { code: "Semicolon", label: ";", instruction: "Right Home Run: Press ';'", highlightCodes: ["KeyJ", "KeyK", "KeyL", "Semicolon"] },
      { code: "Enter", label: "ENTER", instruction: "Right Home Run: Press 'ENTER' to complete!", highlightCodes: ["Enter"] },
    ],
  },
  {
    id: 13,
    title: "Right Hand • Upper Row Reaches",
    subtitle: "Right Hand Specialist • Level 2",
    category: "right_hand",
    fingerFocus: "right",
    description: "Master upward reaches strictly with the right hand (Y, U, I, O, P, [, ]).",
    steps: [
      { code: "KeyU", label: "U", instruction: "Right Index Up: Press 'U'", highlightCodes: ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], tip: "Index moves up from 'J'." },
      { code: "KeyY", label: "Y", instruction: "Right Index Up & Left: Press 'Y'", highlightCodes: ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], tip: "Index reaches up-left from 'J'." },
      { code: "KeyI", label: "I", instruction: "Right Middle Up: Press 'I'", highlightCodes: ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], tip: "Middle moves up from 'K'." },
      { code: "KeyO", label: "O", instruction: "Right Ring Up: Press 'O'", highlightCodes: ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], tip: "Ring moves up from 'L'." },
      { code: "KeyP", label: "P", instruction: "Right Pinky Up: Press 'P'", highlightCodes: ["KeyY", "KeyU", "KeyI", "KeyO", "KeyP"], tip: "Pinky reaches up from ';'." },
      { code: "KeyY", label: "Y", instruction: "Right Word Combo: Press 'Y'", highlightCodes: ["KeyY", "KeyO", "KeyU"] },
      { code: "KeyO", label: "O", instruction: "Right Word Combo: Press 'O'", highlightCodes: ["KeyY", "KeyO", "KeyU"] },
      { code: "KeyU", label: "U", instruction: "Right Word Combo: Press 'U' (Spells YOU)", highlightCodes: ["KeyY", "KeyO", "KeyU"] },
      { code: "KeyH", label: "H", instruction: "Right Word Combo: Press 'H'", highlightCodes: ["KeyH", "KeyI", "KeyP"] },
      { code: "KeyI", label: "I", instruction: "Right Word Combo: Press 'I'", highlightCodes: ["KeyH", "KeyI", "KeyP"] },
      { code: "KeyP", label: "P", instruction: "Right Word Combo: Press 'P' (Spells HIP)", highlightCodes: ["KeyH", "KeyI", "KeyP"] },
      { code: "KeyO", label: "O", instruction: "Right Word Combo: Press 'O'", highlightCodes: ["KeyO", "KeyI", "KeyL"] },
      { code: "KeyI", label: "I", instruction: "Right Word Combo: Press 'I'", highlightCodes: ["KeyO", "KeyI", "KeyL"] },
      { code: "KeyL", label: "L", instruction: "Right Word Combo: Press 'L' (Spells OIL)", highlightCodes: ["KeyO", "KeyI", "KeyL"] },
      { code: "KeyL", label: "L", instruction: "Right Word Combo: Press 'L'", highlightCodes: ["KeyL", "KeyI", "KeyL", "KeyY"] },
      { code: "KeyI", label: "I", instruction: "Right Word Combo: Press 'I'", highlightCodes: ["KeyL", "KeyI", "KeyL", "KeyY"] },
      { code: "KeyL", label: "L", instruction: "Right Word Combo: Press 'L'", highlightCodes: ["KeyL", "KeyI", "KeyL", "KeyY"] },
      { code: "KeyY", label: "Y", instruction: "Right Word Combo: Press 'Y' (Spells LILY)", highlightCodes: ["KeyL", "KeyI", "KeyL", "KeyY"] },
    ],
  },
  {
    id: 14,
    title: "Right Hand • Lower Row & Punctuations",
    subtitle: "Right Hand Specialist • Level 3",
    category: "right_hand",
    fingerFocus: "right",
    description: "Navigate downward extensions with the right hand (N, M, COMMA, PERIOD, SLASH).",
    steps: [
      { code: "KeyN", label: "N", instruction: "Right Index Down & Left: Press 'N'", highlightCodes: ["KeyN", "KeyM", "Comma", "Period", "Slash"], tip: "Index drops down-left from 'J'." },
      { code: "KeyM", label: "M", instruction: "Right Index Down: Press 'M'", highlightCodes: ["KeyN", "KeyM", "Comma", "Period", "Slash"], tip: "Index drops down from 'J'." },
      { code: "Comma", label: ",", instruction: "Right Middle Down: Press ',' (comma)", highlightCodes: ["KeyN", "KeyM", "Comma", "Period", "Slash"], tip: "Middle drops down from 'K'." },
      { code: "Period", label: ".", instruction: "Right Ring Down: Press '.' (period)", highlightCodes: ["KeyN", "KeyM", "Comma", "Period", "Slash"], tip: "Ring drops down from 'L'." },
      { code: "Slash", label: "/", instruction: "Right Pinky Down: Press '/' (slash)", highlightCodes: ["KeyN", "KeyM", "Comma", "Period", "Slash"], tip: "Pinky drops down from ';'." },
      { code: "KeyI", label: "I", instruction: "Right Combo: Press 'I'", highlightCodes: ["KeyI", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Right Combo: Press 'N' (Spells IN)", highlightCodes: ["KeyI", "KeyN"] },
      { code: "KeyO", label: "O", instruction: "Right Combo: Press 'O'", highlightCodes: ["KeyO", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Right Combo: Press 'N' (Spells ON)", highlightCodes: ["KeyO", "KeyN"] },
      { code: "KeyM", label: "M", instruction: "Right Combo: Press 'M'", highlightCodes: ["KeyM", "KeyO", "KeyN", "KeyK"] },
      { code: "KeyO", label: "O", instruction: "Right Combo: Press 'O'", highlightCodes: ["KeyM", "KeyO", "KeyN", "KeyK"] },
      { code: "KeyN", label: "N", instruction: "Right Combo: Press 'N'", highlightCodes: ["KeyM", "KeyO", "KeyN", "KeyK"] },
      { code: "KeyK", label: "K", instruction: "Right Combo: Press 'K' (Spells MONK)", highlightCodes: ["KeyM", "KeyO", "KeyN", "KeyK"] },
      { code: "KeyM", label: "M", instruction: "Right Combo: Press 'M'", highlightCodes: ["KeyM", "KeyO", "KeyO", "KeyN"] },
      { code: "KeyO", label: "O", instruction: "Right Combo: Press 'O'", highlightCodes: ["KeyM", "KeyO", "KeyO", "KeyN"] },
      { code: "KeyO", label: "O", instruction: "Right Combo: Press 'O'", highlightCodes: ["KeyM", "KeyO", "KeyO", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Right Combo: Press 'N' (Spells MOON)", highlightCodes: ["KeyM", "KeyO", "KeyO", "KeyN"] },
    ],
  },
  {
    id: 15,
    title: "Right Hand • Digits, Symbols & Commands",
    subtitle: "Right Hand Specialist • Level 4",
    category: "right_hand",
    fingerFocus: "right",
    description: "Reach the right numerical row, arithmetic symbols, and backspace (6-0, -, =, BACKSPACE).",
    steps: [
      { code: "Digit6", label: "6", instruction: "Right Index Inner Reach: Press '6'", highlightCodes: ["Digit6", "Digit7", "Digit8", "Digit9", "Digit0"] },
      { code: "Digit7", label: "7", instruction: "Right Index Reach: Press '7'", highlightCodes: ["Digit6", "Digit7", "Digit8", "Digit9", "Digit0"] },
      { code: "Digit8", label: "8", instruction: "Right Middle Reach: Press '8'", highlightCodes: ["Digit6", "Digit7", "Digit8", "Digit9", "Digit0"] },
      { code: "Digit9", label: "9", instruction: "Right Ring Reach: Press '9'", highlightCodes: ["Digit6", "Digit7", "Digit8", "Digit9", "Digit0"] },
      { code: "Digit0", label: "0", instruction: "Right Pinky Reach: Press '0'", highlightCodes: ["Digit6", "Digit7", "Digit8", "Digit9", "Digit0"] },
      { code: "Minus", label: "-", instruction: "Right Pinky Reach: Press '-' (hyphen)", highlightCodes: ["Minus"] },
      { code: "Equal", label: "=", instruction: "Right Pinky Reach: Press '=' (equals)", highlightCodes: ["Equal"] },
      { code: "Backspace", label: "BACKSPACE", instruction: "Right Pinky Top Corner: Press 'BACKSPACE'", highlightCodes: ["Backspace"] },
      { code: "Digit7", label: "7", instruction: "Right Number Run: Press '7'", highlightCodes: ["Digit7", "KeyU"] },
      { code: "KeyU", label: "U", instruction: "Right Number Run: Press 'U'", highlightCodes: ["Digit7", "KeyU"] },
      { code: "Digit8", label: "8", instruction: "Right Number Run: Press '8'", highlightCodes: ["Digit8", "KeyI"] },
      { code: "KeyI", label: "I", instruction: "Right Number Run: Press 'I'", highlightCodes: ["Digit8", "KeyI"] },
      { code: "Digit9", label: "9", instruction: "Right Number Run: Press '9'", highlightCodes: ["Digit9", "KeyO"] },
      { code: "KeyO", label: "O", instruction: "Right Number Run: Press 'O'", highlightCodes: ["Digit9", "KeyO"] },
      { code: "Digit0", label: "0", instruction: "Right Number Run: Press '0'", highlightCodes: ["Digit0", "KeyP"] },
      { code: "KeyP", label: "P", instruction: "Right Number Run: Press 'P'", highlightCodes: ["Digit0", "KeyP"] },
      { code: "Backspace", label: "BACKSPACE", instruction: "Finish Run: Press 'BACKSPACE'", highlightCodes: ["Backspace"] },
    ],
  },
  {
    id: 16,
    title: "Right Hand • Pure Word Rush",
    subtitle: "Right Hand Specialist • Level 5",
    category: "right_hand",
    fingerFocus: "right",
    description: "Flow through complete English words written 100% using ONLY your right hand!",
    steps: [
      { code: "KeyL", label: "L", instruction: "Spell 'LOOK': Press 'L'", highlightCodes: ["KeyL", "KeyO", "KeyK"] },
      { code: "KeyO", label: "O", instruction: "Spell 'LOOK': Press 'O'", highlightCodes: ["KeyL", "KeyO", "KeyK"] },
      { code: "KeyO", label: "O", instruction: "Spell 'LOOK': Press 'O'", highlightCodes: ["KeyL", "KeyO", "KeyK"] },
      { code: "KeyK", label: "K", instruction: "Spell 'LOOK': Press 'K'", highlightCodes: ["KeyL", "KeyO", "KeyK"] },
      { code: "KeyJ", label: "J", instruction: "Spell 'JOIN': Press 'J'", highlightCodes: ["KeyJ", "KeyO", "KeyI", "KeyN"] },
      { code: "KeyO", label: "O", instruction: "Spell 'JOIN': Press 'O'", highlightCodes: ["KeyJ", "KeyO", "KeyI", "KeyN"] },
      { code: "KeyI", label: "I", instruction: "Spell 'JOIN': Press 'I'", highlightCodes: ["KeyJ", "KeyO", "KeyI", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Spell 'JOIN': Press 'N'", highlightCodes: ["KeyJ", "KeyO", "KeyI", "KeyN"] },
      { code: "KeyP", label: "P", instruction: "Spell 'PULL': Press 'P'", highlightCodes: ["KeyP", "KeyU", "KeyL"] },
      { code: "KeyU", label: "U", instruction: "Spell 'PULL': Press 'U'", highlightCodes: ["KeyP", "KeyU", "KeyL"] },
      { code: "KeyL", label: "L", instruction: "Spell 'PULL': Press 'L'", highlightCodes: ["KeyP", "KeyU", "KeyL"] },
      { code: "KeyL", label: "L", instruction: "Spell 'PULL': Press 'L'", highlightCodes: ["KeyP", "KeyU", "KeyL"] },
      { code: "KeyO", label: "O", instruction: "Spell 'OPINION': Press 'O'", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
      { code: "KeyP", label: "P", instruction: "Spell 'OPINION': Press 'P'", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
      { code: "KeyI", label: "I", instruction: "Spell 'OPINION': Press 'I'", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Spell 'OPINION': Press 'N'", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
      { code: "KeyI", label: "I", instruction: "Spell 'OPINION': Press 'I'", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
      { code: "KeyO", label: "O", instruction: "Spell 'OPINION': Press 'O'", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
      { code: "KeyN", label: "N", instruction: "Spell 'OPINION': Press 'N' (Grand Right-Hand Word!)", highlightCodes: ["KeyO", "KeyP", "KeyI", "KeyN"] },
    ],
  },
];

// Reusable Animated Donut Pie Chart Component
export function DonutProgressChart({
  percent,
  size = 100,
  strokeWidth = 9,
  isDark = true,
  label,
  sublabel,
  showCenterText = true,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  isDark?: boolean;
  label?: string;
  sublabel?: string;
  showCenterText?: boolean;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  const gradientId = `donutGradient-${size}-${percent}`;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="60%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? "#1e293b" : "#e2e8f0"}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Donut Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={percent > 0 ? `url(#${gradientId})` : "transparent"}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Center Label Display */}
      {showCenterText && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-mono font-black text-base sm:text-lg tracking-tight">
            {label ?? `${percent}%`}
          </span>
          {sublabel && (
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// =========================================================================
// INTERACTIVE DUAL-HANDS FINGER VISUALIZER COMPONENT
// =========================================================================
export function HandsFingerVisualizer({
  activeHand,
  activeFinger,
  activeColor = "#10b981",
  isDark = true,
  compact = false,
}: {
  activeHand?: "left" | "right";
  activeFinger?: "pinky" | "ring" | "middle" | "index" | "thumb";
  activeColor?: string;
  isDark?: boolean;
  compact?: boolean;
}) {
  const leftFingers: { id: "pinky" | "ring" | "middle" | "index" | "thumb"; name: string; short: string; color: string }[] = [
    { id: "pinky", name: "Pinky", short: "P", color: "#ef446a" },
    { id: "ring", name: "Ring", short: "R", color: "#f97316" },
    { id: "middle", name: "Middle", short: "M", color: "#eab308" },
    { id: "index", name: "Index", short: "I", color: "#10b981" },
    { id: "thumb", name: "Thumb", short: "T", color: "#06b6d4" },
  ];

  const rightFingers: { id: "thumb" | "index" | "middle" | "ring" | "pinky"; name: string; short: string; color: string }[] = [
    { id: "thumb", name: "Thumb", short: "T", color: "#06b6d4" },
    { id: "index", name: "Index", short: "I", color: "#3b82f6" },
    { id: "middle", name: "Middle", short: "M", color: "#8b5cf6" },
    { id: "ring", name: "Ring", short: "R", color: "#d946ef" },
    { id: "pinky", name: "Pinky", short: "P", color: "#ec4899" },
  ];

  const baseHeights: Record<string, number> = compact
    ? { pinky: 22, ring: 30, middle: 36, index: 28, thumb: 18 }
    : { pinky: 38, ring: 52, middle: 62, index: 50, thumb: 34 };

  const getActiveTitle = () => {
    if (!activeHand || !activeFinger) return "Ready to type";
    const handStr = activeHand === "left" ? "LEFT" : "RIGHT";
    const fingerStr = activeFinger.toUpperCase();
    return `${handStr} ${fingerStr}`;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center select-none w-full transition-all ${
        compact
          ? "p-1.5 rounded-xl border bg-transparent border-slate-200/60 dark:border-slate-800/80"
          : isDark
          ? "p-3 sm:p-4 rounded-2xl border bg-slate-950/90 border-slate-800 text-white"
          : "p-3 sm:p-4 rounded-2xl border bg-slate-50 border-slate-200 text-slate-900"
      }`}
    >
      {/* Active Finger Target Banner */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border shadow-2xs ${
          compact ? "mb-1 text-[10px]" : "mb-2 text-xs"
        } ${
          isDark
            ? "bg-slate-900/90 border-slate-800 text-white"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <span
          className="w-2 h-2 rounded-full animate-ping shrink-0"
          style={{ backgroundColor: activeColor }}
        />
        <span className="font-black tracking-wide truncate" style={{ color: activeColor }}>
          USE: {getActiveTitle()}
        </span>
      </div>

      {/* Dual Hands Container */}
      <div className={`flex items-end justify-center ${compact ? "gap-4 sm:gap-6" : "gap-6 sm:gap-8"} w-full`}>
        {/* LEFT HAND */}
        <div
          className={`flex flex-col items-center transition-all ${
            compact ? "p-1" : "p-2 rounded-xl"
          } ${
            activeHand === "left"
              ? "bg-blue-500/10 border border-blue-500/30 ring-1 ring-blue-500/20 rounded-lg"
              : "opacity-50"
          }`}
        >
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
            LEFT
          </span>

          {/* Left Fingers Grid */}
          <div className={`flex items-end gap-1 ${compact ? "h-11" : "h-20"} px-0.5`}>
            {leftFingers.map((f) => {
              const isActive = activeHand === "left" && activeFinger === f.id;
              const height = baseHeights[f.id];

              return (
                <div key={f.id} className="flex flex-col items-center gap-0.5">
                  <div
                    style={{
                      height: `${height}px`,
                      width: compact ? (f.id === "thumb" ? "9px" : "8px") : f.id === "thumb" ? "14px" : "12px",
                      backgroundColor: isActive ? f.color : isDark ? "#334155" : "#cbd5e1",
                      boxShadow: isActive
                        ? `0 0 12px ${f.color}, inset 0 1px 3px rgba(255,255,255,0.8)`
                        : undefined,
                    }}
                    className={`rounded-full transition-all duration-300 relative ${
                      isActive ? "scale-110 -translate-y-0.5 ring-1.5 ring-white animate-pulse" : "opacity-40"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs animate-bounce" />
                    )}
                  </div>
                  <span
                    className={`text-[8px] ${
                      isActive ? "font-black text-white" : "text-slate-400 font-semibold"
                    }`}
                  >
                    {f.short}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Left Palm Base */}
          <div
            className={`w-14 ${compact ? "h-2.5" : "h-5"} rounded-b-lg mt-0.5 border-t ${
              isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-300/80 border-slate-400"
            }`}
          />
        </div>

        {/* RIGHT HAND */}
        <div
          className={`flex flex-col items-center transition-all ${
            compact ? "p-1" : "p-2 rounded-xl"
          } ${
            activeHand === "right"
              ? "bg-blue-500/10 border border-blue-500/30 ring-1 ring-blue-500/20 rounded-lg"
              : "opacity-50"
          }`}
        >
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-slate-400 mb-1">
            RIGHT
          </span>

          {/* Right Fingers Grid */}
          <div className={`flex items-end gap-1 ${compact ? "h-11" : "h-20"} px-0.5`}>
            {rightFingers.map((f) => {
              const isActive = activeHand === "right" && activeFinger === f.id;
              const height = baseHeights[f.id];

              return (
                <div key={f.id} className="flex flex-col items-center gap-0.5">
                  <div
                    style={{
                      height: `${height}px`,
                      width: compact ? (f.id === "thumb" ? "9px" : "8px") : f.id === "thumb" ? "14px" : "12px",
                      backgroundColor: isActive ? f.color : isDark ? "#334155" : "#cbd5e1",
                      boxShadow: isActive
                        ? `0 0 12px ${f.color}, inset 0 1px 3px rgba(255,255,255,0.8)`
                        : undefined,
                    }}
                    className={`rounded-full transition-all duration-300 relative ${
                      isActive ? "scale-110 -translate-y-0.5 ring-1.5 ring-white animate-pulse" : "opacity-40"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-xs animate-bounce" />
                    )}
                  </div>
                  <span
                    className={`text-[8px] ${
                      isActive ? "font-black text-white" : "text-slate-400 font-semibold"
                    }`}
                  >
                    {f.short}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right Palm Base */}
          <div
            className={`w-14 ${compact ? "h-2.5" : "h-5"} rounded-b-lg mt-0.5 border-t ${
              isDark ? "bg-slate-800/80 border-slate-700" : "bg-slate-300/80 border-slate-400"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

interface KeyboardGameProps {
  theme: KeyboardTheme;
  colorZones: boolean;
  onOpenThemeSidebar?: () => void;
  onBackToHome?: () => void;
}

export function KeyboardGame({
  theme,
  colorZones,
  onOpenThemeSidebar,
  onBackToHome,
}: KeyboardGameProps) {
  const [gameView, setGameView] = useState<"select" | "play">("select");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "foundation" | "left_hand" | "right_hand">("all");
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Progressive Level Unlocking: Level 1 is unlocked initially, subsequent levels unlock upon completion
  const [unlockedLevels, setUnlockedLevels] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("typing_academy_unlocked_levels");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set(parsed);
        }
      }
    } catch {}
    return new Set([1]); // Level 1 is unlocked initially
  });

  const [completedLevels, setCompletedLevels] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem("typing_academy_completed_levels");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch {}
    return new Set();
  });

  const [levelStats, setLevelStats] = useState<
    Record<number, { completed: boolean; accuracy: number; maxStreak: number }>
  >(() => {
    try {
      const saved = localStorage.getItem("typing_academy_level_stats");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("typing_academy_unlocked_levels", JSON.stringify(Array.from(unlockedLevels)));
    } catch {}
  }, [unlockedLevels]);

  useEffect(() => {
    try {
      localStorage.setItem("typing_academy_completed_levels", JSON.stringify(Array.from(completedLevels)));
    } catch {}
  }, [completedLevels]);

  useEffect(() => {
    try {
      localStorage.setItem("typing_academy_level_stats", JSON.stringify(levelStats));
    } catch {}
  }, [levelStats]);

  // Score & Analytics
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctHits, setCorrectHits] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState<boolean>(false);
  const [isWrongKeyShake, setIsWrongKeyShake] = useState<boolean>(false);

  const activeLevel = GAME_LEVELS[currentLevelIndex] || GAME_LEVELS[0];
  const activeStep = activeLevel.steps[currentStepIndex];
  const targetCode = activeStep?.code;

  // Website and games remain on the sleek White, Blue, and Black palette
  const isDark = false;

  // Get active finger info from FINGER_MAPPING
  const fingerInfo = targetCode ? FINGER_MAPPING[targetCode] : null;

  // Filtered levels for selection view
  const filteredLevels = GAME_LEVELS.filter((lvl) => {
    if (categoryFilter === "all") return true;
    if (categoryFilter === "foundation") return lvl.category === "basics" || lvl.category === "mapping" || lvl.category === "fingers";
    if (categoryFilter === "left_hand") return lvl.category === "left_hand";
    if (categoryFilter === "right_hand") return lvl.category === "right_hand";
    return true;
  });

  // Start a specific level (only if unlocked)
  const startLevel = (index: number) => {
    const lvl = GAME_LEVELS[index];
    if (!lvl || !unlockedLevels.has(lvl.id)) return;
    setCurrentLevelIndex(index);
    setCurrentStepIndex(0);
    setStreak(0);
    setMaxStreak(0);
    setMistakes(0);
    setCorrectHits(0);
    setStartTime(Date.now());
    setShowLevelCompleteModal(false);
    setGameView("play");
  };

  // Handle Level Completion
  const handleLevelFinished = useCallback(() => {
    setShowLevelCompleteModal(true);
    setCompletedLevels((prev) => new Set(prev).add(activeLevel.id));

    const finalTotal = correctHits + 1 + mistakes;
    const finalAccuracy = Math.round(((correctHits + 1) / finalTotal) * 100);
    const finalMaxStreak = Math.max(streak + 1, maxStreak);

    setLevelStats((prev) => ({
      ...prev,
      [activeLevel.id]: {
        completed: true,
        accuracy: finalAccuracy,
        maxStreak: finalMaxStreak,
      },
    }));

    // Update database & table analytics
    updateStudentProgress({
      gameType: "academy",
      details: {
        levelId: activeLevel.id,
        accuracy: finalAccuracy,
        maxStreak: finalMaxStreak,
      },
    });

    // Unlock next level upon completing this one!
    if (currentLevelIndex + 1 < GAME_LEVELS.length) {
      const nextLvlId = GAME_LEVELS[currentLevelIndex + 1].id;
      setUnlockedLevels((prev) => new Set(prev).add(nextLvlId));
    }

    try {
      confetti({
        particleCount: 120,
        spread: 85,
        origin: { y: 0.5 },
      });
    } catch {}
  }, [activeLevel.id, correctHits, currentLevelIndex, maxStreak, mistakes, streak]);

  // Advance or Process Key Hit
  const processKeyInput = useCallback(
    (keyLabel: string, keyCode: string) => {
      if (gameView !== "play" || showLevelCompleteModal || !activeStep) return;

      // Check if match
      if (keyCode === activeStep.code) {
        // Correct Hit!
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        setCorrectHits((prev) => prev + 1);
        setIsWrongKeyShake(false);

        // Advance to next step or complete level
        if (currentStepIndex + 1 < activeLevel.steps.length) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          handleLevelFinished();
        }
      } else {
        // Wrong Hit!
        setStreak(0);
        setMistakes((prev) => prev + 1);
        setIsWrongKeyShake(true);
        setTimeout(() => setIsWrongKeyShake(false), 400);
      }
    },
    [activeLevel.steps.length, activeStep, currentStepIndex, gameView, handleLevelFinished, maxStreak, showLevelCompleteModal, streak]
  );

  // Global physical keydown listener for the game
  useEffect(() => {
    if (gameView !== "play") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLevelCompleteModal) return;

      // Prevent browser default scrolling for game keys
      const gameKeys = ["Space", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace"];
      if (gameKeys.includes(e.code) || gameKeys.includes(e.key)) {
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag !== "input" && activeTag !== "textarea") {
          e.preventDefault();
        }
      }

      if (!e.repeat) {
        let label = e.key.toUpperCase();
        if (e.code === "Space") label = "SPACE";
        if (e.code === "Enter") label = "ENTER";
        if (e.code === "Backspace") label = "BACKSPACE";
        processKeyInput(label, e.code);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameView, processKeyInput, showLevelCompleteModal]);

  const restartCurrentLevel = () => {
    setCurrentStepIndex(0);
    setStreak(0);
    setMistakes(0);
    setCorrectHits(0);
    setStartTime(Date.now());
    setShowLevelCompleteModal(false);
  };

  const nextLevel = () => {
    if (currentLevelIndex + 1 < GAME_LEVELS.length) {
      const nextIdx = currentLevelIndex + 1;
      const nextLvl = GAME_LEVELS[nextIdx];
      setUnlockedLevels((prev) => new Set(prev).add(nextLvl.id));
      setCurrentLevelIndex(nextIdx);
      setCurrentStepIndex(0);
      setStreak(0);
      setMaxStreak(0);
      setMistakes(0);
      setCorrectHits(0);
      setStartTime(Date.now());
      setShowLevelCompleteModal(false);
      setGameView("play");
    } else {
      setShowLevelCompleteModal(false);
      setGameView("select");
    }
  };

  // Accuracy Calculation
  const totalAttempts = correctHits + mistakes;
  const accuracy = totalAttempts > 0 ? Math.round((correctHits / totalAttempts) * 100) : 100;
  const progressPercent = Math.round(((currentStepIndex) / activeLevel.steps.length) * 100);

  // Finger Badge formatting
  const getFingerDisplay = () => {
    if (!fingerInfo) return null;
    const handName = fingerInfo.hand === "left" ? "Left Hand" : "Right Hand";
    const fingerName =
      fingerInfo.finger.charAt(0).toUpperCase() + fingerInfo.finger.slice(1) + (fingerInfo.finger === "thumb" ? "" : " Finger");
    const color = KEY_ZONE_COLORS[targetCode || ""] || "#f97316";

    return {
      handName,
      fingerName,
      color,
    };
  };

  const fingerDisplay = getFingerDisplay();

  // =========================================================================
  // VIEW 1: LEVEL SELECTION HUB (SHOWN FIRST AS REQUESTED)
  // =========================================================================
  if (gameView === "select") {
    return (
      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6 py-8 flex flex-col items-center gap-6 animate-in fade-in duration-300">
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

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 shadow-xs">
              <img
                src="/touchtypingemblem.png"
                alt="Touch Typing Academy"
                className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer"
              />
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
                Touch Typing Academy
              </span>
            </div>

            <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Interactive 3D Curriculum
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-blue-200 bg-white text-blue-700 text-xs font-mono font-bold shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-blue-600" />
            <span>{completedLevels.size} / {GAME_LEVELS.length} Completed</span>
          </div>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="w-full flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Levels", count: GAME_LEVELS.length },
            { id: "foundation", label: "Core Foundation", count: 6 },
            { id: "left_hand", label: "Left Hand Only", count: 5, accent: "emerald" },
            { id: "right_hand", label: "Right Hand Only", count: 5, accent: "purple" },
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black tracking-wide uppercase transition-all cursor-pointer border ${
                  isActive
                    ? tab.accent === "emerald"
                      ? "bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20"
                      : tab.accent === "purple"
                      ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                      : "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : isDark
                    ? "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                    isActive
                      ? "bg-black/20 text-white"
                      : isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* MASTER-DETAIL LAYOUT: LEFT VERTICAL SCROLL + RIGHT SUMMARY/STATS BRIEFING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
          {/* LEFT COLUMN: VERTICAL SCROLLABLE LEVEL LIST (INVISIBLE SCROLLBAR) */}
          <div className="lg:col-span-5 flex flex-col gap-3 max-h-[680px] overflow-y-auto pr-1 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 px-1 mb-1 flex items-center justify-between">
              <span>Training Levels</span>
              <span>{filteredLevels.length} Shown</span>
            </div>

            {filteredLevels.map((lvl) => {
              const realIdx = GAME_LEVELS.findIndex((g) => g.id === lvl.id);
              const isSelected = realIdx === currentLevelIndex;
              const isUnlocked = unlockedLevels.has(lvl.id);
              const isCompleted = completedLevels.has(lvl.id);
              const stats = levelStats[lvl.id];
              const levelProgressPercent = isCompleted ? 100 : 0;

              const isLeftOnly = lvl.category === "left_hand";
              const isRightOnly = lvl.category === "right_hand";

              return (
                <motion.div
                  key={lvl.id}
                  whileHover={{ x: isUnlocked ? 3 : 0, transition: { duration: 0.15 } }}
                  onClick={() => setCurrentLevelIndex(realIdx)}
                  className={`relative flex flex-col p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                    !isUnlocked
                      ? isDark
                        ? "bg-slate-950/50 border-slate-800/60 opacity-60 hover:opacity-85 text-slate-500"
                        : "bg-slate-100/60 border-slate-200/80 opacity-65 hover:opacity-90 text-slate-500"
                      : isSelected
                      ? isLeftOnly
                        ? isDark
                          ? "bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500 ring-2 ring-emerald-500/40 shadow-[0_4px_24px_rgba(16,185,129,0.25)]"
                          : "bg-gradient-to-r from-emerald-50 via-white to-white border-emerald-500 ring-2 ring-emerald-300 shadow-[0_4px_24px_rgba(16,185,129,0.15)]"
                        : isRightOnly
                        ? isDark
                          ? "bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border-purple-500 ring-2 ring-purple-500/40 shadow-[0_4px_24px_rgba(168,85,247,0.25)]"
                          : "bg-gradient-to-r from-purple-50 via-white to-white border-purple-500 ring-2 ring-purple-300 shadow-[0_4px_24px_rgba(168,85,247,0.15)]"
                        : isDark
                        ? "bg-gradient-to-r from-blue-950/70 via-slate-900 to-slate-900 border-blue-500 ring-2 ring-blue-500/40 shadow-[0_4px_24px_rgba(37,99,235,0.3)]"
                        : "bg-gradient-to-r from-blue-50 via-white to-white border-blue-500 ring-2 ring-blue-300 shadow-[0_4px_24px_rgba(37,99,235,0.15)]"
                      : isDark
                      ? "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300"
                      : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          !isUnlocked
                            ? isDark
                              ? "bg-slate-800 text-slate-400 border border-slate-700"
                              : "bg-slate-200 text-slate-600"
                            : isSelected
                            ? isLeftOnly
                              ? "bg-emerald-500 text-white shadow-xs"
                              : isRightOnly
                              ? "bg-purple-600 text-white shadow-xs"
                              : "bg-blue-600 text-white shadow-xs"
                            : isLeftOnly
                            ? isDark
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                              : "bg-emerald-100 text-emerald-700"
                            : isRightOnly
                            ? isDark
                              ? "bg-purple-950/80 text-purple-400 border border-purple-800/50"
                              : "bg-purple-100 text-purple-700"
                            : isDark
                            ? "bg-slate-800 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {!isUnlocked && <Lock className="w-2.5 h-2.5" />}
                        LEVEL {lvl.id}
                      </span>

                      {!isUnlocked ? (
                        <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      ) : isLeftOnly ? (
                        <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Left Only
                        </span>
                      ) : isRightOnly ? (
                        <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                          Right Only
                        </span>
                      ) : null}

                      <span className="text-[11px] font-bold text-slate-400">
                        {lvl.steps.length} Keys
                      </span>
                    </div>

                    {/* Mini Donut Pie Chart or Lock Icon on Level Card */}
                    <div className="flex items-center gap-2">
                      {!isUnlocked ? (
                        <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-slate-900 border-slate-800 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
                          <Lock className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <DonutProgressChart
                          percent={levelProgressPercent}
                          size={36}
                          strokeWidth={4.5}
                          isDark={isDark}
                          label={isCompleted ? "✓" : `${levelProgressPercent}%`}
                          showCenterText={true}
                        />
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-base font-black tracking-tight ${
                      !isUnlocked
                        ? "text-slate-400 opacity-85"
                        : isSelected
                        ? isLeftOnly
                          ? "text-emerald-400"
                          : isRightOnly
                          ? "text-purple-400"
                          : "text-blue-400"
                        : isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    {lvl.title}
                  </h3>
                  <div className="text-xs font-bold opacity-75 mt-0.5 mb-2">{lvl.subtitle}</div>

                  <p className="text-xs line-clamp-2 text-slate-400 leading-relaxed">
                    {lvl.description}
                  </p>

                  {/* Level Quick Stats pill if completed */}
                  {stats && isUnlocked && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono font-bold">
                      <span className="text-emerald-400">Acc: {stats.accuracy}%</span>
                      <span className="text-blue-400">Streak: {stats.maxStreak}x 🔥</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: DETAILED SUMMARY, STATISTICS & LAUNCH BRIEFING */}
          <div className="lg:col-span-7 flex flex-col gap-5 sticky top-20">
            {(() => {
              const selectedLvl = GAME_LEVELS[currentLevelIndex] || GAME_LEVELS[0];
              const isSelectedUnlocked = unlockedLevels.has(selectedLvl.id);
              const isSelectedCompleted = completedLevels.has(selectedLvl.id);
              const selectedStats = levelStats[selectedLvl.id];
              const progressPercent = isSelectedCompleted ? 100 : 0;
              const isLeft = selectedLvl.category === "left_hand";
              const isRight = selectedLvl.category === "right_hand";
              const prevRequiredLvl = currentLevelIndex > 0 ? GAME_LEVELS[currentLevelIndex - 1] : null;

              // Group unique keys for preview
              const uniqueKeys = Array.from(
                new Map(selectedLvl.steps.map((s) => [s.code, s])).values()
              );

              return (
                <div
                  className={`p-6 sm:p-8 rounded-3xl border shadow-2xl backdrop-blur-xl flex flex-col gap-6 transition-all ${
                    isDark
                      ? "bg-slate-900/95 border-slate-800 text-white shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
                      : "bg-white border-slate-200 text-slate-900 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
                  }`}
                >
                  {/* Briefing Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-5 border-slate-200/80 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-black tracking-wider uppercase text-white shadow-xs ${
                            !isSelectedUnlocked
                              ? "bg-slate-600"
                              : isLeft
                              ? "bg-emerald-600"
                              : isRight
                              ? "bg-purple-600"
                              : "bg-blue-600"
                          }`}
                        >
                          {!isSelectedUnlocked ? "🔒 LOCKED MISSION" : `MISSION BRIEFING • LEVEL ${selectedLvl.id}`}
                        </span>
                        <span
                          className={`text-xs font-bold ${
                            !isSelectedUnlocked
                              ? "text-slate-400"
                              : isLeft
                              ? "text-emerald-400"
                              : isRight
                              ? "text-purple-400"
                              : "text-blue-400"
                          }`}
                        >
                          {selectedLvl.category === "left_hand"
                            ? "Left Hand Specialist"
                            : selectedLvl.category === "right_hand"
                            ? "Right Hand Specialist"
                            : selectedLvl.category === "basics"
                            ? "Positioning"
                            : selectedLvl.category === "mapping"
                            ? "Ergonomics"
                            : `${selectedLvl.fingerFocus} Mastery`}
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
                        {!isSelectedUnlocked && <Lock className="w-6 h-6 text-amber-500" />}
                        <span>{selectedLvl.title}</span>
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        {selectedLvl.subtitle}
                      </p>
                    </div>

                    {isSelectedCompleted && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30 shrink-0">
                        <Trophy className="w-4 h-4" />
                        <span>Mastered</span>
                      </div>
                    )}
                  </div>

                  {/* LEVEL PROGRESS DONUT PIE CHART & METRICS SHOWCASE */}
                  <div
                    className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center gap-6 ${
                      isDark
                        ? "bg-slate-950/70 border-slate-800 shadow-inner"
                        : "bg-slate-50 border-slate-200 shadow-xs"
                    }`}
                  >
                    {/* Donut Pie Chart */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <DonutProgressChart
                        percent={progressPercent}
                        size={114}
                        strokeWidth={11}
                        isDark={isDark}
                        label={`${progressPercent}%`}
                        sublabel={!isSelectedUnlocked ? "LOCKED" : isSelectedCompleted ? "MASTERED" : "PROGRESS"}
                        showCenterText={true}
                      />
                    </div>

                    {/* Donut Progress Breakdown Legend & Metrics */}
                    <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                      <div
                        className={`p-3 rounded-xl border ${
                          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                          Status
                        </span>
                        <span
                          className={`text-sm font-black font-mono flex items-center gap-1.5 ${
                            !isSelectedUnlocked
                              ? "text-slate-400"
                              : isSelectedCompleted
                              ? "text-emerald-400"
                              : "text-amber-500"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              !isSelectedUnlocked
                                ? "bg-slate-500"
                                : isSelectedCompleted
                                ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                                : "bg-amber-400"
                            }`}
                          />
                          {!isSelectedUnlocked ? "Locked" : isSelectedCompleted ? "Completed" : "Ready to Start"}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                          Accuracy
                        </span>
                        <span
                          className={`text-sm font-black font-mono ${
                            selectedStats?.accuracy ? "text-emerald-400" : "text-slate-400"
                          }`}
                        >
                          {selectedStats?.accuracy ? `${selectedStats.accuracy}%` : "--"}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                          Best Streak
                        </span>
                        <span
                          className={`text-sm font-black font-mono ${
                            selectedStats?.maxStreak ? "text-blue-400" : "text-slate-400"
                          }`}
                        >
                          {selectedStats?.maxStreak ? `${selectedStats.maxStreak}x 🔥` : "--"}
                        </span>
                      </div>

                      <div
                        className={`p-3 rounded-xl border ${
                          isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">
                          Total Key Drills
                        </span>
                        <span className="text-sm font-black font-mono text-indigo-400">
                          {selectedLvl.steps.length} Steps
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Level Overview Description */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Training Objective
                    </span>
                    <p className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {selectedLvl.description}
                    </p>
                  </div>

                  {/* Finger & Hand Ergonomic Blueprint */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Ergonomic Hand & Finger Blueprint
                    </span>
                    <HandsFingerVisualizer
                      activeHand={isLeft ? "left" : isRight ? "right" : selectedLvl.steps[0] ? FINGER_MAPPING[selectedLvl.steps[0].code]?.hand : "left"}
                      activeFinger={isLeft ? (selectedLvl.steps[0] ? FINGER_MAPPING[selectedLvl.steps[0].code]?.finger : "index") : isRight ? (selectedLvl.steps[0] ? FINGER_MAPPING[selectedLvl.steps[0].code]?.finger : "index") : selectedLvl.fingerFocus === "all" ? (selectedLvl.steps[0] ? FINGER_MAPPING[selectedLvl.steps[0].code]?.finger : "index") : (selectedLvl.fingerFocus as any)}
                      activeColor={selectedLvl.steps[0] ? KEY_ZONE_COLORS[selectedLvl.steps[0].code] : "#10b981"}
                      isDark={isDark}
                    />
                  </div>

                  {/* Target Keys Matrix with Finger Zone Colors */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                      Target Keys Practiced in This Level ({uniqueKeys.length} Keys)
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {uniqueKeys.map((step, kIdx) => {
                        const zoneColor = KEY_ZONE_COLORS[step.code] || "#f97316";
                        const fInfo = FINGER_MAPPING[step.code];
                        return (
                          <div
                            key={kIdx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                              isDark ? "bg-slate-950/90 border-slate-800" : "bg-white border-slate-200 shadow-2xs"
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full shadow-xs shrink-0"
                              style={{ backgroundColor: zoneColor }}
                            />
                            <span className="font-mono font-black text-sm">{step.label}</span>
                            {fInfo && (
                              <span className="text-[10px] text-slate-400 font-semibold capitalize">
                                {fInfo.finger}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Big Bold Launch or Unlock Requirement Button */}
                  <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 mt-2">
                    {!isSelectedUnlocked ? (
                      <div className="flex flex-col gap-3">
                        <div
                          className={`p-4 rounded-2xl border flex items-center gap-3 ${
                            isDark
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                              : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}
                        >
                          <Lock className="w-5 h-5 shrink-0 text-amber-500" />
                          <div className="text-xs">
                            <span className="font-bold">Level Locked!</span> Complete{" "}
                            <strong>Level {prevRequiredLvl?.id} ({prevRequiredLvl?.title})</strong> to unlock this training mission.
                          </div>
                        </div>

                        {prevRequiredLvl && (
                          <button
                            onClick={() => startLevel(currentLevelIndex - 1)}
                            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-101 active:scale-98 transition-all cursor-pointer"
                          >
                            <span>Play Level {prevRequiredLvl.id} ({prevRequiredLvl.title})</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => startLevel(currentLevelIndex)}
                        className={`w-full py-4 px-6 rounded-2xl text-white font-black text-sm tracking-wide flex items-center justify-center gap-3 shadow-xl hover:scale-101 active:scale-98 transition-all cursor-pointer ring-2 group ${
                          isLeft
                            ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 shadow-emerald-500/25 hover:shadow-emerald-500/40 ring-emerald-400/40"
                            : isRight
                            ? "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40 ring-purple-400/40"
                            : "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 shadow-blue-500/25 hover:shadow-blue-500/40 ring-blue-400/40"
                        }`}
                      >
                        <Zap className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
                        <span>START LEVEL {selectedLvl.id} TRAINING</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE GAMEPLAY (COMPACT, SINGLE-VIEWPORT, ZERO-SCROLL HUD)
  // =========================================================================
  const isLeftLevel = activeLevel.category === "left_hand";
  const isRightLevel = activeLevel.category === "right_hand";

  return (
    <div className="relative z-10 w-full max-w-5xl px-3 sm:px-5 py-2 flex flex-col items-center justify-start gap-2.5 animate-in fade-in duration-300 select-none">
      {/* Top Header Navigation Bar (Standardized Suite Header) */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-blue-200">
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
              src="/touchtypingemblem.png"
              alt="Touch Typing Academy"
              className="w-7 h-7 object-contain rounded-lg shadow-2xs hover:scale-135 transition-transform duration-200 cursor-pointer"
            />
            <span className="text-sm sm:text-base font-black tracking-tight text-slate-950">
              Touch Typing Academy
            </span>
          </div>

          <button
            onClick={() => setGameView("select")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Levels</span>
          </button>

          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            {activeLevel.title}
          </span>
        </div>

        {/* Quick Level Stepper Pills (Scrollable) + Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 max-w-[280px] lg:max-w-[420px] overflow-x-auto no-scrollbar py-0.5">
            {GAME_LEVELS.map((lvl, idx) => {
              const isActive = idx === currentLevelIndex;
              const isCompleted = completedLevels.has(lvl.id);
              const isLvlLeft = lvl.category === "left_hand";
              const isLvlRight = lvl.category === "right_hand";

              return (
                <button
                  key={lvl.id}
                  onClick={() => startLevel(idx)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase transition-all cursor-pointer border shrink-0 ${
                    isActive
                      ? isLvlLeft
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                        : isLvlRight
                        ? "bg-purple-600 text-white border-purple-600 shadow-2xs"
                        : "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : isDark
                      ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white"
                      : "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-0.5">
                    <span>L{lvl.id}</span>
                    {isCompleted && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-black shrink-0">
            <span className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
              isDark ? "bg-slate-900 border-slate-800 text-blue-400" : "bg-white border-slate-200 text-blue-600"
            }`}>
              <Flame className="w-3 h-3 text-blue-400 fill-blue-400" />
              {streak}x
            </span>
            <span className={`px-2 py-0.5 rounded-lg border ${
              isDark ? "bg-slate-900 border-slate-800 text-emerald-400" : "bg-white border-slate-200 text-emerald-600"
            }`}>
              {accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* STREAMLINED SINGLE-ROW COCKPIT HUD */}
      <div
        className={`w-full p-2.5 sm:p-3 rounded-2xl border shadow-xl backdrop-blur-xl flex flex-row items-center justify-between gap-3 sm:gap-4 transition-all ${
          isDark
            ? "bg-slate-900/95 border-slate-800 text-white shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
            : "bg-white/95 border-slate-200 text-slate-900 shadow-[0_4px_24px_rgba(0,0,0,0.05)]"
        }`}
      >
        {/* Left Segment: Instruction, Tip & Step Progress */}
        <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
          <div
            className={`text-xs sm:text-sm font-black tracking-tight leading-tight truncate ${
              isWrongKeyShake ? "animate-shake text-rose-500" : isDark ? "text-white" : "text-slate-900"
            }`}
            title={activeStep?.instruction}
          >
            {activeStep?.instruction}
          </div>

          {activeStep?.tip && (
            <div className={`text-[11px] truncate font-medium flex items-center gap-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              <HelpCircle className="w-3 h-3 text-blue-400 shrink-0" />
              <span className="truncate">{activeStep.tip}</span>
            </div>
          )}

          {/* Slim Step Progress Bar */}
          <div className="w-full flex items-center gap-2 mt-0.5">
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-200"}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-sky-400 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold text-slate-400 shrink-0">
              {currentStepIndex + 1}/{activeLevel.steps.length}
            </span>
          </div>
        </div>

        {/* Center Segment: Compact Glowing Target Keycap */}
        <div className="flex flex-col items-center justify-center gap-0.5 shrink-0 px-1">
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Target</span>
          <motion.div
            key={activeStep?.code}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 shadow-xl font-mono select-none ${
              isDark
                ? "bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                : "bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-700 border-white text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]"
            }`}
          >
            <span className="text-lg sm:text-xl font-black tracking-tight leading-none">{activeStep?.label}</span>
          </motion.div>
        </div>

        {/* Right Segment: Compact Dual-Hands Finger Visualizer */}
        <div className="shrink-0 max-w-[240px] sm:max-w-[280px]">
          <HandsFingerVisualizer
            activeHand={fingerInfo?.hand}
            activeFinger={fingerInfo?.finger}
            activeColor={fingerDisplay?.color}
            isDark={isDark}
            compact={true}
          />
        </div>
      </div>

      {/* 3D MECHANICAL KEYBOARD ENGINE WITH TARGET LIGHTING (COMPACT CONTAINER) */}
      <div className="w-full flex flex-col items-center justify-center relative mt-0">
        <Keyboard
          className="mx-auto"
          theme={theme}
          colorZones={colorZones}
          allowMouseClick={true}
          targetKeyCode={targetCode}
          highlightKeyCodes={activeStep?.highlightCodes}
          onKeyPress={(key, code) => processKeyInput(key, code)}
          onOpenThemeSidebar={onOpenThemeSidebar}
        />
      </div>

      {/* Level Complete Celebration Modal */}
      <AnimatePresence>
        {showLevelCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl text-center flex flex-col items-center gap-5 ${
                isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              {/* Animated Trophy Icon */}
              <div className="p-4 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30">
                <Trophy className="w-12 h-12 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-blue-400 block mb-1">
                  LEVEL COMPLETED!
                </span>
                <h3 className="text-2xl font-black tracking-tight">{activeLevel.title}</h3>
                <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Supreme muscle memory achieved! You're ready for the next challenge.
                </p>
              </div>

              {/* Stats Summary Matrix */}
              <div className="grid grid-cols-3 gap-3 w-full">
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Accuracy</span>
                  <span className="text-lg font-black font-mono text-emerald-400">{accuracy}%</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Max Streak</span>
                  <span className="text-lg font-black font-mono text-blue-400">{maxStreak}x</span>
                </div>
                <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">Total Keys</span>
                  <span className="text-lg font-black font-mono text-indigo-400">{activeLevel.steps.length}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                <button
                  onClick={() => setGameView("select")}
                  className={`w-full sm:w-1/3 py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  <span>Levels</span>
                </button>

                <button
                  onClick={restartCurrentLevel}
                  className={`w-full sm:w-1/3 py-3 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white" : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Replay</span>
                </button>

                <button
                  onClick={nextLevel}
                  className="w-full sm:w-1/3 py-3 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
