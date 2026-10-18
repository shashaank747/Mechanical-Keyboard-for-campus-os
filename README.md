<div align="center">

  <img src="public/icon_logo.png" alt="3D Mechanical Keyboard Logo" width="110" height="110" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.35);" />

  # ⌨️ 3D Mechanical Keyboard & Touch-Typing Operating System

  <p align="center">
    <strong>A high-fidelity 3D mechanical keyboard simulator, acoustic synthesizer, comprehensive touch-typing arcade, and real-time student analytics operating system engineered for Campus OS.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Framer_Motion-12.0-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Supabase-Cloud_Sync-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>
</div>

---

## 📖 What is this Website About?

The **3D Mechanical Keyboard for Campus OS** is a browser-based, high-performance web platform designed to transform how students, software developers, and keyboard enthusiasts learn, practice, and master touch-typing. 

Unlike traditional barebones typing tutors, this application bridges **physical tactile simulation**, **low-latency synthesized switch acoustics**, **gamified arcade training**, and **rich data visualization**:

1. **Interactive 3D Mechanical Simulation**: Experience realistic physical key-travel kinematics (4px vertical travel, spring compression, bottom-out shadow physics) paired with zero-latency synthesized sound profiles (Linear Thock, Clicky Crisp, Tactile Bump).
2. **7 Comprehensive Arcade Training Games**: Tackle structured curricula ranging from 10-finger muscle memory in Touch Typing Academy to real multi-language IDE code completion in Code Sprint.
3. **User Analytics Dashboard**: A built-in personal telemetry hub featuring interactive **Bar Graphs** (visualizing what games are played and how many times each has been played) and **Line Graphs** (plotting speed progression in WPM and accuracy trajectories over time).
4. **Customization & Aesthetics**: Switch seamlessly across 7 curated theme palettes, toggle touch-typing finger color zones, and enjoy an intuitive, compact navigation drawer accessible via the top-left toggle button.
5. **Student Authentication & Persistence**: Seamless sync with Supabase PostgreSQL and instant local storage fallback to preserve user themes, scores, and practice records across sessions.

---

## 🌟 Core Modules & Capabilities

### 🎮 1. The 7 Arcade Training Games

Each game is carefully calibrated to train a distinct facet of keyboard mastery:

| Game | Category | Description | Primary Metric |
| :--- | :--- | :--- | :--- |
| **🎓 Touch Typing Academy** | Structured Curriculum | 16 comprehensive master levels starting from home-row keys (`ASDF JKL;`) and branching into dedicated Left-Hand and Right-Hand drills, top numbers, and punctuation. Features a live dual-hand visualizer with donut accuracy charts. | Level & Accuracy % |
| **⚡ Code Sprint & Dev Syntax** | Coding & Logic | A dual-pane IDE compiler training typing speed in **Python, JavaScript, TypeScript, Java, C, C++, HTML/CSS, and SQL**. Students fill in missing logical blanks with real auto-indentation and instant syntax validation. | WPM & Blanks Solved |
| **🔥 Speed Typing Arena** | Speed & Reflexes | Dynamic real-time pangram typing benchmark. Delivers instantaneous WPM calculation, streak tracking, accuracy meter, and celebratory particle confetti upon round completion. | Peak WPM & Net Speed |
| **☄️ Key Meteor Defense** | Arcade Action | Fast-paced retro survival shooter where falling words and keycaps threaten the mechanical keyboard perimeter. Players blast words out of the sky, protect 3 shield lives, and chain combo multipliers. | High Score & Wave Reached |
| **🙈 Blind Typing Dojo** | Pure Muscle Memory | Pure auditory training where character prompts are spoken aloud or kept hidden. Students type blind directly on their mechanical keyboard to build unbreakable tactile reflexes. | Lines Dictated & Recall |
| **🥋 Keyboard Shortcuts Dojo** | Productivity | Interactive developer hotkey trainer that safely intercepts and tests key combinations (`Ctrl+C`, `Ctrl+V`, `Ctrl+Shift+P`, `Alt+Tab`, `Windows+.`, `Ctrl+F`, etc.) without triggering browser default dialogs. | Hotkeys Mastered |
| **🎵 Echo Matrix Voice Dictation** | Auditory Training | Text-to-speech audio dictation where the engine speaks letters, spaces, and complete vocabulary words for synchronized rhythmic typing. | Rhythmic Accuracy |

