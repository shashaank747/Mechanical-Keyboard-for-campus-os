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
    <img src="https://img.shields.io/badge/Architecture-Local--First_&_Cloud--Ready-blue?style=for-the-badge" alt="Local First" />
  </p>
</div>

---

## 📖 What is this Platform About?

The **3D Mechanical Keyboard for Campus OS** is a browser-based, high-performance web platform designed to transform how students, software developers, and keyboard enthusiasts learn, practice, and master touch-typing. 

Unlike traditional barebones typing tutors, this application bridges **physical tactile simulation**, **low-latency procedural switch acoustics**, **gamified arcade training**, and **rich data visualization**:

1. **Interactive 3D Mechanical Simulation**: Experience realistic physical key-travel kinematics (4px vertical travel, spring compression, bottom-out shadow physics) paired with zero-latency synthesized sound profiles (Linear Thock, Clicky Crisp, Tactile Bump).
2. **7 Comprehensive Arcade Training Games**: Tackle structured curricula ranging from 10-finger muscle memory in Touch Typing Academy to real multi-language IDE code completion in Code Sprint.
3. **Standardized Suite Header System**: A unified, cohesive top navigation bar across all 7 games featuring a standardized Games Hub back button, clean white card pill badges with custom game emblems, curriculum tags, and contextual HUD metric chips.
4. **Precision Mission Timers & Performance Debrief**: Timed arcade modes featuring high-precision millisecond countdown timers (`MM:SS:ms`), live survival count-up timers, and post-game telemetry screens showing exact timer-referenced WPM calculations, total keys typed, and word counts.
5. **Interactive UI & Hover Magnification**: Modern squircle app icons with interactive hover magnification (`scale-135` hover pop effect), fluid animations, and rich tactile feedback.
6. **User Activity Analytics Dashboard**: A built-in personal telemetry hub featuring interactive **Bar Graphs** (visualizing game frequencies) and **Line Graphs** (plotting speed progression in WPM and accuracy trajectories over time).
7. **Customization & Aesthetics**: Switch seamlessly across 8 curated theme palettes, toggle touch-typing finger color zones, and enjoy an intuitive, compact navigation drawer.
8. **Local-First, Cloud-Ready Architecture**: Runs 100% out-of-the-box in local offline mode with zero required external database dependencies, with one-click Supabase cloud sync ready at any time.

---

## 🌟 Core Modules & Capabilities

### 🎮 1. The 7 Arcade Training Games

Each game is carefully calibrated to train a distinct facet of keyboard mastery:

| Game | Category | Description | Primary Metric |
| :--- | :--- | :--- | :--- |
| **🎓 Touch Typing Academy** | Structured Curriculum | 16 comprehensive master levels starting from home-row keys (`ASDF JKL;`) and branching into dedicated Left-Hand and Right-Hand drills, top numbers, and punctuation. Features a live dual-hand visualizer with donut accuracy charts. | Level & Accuracy % |
| **⚡ Code Sprint & Dev Syntax** | Coding & Logic | A dual-pane IDE compiler training typing speed in **Python, JavaScript, TypeScript, Java, C, C++, HTML/CSS, and SQL**. Students fill in missing logical blanks with real auto-indentation and instant syntax validation. | WPM & Blanks Solved |
| **☄️ Key Meteor Defense** | Arcade Survival | Retro arcade shooter with launch duration options (**2 Min**, **5 Min**, or **Unlimited**). Features real-time `MM:SS:ms` millisecond countdown or count-up timers, lives tracking, wave scaling, and a post-mission debrief card with exact timer-referenced WPM. | Score, Wave, WPM |
| **🔥 Speed Typing Arena** | Speed & Reflexes | Dynamic real-time pangram typing benchmark. Delivers instantaneous WPM calculation, streak tracking, accuracy meter, and celebratory particle confetti upon round completion. | Peak WPM & Net Speed |
| **🙈 Blind Typing Dojo** | Pure Muscle Memory | Pure auditory and muscle memory training with hardcoded punctuation where character prompts are spoken aloud or kept hidden. Students build unbreakable tactile reflexes. | Lines Dictated & Recall |
| **🥋 Keyboard Shortcuts Dojo** | Productivity | Interactive developer hotkey trainer that safely intercepts and tests key combinations (`Ctrl+C`, `Ctrl+V`, `Ctrl+Shift+P`, `Alt+Tab`, `Windows+.`, `Ctrl+F`, etc.) without triggering browser default dialogs. | Hotkeys Mastered |
| **🎵 Echo Matrix Voice Dictation** | Auditory Training | Text-to-speech audio dictation where the engine speaks letters, spaces, and complete vocabulary words for synchronized rhythmic typing. | Rhythmic Accuracy |

---

### ☄️ 2. Key Meteor Defense: Precision Timed Arcade