---

### 📊 2. User Activity Analytics Dashboard

Accessed directly from the sidebar navigation or the Arcade Hub header, the **Dashboard** acts as the student's personal flight recorder:

- **Key Performance Indicators (KPIs)**:
  - **Total Games Played**: Aggregated session count of all games and rounds completed.
  - **Most Played Game**: Identifies the student's primary practice focus and percentage share.
  - **Peak Speed (WPM)**: High-water mark for words-per-minute speed.
  - **Average Accuracy %**: Aggregate typing precision across all exercises.
- **Interactive Bar Graph (Game Frequency Breakdown)**:
  - Visual animated vertical bars displaying every game in the arcade.
  - Highlights how many times each specific game has been played with hover tooltips and proportional height calculation.
- **Interactive Line Graph (WPM & Accuracy Trajectory)**:
  - SVG curve plotting speed (WPM) and accuracy progression across sessions and days.
  - Interactive nodes with hover tooltips showing session dates, WPM records, and precision benchmarks.
- **Gameplay History Log**:
  - Chronological history of completed rounds with timestamps, scores, and WPM details.

---

### 🎨 3. Keyboard Settings & Aesthetic Palettes

The slide-over drawer (accessible via the top-left hamburger toggle) houses complete keyboard configuration:

- **Navigation Menu**:
  - 🎮 **Let's Play**: Return to the Arcade Games & Academy Hub.
  - 📊 **Dashboard**: Open the user data analytics and charts view.
  - 🎨 **Keyboard Settings**: Enter the theme and color customization panel.
- **Curated Theme Palettes**:
  - 🏙️ **Studio Light**: Clean architectural slate with solar orange accents.
  - 🌆 **Cyberpunk Neon**: Obsidian chassis with electric magenta & laser cyan backlights.
  - 🥷 **Carbon Stealth Dark**: Matte graphite with safety orange indicators.
  - 💾 **Retro Classic 90s**: Vintage IBM Model M industrial beige with red ESC accents.
  - 🍵 **Matcha & Cream**: Soothing earthy sage, ivory keycaps, and emerald modifiers.
  - ❄️ **Nordic Polar Frost**: Glacial Arctic cyan and iced ocean blue.
  - 🌸 **Sakura Blossom**: Cherry petal pastel with gold escape accents.
  - 🔮 **Lavender Mist**: Lilac chassis with royal purple and milk alphas.
- **Finger Color Zones**: Optional visual RGB backlight mode highlighting keys according to standard 10-finger touch-typing assignments.

---

### 🔊 4. Low-Latency Acoustic Sound Synthesis

- Procedural Web Audio API sound generator producing realistic mechanical switch feedback without static audio file lag.
- Switch types modeled: **Linear Thock** (smooth bottom-out), **Clicky Crisp** (tactile reset click), and **Tactile Bump** (subtle resistance drop).
- Audio assets for Lo-Fi background soundtracks are retained in `public/` and `src/lib/bgMusic.ts` for future player activation.

---

### 🔐 5. Database, Cloud Sync & Security

- **Dual-Storage Engine**:
  - **Supabase PostgreSQL**: Live cloud sync of user metrics, level completions, best WPMs, and theme preferences.
  - **Local Storage Fallback**: Seamless, fully functional offline mode when cloud credentials are not supplied.
- **PBKDF2-SHA512 Password Encryption**: Salted client-side hashing ensuring zero plaintext credential transmission.

---

## 🔮 Roadmap: What's Coming Next?

### ⭐ XP & Student Leveling System (Coming Soon!)

We are currently developing a comprehensive gamified **XP & Progression System** that will elevate daily practice into an RPG-style leveling journey:

- **Experience Points (XP) Engine**:
  - Earn XP for every accurate keystroke, word completed, and test cleared.
  - Bonus XP multipliers for high-accuracy streaks (98%+ accuracy), clearing higher waves in Meteor Defense, and solving complex code templates in Code Sprint.
- **Student Ranks & Titles**:
  - Progress from **Novice Typist** ➡️ **Keystroke Apprentice** ➡️ **Speed Tactician** ➡️ **Keyboard Artisan** ➡️ **Grandmaster Hacker**.
- **Unlockable Rewards**:
  - Gain access to exclusive mechanical switch sound profiles (Holy Panda, Gateron Oil Kings, Box Jades).
  - Unlock animated RGB keycap effects and special custom chassis badges.
- **Campus Leaderboards**:
  - Compete with classmates on campus-wide daily, weekly, and all-time WPM & XP leaderboards.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern functional components, hooks, and reactive UI state |
| **TypeScript 5.7** | Strict type definitions, interfaces, and compile-time correctness |
| **Vite 6** | Ultra-fast build tool, Hot Module Replacement (HMR), and bundling |
| **Tailwind CSS v4** | Modern utility-first styling and CSS variable integration |
| **Framer Motion 12** | Smooth spring drawer physics, micro-animations, and page transitions |
| **Web Audio API** | Real-time procedural mechanical switch sound synthesis |
| **Supabase (PostgreSQL)** | Cloud database, student progression tracking, and session sync |
| **Canvas Confetti** | Celebratory particle animations on game completions |
| **Lucide React** | Consistent, modern iconography |

---

## 📁 Directory Structure

```
Mechanical-Keyboard-for-campus-os/
├── public/                       # Static assets and music tracks
│   ├── icon_logo.png             # Official brand logo & favicon
│   ├── Afternoon_on_the_Sill.mp3 # Lo-Fi soundtrack tracks
│   ├── Notes_on_the_Glass.mp3
│   ├── Steaming_Mug_Grey_Skies.mp3
│   ├── Sunlight_on_the_Desk.mp3
│   └── The_Last_Keystroke.mp3
├── data/                         # Schema and analytics exports
│   ├── supabase_schema.sql       # PostgreSQL schema & security policies
│   ├── students_progress_table.html # Live HTML progress audit table
│   └── students_summary.csv      # Exported CSV analytics spreadsheet
├── src/
│   ├── components/ui/            # Core UI and game components
│   │   ├── keyboard.tsx          # Interactive 3D mechanical keyboard simulator
│   │   ├── GamesHub.tsx          # Arcade games selector hub
│   │   ├── Dashboard.tsx         # User Activity Dashboard (Bar & Line Graphs)
│   │   ├── ThemeSidebar.tsx      # Sidebar navigation & Keyboard Settings drawer
│   │   ├── KeyboardGame.tsx      # Touch Typing Academy engine (16 levels)
│   │   ├── CodeSprintGame.tsx    # Multi-language IDE compiler game
│   │   ├── FallingWordsGame.tsx  # Key Meteor Defense arcade shooter
│   │   ├── BlindTypingGame.tsx   # Auditory blind typing challenge
│   │   └── SoundMatrixGame.tsx   # Echo matrix synthesizer
│   ├── lib/
│   │   ├── userStats.ts          # Analytics tracking engine (local & cloud storage)
│   │   ├── db.ts                 # Supabase client & progress synchronizer
│   │   ├── supabase.ts           # Supabase client initialization
│   │   ├── sound.ts              # Procedural Web Audio API sound engine
│   │   ├── bgMusic.ts            # Lo-Fi soundtrack playlist manager
│   │   └── themes.ts             # 7 curated mechanical keyboard themes
│   ├── App.tsx                   # Main application router and state coordinator
│   ├── index.css                 # Global CSS and layout tokens
│   └── main.tsx                  # React application entry point
├── vite.config.ts                # Vite dev server and API configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Comprehensive project documentation
```

---

## ⚡ Getting Started

### 1. Prerequisites
- **Node.js** (v18.0 or higher recommended)
- **npm** or **pnpm** / **yarn**

### 2. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/shashaank747/Mechanical-Keyboard-for-campus-os.git
cd Mechanical-Keyboard-for-campus-os
npm install
```

### 3. Environment Setup (Optional)
To link your Supabase cloud database, create a `.env` file in the root folder:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

*(If omitted, the application runs in local fallback mode using browser storage).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the displayed port) in your browser.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 👨‍💻 Authors & Credits

- **Developer & Creator**: Shashaank Sajjanar
- **GitHub Repository**: [Mechanical-Keyboard-for-campus-os](https://github.com/shashaank747/Mechanical-Keyboard-for-campus-os.git)
- **Engineered with**: Google DeepMind Antigravity

---

<div align="center">
  <sub>Engineered with precision for mechanical keyboard lovers and student developers worldwide. ⌨️✨</sub>
</div>