The Meteor Defense game features a full mission launch and debrief lifecycle:

- **Launch Duration Modal**:
  - Displays a centered modal over a smoothly blurred backdrop (`backdrop-blur-md`).
  - Choose between **2 Min** (high-speed sprint), **5 Min** (extended endurance), or **Unlimited** (count-up arcade survival).
  - The game and timers only begin once the user explicitly clicks **START DEFENSE MISSION**.
- **Dual Timer Modes**:
  - **Timed (2m / 5m)**: Precision countdown timer displaying `MM:SS:ms` (minutes, seconds, and centiseconds) updated on the 60fps game loop.
  - **Unlimited**: Monospace count-up survival timer (`MM:SS`) measuring total active defense duration.
- **Post-Game Mission Debrief Card**:
  - When the countdown finishes (or all 3 lives are lost), a medium-sized result card opens over the blurred game screen.
  - Displays exact performance metrics:
    - **Total Keys Typed**: Verified count of valid keystrokes.
    - **Total Words Typed**: Total number of meteor words destroyed.
    - **Timer-Referenced WPM**: Calculated using international standard formula $\text{WPM} = \frac{\text{Keys Typed} / 5}{\text{Actual Minutes Elapsed}}$.
    - **Total Duration**: Exact active mission time (e.g. `2m 00s`, `1m 45s`).
    - **Score & Waves**: Points earned, max wave achieved, and accuracy percentage.

---

### 🎨 3. Standardized Suite Headers & Visual Design System

All games share an identical, cohesive header layout:

```
[ ← Games Hub ]  [ 🌐 Game Logo Badge ]  [ Subtitle Tag ]  ------  [ Actions & Live HUD Metrics ]
```

- **Uniform Top Bar**: `pb-3 border-b border-blue-200` with clean white card pills, blue borders, and dark typography (`text-slate-950 font-black`).
- **Interactive Hover Magnification**: Game cards and logo containers smoothly enlarge on hover (`scale-135 hover:shadow-xl hover:z-30`) for an immersive tactile feel.
- **Full Squircle App Icons**: High-resolution rounded square app icons (`codesprintemblem.png`, `blindtypingicon.png`) designed to match modern OS aesthetics.

---

### 📊 4. User Activity Analytics Dashboard

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
  - SVG curve plotting speed (WPM) and accuracy progression across practice sessions.
  - Interactive nodes with hover tooltips showing session dates, WPM records, and precision benchmarks.
- **Gameplay History Log**:
  - Chronological history of completed rounds with timestamps, scores, and WPM details.

---

### 🎨 5. Keyboard Settings & Aesthetic Palettes

The slide-over drawer (accessible via the top-left toggle) houses complete keyboard configuration:

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

### 🔊 6. Low-Latency Acoustic Sound Synthesis

- Procedural Web Audio API sound generator producing authentic mechanical switch feedback without static audio file lag.
- Switch types modeled: **Linear Thock** (smooth bottom-out), **Clicky Crisp** (tactile reset click), and **Tactile Bump** (subtle resistance drop).

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

## 🛠️ Senior Developer & Backend Integration Guide

> [!IMPORTANT]
> **Current Status**: All external Supabase cloud connections have been decoupled. The codebase currently operates in a **100% self-contained, local-first mode**. There are zero hardcoded remote API keys or active database connections in the repository.

This section provides senior backend developers, team leads, and DevOps engineers with an exact roadmap of **what needs to be connected, where it is wired, and how data flows**.

```
+-----------------------------------------------------------------------------------+
|                                CLIENT APPLICATION                                 |
|                                                                                   |
|  [Games / Typing Drills]      [Theme & Palette]       [Dashboard / Telemetry]     |
|          |                            |                          |                |
|          v                            v                          v                |
|  recordGamePlay()             updateUserTheme()       getUserStats()              |
|  (src/lib/userStats.ts)       (src/lib/db.ts)         (src/lib/userStats.ts)      |
+---------------------------------------+-------------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                        STORAGE ABSTRACTION & FALLBACK LAYER                       |
|                                                                                   |
|  Does .env have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY?                     |
|                                                                                   |
|           [ YES ]                                            [ NO ]               |
|              |                                                  |                 |
|              v                                                  v                 |
|    +--------------------+                             +--------------------+      |
|    |   Supabase Cloud   |                             | Local / Dev Mode   |      |
|    |   (src/lib/        |                             | (localStorage &    |      |
|    |    supabase.ts)    |                             |  data/users.json)  |      |
|    |                    |                             |                    |      |
|    | Table: students    |                             | Fully offline,     |      |
|    | RLS: Enabled       |                             | zero network calls |      |
|    +--------------------+                             +--------------------+      |
+-----------------------------------------------------------------------------------+
```

---

### 1. Where Environment Variables Live

All backend connection credentials are kept in the root `.env` file (copied from `.env.example`).

```bash
# .env (in project root)

# 1. Your Supabase Project HTTPS URL
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co

# 2. Your Supabase Project Public/Anon Key (safe for client bundling)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. (Optional) Secret Service Role Key (for administrative Node scripts / backend workers only)
SUPABASE_SECRET_KEY=sb_secret_...
```

- When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **empty or unset**:
  - `src/lib/supabase.ts` exports `supabase = null` and `isSupabaseConfigured = false`.
  - The application automatically switches to offline mode with zero network errors.
- When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **provided**:
  - The client initializes authenticated Supabase calls for registration, login, progress sync, and theme storage.

---

### 2. Database Schema & Migration File

The complete PostgreSQL migration script is located at:
📁 **[`data/supabase_schema.sql`](data/supabase_schema.sql)**

#### Target Table: `public.students`
```sql
CREATE TABLE IF NOT EXISTS public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,                       -- Unique identifier e.g. "USR-174829"
  username TEXT NOT NULL,                             -- Unique student handle
  email TEXT NOT NULL,                                -- Student email address
  password_hash TEXT NOT NULL,                        -- PBKDF2-SHA512 salted client hash
  ip_address TEXT DEFAULT '127.0.0.1',                -- Client audit IP
  theme_id TEXT DEFAULT 'studio-light',               -- Selected keyboard palette ID
  color_zones BOOLEAN DEFAULT false,                  -- Touch-typing finger color RGB mode
  preferences_json JSONB DEFAULT '{}'::jsonb,         -- Palette & accessibility preferences
  total_games_played INT DEFAULT 0,                   -- Aggregated round count
  total_levels_mastered INT DEFAULT 0,                -- Completed academy + code levels
  code_sprint_solved INT DEFAULT 0,                   -- Count of code templates solved
  code_sprint_best_wpm INT DEFAULT 0,                 -- Peak code completion WPM
  code_sprint_langs JSONB DEFAULT '[]'::jsonb,        -- Array of languages practiced
  code_sprint_data JSONB DEFAULT '{}'::jsonb,         -- Level breakdown by language
  academy_highest_level INT DEFAULT 0,                -- Highest level reached (1-16)
  academy_completed_levels JSONB DEFAULT '[]'::jsonb, -- Array of completed level IDs
  speed_best_wpm INT DEFAULT 0,                       -- Peak Speed Arena WPM
  speed_tests_taken INT DEFAULT 0,                    -- Total speed tests completed
  meteor_high_score INT DEFAULT 0,                    -- High score in Key Meteor Defense
  meteor_highest_wave INT DEFAULT 0,                  -- Highest wave survived
  blind_completed_lines INT DEFAULT 0,                -- Lines mastered in Blind Typing
  shortcuts_mastered INT DEFAULT 0,                   -- Developer hotkeys verified
  last_active_game TEXT DEFAULT 'None',               -- Last game title played
  progress_json JSONB DEFAULT '{}'::jsonb,            -- Nested progress state snapshot
  created_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now()
);
```

#### Row Level Security (RLS)
The script configures open public read/write policies:
```sql
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all public operations on students" ON public.students
  FOR ALL USING (true) WITH CHECK (true);
```

---

### 3. File Map: Where Data Code Lives & What Connects Where

| File Path | Role & Connection Responsibility |
| :--- | :--- |
| **[`src/lib/supabase.ts`](src/lib/supabase.ts)** | **Supabase Client Initializer**: Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Exports `supabase` (or `null` if unconfigured) and `isSupabaseConfigured` flag. |
| **[`src/lib/db.ts`](src/lib/db.ts)** | **Core Database & Session Layer**: Handles student registration, login verification, password reset, active session validation, level completion tracking, and theme persistence. Wrapped with `if (supabase)` guards with automatic local storage fallback. |
| **[`src/lib/userStats.ts`](src/lib/userStats.ts)** | **User Telemetry & Chart Engine**: Tracks game play counts (powers the **Bar Graph**) and WPM / accuracy trajectories (powers the **Line Graph**). Persists sessions in `localStorage` under `setu_user_game_stats_v1`. |
| **[`src/components/ui/Dashboard.tsx`](src/components/ui/Dashboard.tsx)** | **Analytics Visualization UI**: Consumes data from `getUserStats()` to render the interactive Bar Graph and SVG Line Graph with hover tooltips and session history. |
| **[`vite.config.ts`](vite.config.ts)** | **Development Mock REST Server**: Provides local Express-like routes (`/api/register`, `/api/login`, `/api/progress`, `/api/theme`, `/api/reset-password`) that read and write directly to `data/users.json` during local development when no database is linked. |
| **[`data/students_progress_table.html`](data/students_progress_table.html)** | **Standalone Progress Audit Table**: A single-file developer portal to inspect, search, filter, and export student performance records as CSV. |

---

### 4. Step-by-Step Instructions to Connect a New Backend / Supabase Project

When your team is ready to connect a live Supabase project:

1. **Create Project**: Sign in to [supabase.com](https://supabase.com) and create a new project.
2. **Execute Database Migration**:
   - Open your project dashboard ➡️ **SQL Editor**.
   - Copy the entire contents of [`data/supabase_schema.sql`](data/supabase_schema.sql) and paste them into the SQL editor.
   - Click **Run** to generate the `students` table, columns, indexes, and RLS policies.
3. **Configure Environment Variables**:
   - In Supabase, navigate to **Project Settings** ➡️ **API**.
   - Copy the **Project URL** and the **anon/public key**.
   - Paste them into your `.env` file:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
     ```
4. **Restart Vite Server**:
   ```bash
   npm run dev
   ```
   The client will automatically detect the configuration and begin synchronizing student accounts, themes, and game progress to your live Supabase cloud database.

---

### 5. Password Encryption & Security Standard

- Passwords are **never stored in plaintext** and **never sent over the wire unhashed**.
- In [`src/lib/db.ts`](src/lib/db.ts), passwords undergo client-side **PBKDF2 key derivation using SHA-512** with 10,000 iterations and a unique salt before transmission or storage:
  ```ts
  // Hash format stored in database:
  // "salt_hex:hash_hex"
  const passwordHash = await hashClientPassword(rawPassword);
  ```

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
| **Supabase (PostgreSQL)** | Cloud-ready database for student progression and session sync |
| **Canvas Confetti** | Celebratory particle animations on game completions |
| **Lucide React** | Consistent, modern iconography set |

---

## 📁 Directory Structure

```
Mechanical-Keyboard-for-campus-os/
├── public/                       # Static assets, branding, and audio
│   ├── icon_logo.png             # Official brand logo & favicon
│   ├── codesprintemblem.png      # Full squircle Code Sprint app icon
│   ├── blindtypingicon.png       # Full squircle Blind Typing app icon
│   ├── speedtypingemblem.png     # Full squircle Speed Typing Arena app icon
│   ├── Afternoon_on_the_Sill.mp3 # Lo-Fi soundtrack tracks
│   ├── Notes_on_the_Glass.mp3
│   ├── Steaming_Mug_Grey_Skies.mp3
│   ├── Sunlight_on_the_Desk.mp3
│   └── The_Last_Keystroke.mp3
├── data/                         # Schema and analytics exports
│   ├── supabase_schema.sql       # PostgreSQL schema & security policies
│   ├── users.json                # Local development database fallback
│   ├── students_progress_table.html # Live HTML progress audit table
│   └── students_summary.csv      # Exported CSV analytics spreadsheet
├── src/
│   ├── components/ui/            # Core UI and game components
│   │   ├── keyboard.tsx          # Interactive 3D mechanical keyboard simulator
│   │   ├── GamesHub.tsx          # Arcade games selector hub with hover magnification
│   │   ├── Dashboard.tsx         # User Activity Dashboard (Bar & Line Graphs)
│   │   ├── ThemeSidebar.tsx      # Sidebar navigation & Keyboard Settings drawer
│   │   ├── KeyboardGame.tsx      # Touch Typing Academy engine (16 levels)
│   │   ├── CodeSprintGame.tsx    # Multi-language IDE compiler game (8 languages)
│   │   ├── FallingWordsGame.tsx  # Key Meteor Defense arcade shooter (Timed & Survival)
│   │   ├── BlindTypingGame.tsx   # Auditory blind typing challenge
│   │   └── SoundMatrixGame.tsx   # Echo matrix synthesizer
│   ├── lib/
│   │   ├── userStats.ts          # Analytics tracking engine (local & cloud storage)
│   │   ├── db.ts                 # Database abstraction & progress synchronizer
│   │   ├── supabase.ts           # Supabase client initialization (guarded)
│   │   ├── sound.ts              # Procedural Web Audio API sound engine
│   │   ├── bgMusic.ts            # Lo-Fi soundtrack playlist manager
│   │   └── themes.ts             # 8 curated mechanical keyboard themes
│   ├── App.tsx                   # Main application router and state coordinator
│   ├── index.css                 # Global CSS and layout tokens
│   └── main.tsx                  # React application entry point
├── .env.example                  # Environment template for senior developers
├── vite.config.ts                # Vite dev server and API configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Comprehensive project documentation & senior dev guide
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

### 3. Run in Local Mode (No Database Needed)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the displayed port) in your browser. All features, games, and the Dashboard will work immediately using browser storage.

### 4. Build for Production
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
