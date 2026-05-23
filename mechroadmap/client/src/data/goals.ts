// ============================================================
// MECHATRONICS ROADMAP — Goals Data
// All data extracted from the original site
// ============================================================

export interface StudyStep {
  id: number;
  title: string;
  description: string;
  duration: string;
}

export interface Resource {
  name: string;
  url: string;
}

export interface ResourceCard {
  name: string;
  role: string;
  why: string;
  resources: Resource[];
  time: string;
  priority: number;
  color: string;
  badge: string;
}

export interface ChartDataItem {
  name: string;
  hours: number;
  color: string;
}

// ── Pie chart data (mission overview) ──
export const overviewChartData: ChartDataItem[] = [
  { name: "C/C++", hours: 180, color: "#3b82f6" },
  { name: "Python", hours: 120, color: "#6366f1" },
  { name: "MATLAB", hours: 90, color: "#8b5cf6" },
  { name: "Japanese", hours: 300, color: "#ec4899" },
  { name: "Calculus IV", hours: 200, color: "#10b981" },
  { name: "Mechatronics Skills", hours: 250, color: "#f59e0b" },
];

// ── Nav tabs ──
export const goalTabs = [
  { id: "coding", label: "💻 Coding", shortLabel: "Coding" },
  { id: "japanese", label: "🎌 Japanese", shortLabel: "Japanese" },
  { id: "discipline", label: "⚡ Discipline", shortLabel: "Discipline" },
  { id: "calculus", label: "∫ Calculus IV", shortLabel: "Calculus" },
  { id: "mechatronics", label: "🤖 Mechatronics", shortLabel: "Skills" },
  { id: "flstudio", label: "🎵 FL Studio", shortLabel: "Music" },
  { id: "webdev", label: "🌐 Web Dev", shortLabel: "Web Dev" },
];

// ── Study Steps ──
export const studySteps: Record<string, StudyStep[]> = {
  coding: [
    { id: 1, title: "C/C++ Basics", description: "Learn variables, data types, and basic syntax", duration: "30 min" },
    { id: 2, title: "Control Flow", description: "Master if/else, loops, and switch statements", duration: "45 min" },
    { id: 3, title: "Functions & Scope", description: "Understand function declaration and variable scope", duration: "45 min" },
    { id: 4, title: "Pointers Intro", description: "Learn pointer basics and memory addresses", duration: "60 min" },
    { id: 5, title: "Arrays & Strings", description: "Work with arrays and string manipulation", duration: "60 min" },
    { id: 6, title: "Structs & Classes", description: "Organize data with structs and OOP basics", duration: "60 min" },
    { id: 7, title: "File I/O", description: "Read and write files in C/C++", duration: "45 min" },
    { id: 8, title: "Embedded Systems", description: "Apply C/C++ to microcontroller programming", duration: "90 min" },
  ],
  japanese: [
    { id: 1, title: "Hiragana", description: "Master all 46 hiragana characters", duration: "2 hours" },
    { id: 2, title: "Katakana", description: "Master all 46 katakana characters", duration: "2 hours" },
    { id: 3, title: "Basic Greetings", description: "Learn essential daily greetings and phrases", duration: "30 min" },
    { id: 4, title: "Numbers & Counting", description: "Learn Japanese number system", duration: "45 min" },
    { id: 5, title: "Basic Kanji (N5)", description: "Learn the 100 most common kanji", duration: "3 hours" },
    { id: 6, title: "Grammar N5", description: "Master JLPT N5 grammar patterns", duration: "4 hours" },
    { id: 7, title: "Vocabulary N5", description: "Learn 800 essential N5 vocabulary words", duration: "5 hours" },
    { id: 8, title: "Reading Practice", description: "Read simple Japanese texts and manga", duration: "2 hours" },
  ],
  discipline: [
    { id: 1, title: "Morning Routine", description: "Establish a consistent 6am wake-up routine", duration: "Daily" },
    { id: 2, title: "Study Block System", description: "Implement 90-minute deep work blocks", duration: "Daily" },
    { id: 3, title: "No Phone Policy", description: "No phone during study sessions", duration: "Daily" },
    { id: 4, title: "Weekly Review", description: "Review goals and progress every Sunday", duration: "1 hour/week" },
    { id: 5, title: "Exercise Habit", description: "30 min exercise 5x per week", duration: "30 min/day" },
    { id: 6, title: "Sleep Schedule", description: "Sleep by 11pm, wake at 6am consistently", duration: "Daily" },
    { id: 7, title: "Meal Prep", description: "Prepare meals in advance to save time", duration: "2 hours/week" },
    { id: 8, title: "Digital Detox", description: "1 hour of no screens before bed", duration: "Daily" },
  ],
  calculus: [
    { id: 1, title: "Series & Sequences", description: "Convergence tests and power series", duration: "3 hours" },
    { id: 2, title: "Partial Derivatives", description: "Multivariable differentiation techniques", duration: "3 hours" },
    { id: 3, title: "Multiple Integrals", description: "Double and triple integrals", duration: "4 hours" },
    { id: 4, title: "Vector Calculus", description: "Gradient, divergence, and curl", duration: "4 hours" },
    { id: 5, title: "Line Integrals", description: "Path integrals and work calculation", duration: "3 hours" },
    { id: 6, title: "Surface Integrals", description: "Flux and surface area calculations", duration: "3 hours" },
    { id: 7, title: "Green's Theorem", description: "Relating line and double integrals", duration: "2 hours" },
    { id: 8, title: "Stokes' Theorem", description: "Generalizing Green's theorem to 3D", duration: "2 hours" },
  ],
  mechatronics: [
    { id: 1, title: "Arduino Basics", description: "Setup, GPIO, and basic circuits", duration: "2 hours" },
    { id: 2, title: "Sensors & Actuators", description: "Interfacing common sensors and motors", duration: "3 hours" },
    { id: 3, title: "PWM & Motor Control", description: "Control DC and servo motors with PWM", duration: "2 hours" },
    { id: 4, title: "I2C & SPI Protocols", description: "Serial communication protocols", duration: "2 hours" },
    { id: 5, title: "PID Control", description: "Implement PID controllers for feedback systems", duration: "4 hours" },
    { id: 6, title: "ROS Basics", description: "Robot Operating System fundamentals", duration: "5 hours" },
    { id: 7, title: "Computer Vision", description: "OpenCV for image processing", duration: "4 hours" },
    { id: 8, title: "Final Project", description: "Build a complete mechatronics system", duration: "10 hours" },
  ],
  flstudio: [
    { id: 1, title: "FL Studio Interface", description: "Learn the DAW layout and basic navigation", duration: "1 hour" },
    { id: 2, title: "Piano Roll", description: "Compose melodies using the piano roll", duration: "2 hours" },
    { id: 3, title: "Beat Making", description: "Create drum patterns and rhythms", duration: "2 hours" },
    { id: 4, title: "Mixing Basics", description: "Volume, panning, and EQ fundamentals", duration: "2 hours" },
    { id: 5, title: "Synthesis", description: "Sound design with synthesizers", duration: "3 hours" },
    { id: 6, title: "Effects & Plugins", description: "Reverb, delay, compression, and more", duration: "2 hours" },
    { id: 7, title: "Song Structure", description: "Arrange intro, verse, chorus, and bridge", duration: "2 hours" },
    { id: 8, title: "Mastering", description: "Final mix and export your first track", duration: "2 hours" },
  ],
  webdev: [
    { id: 1, title: "HTML Fundamentals", description: "Structure web pages with semantic HTML", duration: "2 hours" },
    { id: 2, title: "CSS Styling", description: "Style pages with CSS and Flexbox/Grid", duration: "3 hours" },
    { id: 3, title: "JavaScript Basics", description: "Variables, functions, and DOM manipulation", duration: "4 hours" },
    { id: 4, title: "React Fundamentals", description: "Components, props, state, and hooks", duration: "5 hours" },
    { id: 5, title: "Node.js & Express", description: "Build backend APIs with Node.js", duration: "4 hours" },
    { id: 6, title: "Databases", description: "SQL and NoSQL database fundamentals", duration: "3 hours" },
    { id: 7, title: "Authentication", description: "Implement user auth with JWT", duration: "3 hours" },
    { id: 8, title: "Deploy a Project", description: "Deploy a full-stack app to production", duration: "2 hours" },
  ],
};

// ── Coding Resources ──
export const codingResources: ResourceCard[] = [
  {
    name: "C / C++",
    role: "Embedded Systems & Real-Time Control",
    why: "The backbone of mechatronics. Controls microcontrollers, motor drivers, and real-time systems. Used in ROS, Arduino, and STM32 development.",
    resources: [
      { name: "Udemy: Embedded C for Beginners", url: "https://www.udemy.com/course/embedded-c-for-beginners/" },
      { name: "5-Hour Embedded C Crash Course (YouTube)", url: "https://www.youtube.com/watch?v=8jiiKQH1ciw" },
      { name: "LearnCPP.com (Free)", url: "https://www.learncpp.com/" },
    ],
    time: "2–3 months",
    priority: 1,
    color: "#3b82f6",
    badge: "#1 Priority",
  },
  {
    name: "Python",
    role: "Data Analysis, ML & Prototyping",
    why: "The fastest language for prototyping, computer vision (OpenCV), machine learning, and sensor data processing. Second main language in ROS.",
    resources: [
      { name: "Coursera: Python for Everybody", url: "https://www.coursera.org/specializations/python" },
      { name: "Codecademy Python (Free tier)", url: "https://www.codecademy.com/learn/learn-python-3" },
      { name: "Real Python (Tutorials)", url: "https://realpython.com/" },
    ],
    time: "1–2 months",
    priority: 2,
    color: "#6366f1",
    badge: "#2 Priority",
  },
  {
    name: "MATLAB / Simulink",
    role: "Modeling, Simulation & Control Design",
    why: "Industry standard for control system design, signal processing, and algorithm development. Simulink allows block-diagram-based system modeling.",
    resources: [
      { name: "MathWorks MATLAB Onramp (Free)", url: "https://matlabacademy.mathworks.com/" },
      { name: "MathWorks Simulink Onramp (Free)", url: "https://matlabacademy.mathworks.com/" },
      { name: "MATLAB for Engineers (Coursera)", url: "https://www.coursera.org/learn/matlab" },
    ],
    time: "1–2 months",
    priority: 3,
    color: "#f59e0b",
    badge: "#3 Priority",
  },
  {
    name: "LabVIEW",
    role: "Test, Measurement & Instrumentation",
    why: "Graphical programming environment used in test and measurement applications. Common in industrial and research settings.",
    resources: [
      { name: "NI LabVIEW Core 1 (Official)", url: "https://www.ni.com/en/shop/services/education/self-paced-training.html" },
      { name: "LabVIEW Tutorials (YouTube)", url: "https://www.youtube.com/results?search_query=labview+tutorial+beginners" },
    ],
    time: "1 month",
    priority: 4,
    color: "#10b981",
    badge: "Bonus",
  },
];

// ── Japanese Resources ──
export const japaneseResources: ResourceCard[] = [
  {
    name: "Anki Flashcards",
    role: "Spaced Repetition System",
    why: "The most effective tool for memorizing kanji, vocabulary, and grammar. Use pre-made JLPT decks.",
    resources: [
      { name: "Anki (Free Desktop App)", url: "https://apps.ankiweb.net/" },
      { name: "JLPT N5 Deck (AnkiWeb)", url: "https://ankiweb.net/shared/info/1679429599" },
    ],
    time: "Daily",
    priority: 1,
    color: "#ec4899",
    badge: "#1 Priority",
  },
  {
    name: "Genki Textbook",
    role: "Structured Grammar & Vocabulary",
    why: "The gold standard Japanese textbook used in universities worldwide. Covers N5-N4 level systematically.",
    resources: [
      { name: "Genki I (Amazon)", url: "https://www.amazon.com/Genki-Integrated-Elementary-Japanese-English/dp/4789014401" },
      { name: "Genki Study Resources (Free)", url: "https://sethclydesdale.github.io/genki-study-resources/" },
    ],
    time: "3–4 months",
    priority: 2,
    color: "#f59e0b",
    badge: "#2 Priority",
  },
  {
    name: "WaniKani",
    role: "Kanji Learning System",
    why: "Structured kanji learning using mnemonics and SRS. Covers 2000+ kanji in a logical order.",
    resources: [
      { name: "WaniKani (Official)", url: "https://www.wanikani.com/" },
      { name: "Tofugu (Free Resources)", url: "https://www.tofugu.com/" },
    ],
    time: "1–2 years",
    priority: 3,
    color: "#6366f1",
    badge: "#3 Priority",
  },
  {
    name: "Immersion",
    role: "Listening & Reading Practice",
    why: "Consuming native Japanese content accelerates comprehension. Anime, manga, and YouTube are great resources.",
    resources: [
      { name: "Comprehensible Japanese (YouTube)", url: "https://www.youtube.com/@cijapanese" },
      { name: "NHK Web Easy (News)", url: "https://www3.nhk.or.jp/news/easy/" },
    ],
    time: "Daily",
    priority: 4,
    color: "#10b981",
    badge: "Daily",
  },
];

// ── Discipline Resources ──
export const disciplineResources: ResourceCard[] = [
  {
    name: "Atomic Habits",
    role: "Habit Formation System",
    why: "The definitive guide to building good habits and breaking bad ones. Essential reading for any serious self-improvement journey.",
    resources: [
      { name: "Atomic Habits (Amazon)", url: "https://www.amazon.com/Atomic-Habits-Proven-Build-Break/dp/0735211299" },
      { name: "James Clear's Website (Free)", url: "https://jamesclear.com/" },
    ],
    time: "1 week read",
    priority: 1,
    color: "#f59e0b",
    badge: "#1 Priority",
  },
  {
    name: "Deep Work",
    role: "Focus & Productivity",
    why: "Cal Newport's framework for achieving high-quality work in distraction-free sessions. Critical for mastering complex skills.",
    resources: [
      { name: "Deep Work (Amazon)", url: "https://www.amazon.com/Deep-Work-Focused-Success-Distracted/dp/1455586692" },
      { name: "Cal Newport Blog (Free)", url: "https://www.calnewport.com/blog/" },
    ],
    time: "1 week read",
    priority: 2,
    color: "#3b82f6",
    badge: "#2 Priority",
  },
  {
    name: "Pomodoro Technique",
    role: "Time Management",
    why: "25-minute focused work sessions with 5-minute breaks. Scientifically proven to improve focus and reduce mental fatigue.",
    resources: [
      { name: "Pomofocus (Free Timer)", url: "https://pomofocus.io/" },
      { name: "Pomodoro Technique Guide", url: "https://francescocirillo.com/pages/pomodoro-technique" },
    ],
    time: "Daily",
    priority: 3,
    color: "#ec4899",
    badge: "Daily",
  },
];

// ── Calculus Resources ──
export const calculusResources: ResourceCard[] = [
  {
    name: "Paul's Online Math Notes",
    role: "Calculus IV Reference",
    why: "The best free online resource for Calculus III/IV. Clear explanations, worked examples, and practice problems.",
    resources: [
      { name: "Paul's Math Notes (Free)", url: "https://tutorial.math.lamar.edu/" },
    ],
    time: "Reference",
    priority: 1,
    color: "#10b981",
    badge: "#1 Priority",
  },
  {
    name: "3Blue1Brown",
    role: "Visual Intuition",
    why: "The Essence of Calculus series builds deep visual intuition for calculus concepts that textbooks often miss.",
    resources: [
      { name: "Essence of Calculus (YouTube)", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr" },
      { name: "3Blue1Brown Website", url: "https://www.3blue1brown.com/" },
    ],
    time: "10 hours",
    priority: 2,
    color: "#6366f1",
    badge: "#2 Priority",
  },
  {
    name: "MIT OpenCourseWare",
    role: "University-Level Calculus",
    why: "Free MIT lecture videos and problem sets for multivariable calculus. Same content as the actual MIT course.",
    resources: [
      { name: "MIT 18.02 Multivariable Calculus", url: "https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/" },
    ],
    time: "3–4 months",
    priority: 3,
    color: "#f59e0b",
    badge: "#3 Priority",
  },
];

// ── Mechatronics Resources ──
export const mechatronicsResources: ResourceCard[] = [
  {
    name: "Arduino",
    role: "Microcontroller Platform",
    why: "The most beginner-friendly microcontroller platform. Perfect for learning embedded systems, sensors, and actuators.",
    resources: [
      { name: "Arduino Official Tutorials", url: "https://docs.arduino.cc/learn/" },
      { name: "Arduino Course for Beginners (YouTube)", url: "https://www.youtube.com/watch?v=zJ-LqeX_fLU" },
    ],
    time: "1–2 months",
    priority: 1,
    color: "#10b981",
    badge: "#1 Priority",
  },
  {
    name: "ROS (Robot Operating System)",
    role: "Robotics Framework",
    why: "The industry standard framework for robotics. Used in research labs, autonomous vehicles, and industrial robots worldwide.",
    resources: [
      { name: "ROS Official Tutorials", url: "https://docs.ros.org/en/humble/Tutorials.html" },
      { name: "ROS2 for Beginners (Udemy)", url: "https://www.udemy.com/course/ros2-for-beginners/" },
    ],
    time: "2–3 months",
    priority: 2,
    color: "#3b82f6",
    badge: "#2 Priority",
  },
  {
    name: "Control Systems",
    role: "PID & Feedback Control",
    why: "Understanding control theory is essential for robotics and automation. PID controllers are used in virtually every mechatronics system.",
    resources: [
      { name: "Control Systems Lectures (YouTube)", url: "https://www.youtube.com/playlist?list=PLUMWjy5jgHK1NC52DXXrriwihVrYZKqjk" },
      { name: "Brian Douglas Control Systems", url: "https://www.youtube.com/@BrianBDouglas" },
    ],
    time: "2 months",
    priority: 3,
    color: "#f59e0b",
    badge: "#3 Priority",
  },
];

// ── FL Studio Resources ──
export const flstudioResources: ResourceCard[] = [
  {
    name: "FL Studio",
    role: "Digital Audio Workstation",
    why: "One of the most popular DAWs for electronic music production. Used by world-class producers. Lifetime free updates.",
    resources: [
      { name: "FL Studio Official Tutorials", url: "https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/" },
      { name: "FL Studio Beginner Course (YouTube)", url: "https://www.youtube.com/watch?v=GNMhJFtEtFc" },
    ],
    time: "Ongoing",
    priority: 1,
    color: "#f59e0b",
    badge: "#1 Priority",
  },
  {
    name: "Music Theory",
    role: "Harmony & Composition",
    why: "Understanding scales, chords, and progressions will dramatically improve your music production quality.",
    resources: [
      { name: "musictheory.net (Free)", url: "https://www.musictheory.net/" },
      { name: "Music Theory for Producers (YouTube)", url: "https://www.youtube.com/watch?v=rgaTLrZGlk0" },
    ],
    time: "2–3 months",
    priority: 2,
    color: "#ec4899",
    badge: "#2 Priority",
  },
];

// ── Web Dev Resources ──
export const webdevResources: ResourceCard[] = [
  {
    name: "The Odin Project",
    role: "Full-Stack Web Development",
    why: "The best free full-stack curriculum. Covers HTML, CSS, JavaScript, React, Node.js, and databases in a project-based approach.",
    resources: [
      { name: "The Odin Project (Free)", url: "https://www.theodinproject.com/" },
    ],
    time: "6–12 months",
    priority: 1,
    color: "#3b82f6",
    badge: "#1 Priority",
  },
  {
    name: "React",
    role: "Frontend Framework",
    why: "The most popular frontend framework. Used by Facebook, Instagram, Airbnb, and thousands of companies worldwide.",
    resources: [
      { name: "React Official Docs", url: "https://react.dev/" },
      { name: "Full React Course (YouTube)", url: "https://www.youtube.com/watch?v=bMknfKXIFA8" },
    ],
    time: "2–3 months",
    priority: 2,
    color: "#6366f1",
    badge: "#2 Priority",
  },
  {
    name: "Node.js & Express",
    role: "Backend Development",
    why: "JavaScript on the server. Build REST APIs, handle databases, and create full-stack applications.",
    resources: [
      { name: "Node.js Official Docs", url: "https://nodejs.org/en/docs/" },
      { name: "Express.js Guide", url: "https://expressjs.com/en/guide/routing.html" },
    ],
    time: "1–2 months",
    priority: 3,
    color: "#10b981",
    badge: "#3 Priority",
  },
];

// ── Goal definitions ──
export interface GoalDefinition {
  id: string;
  number: string;
  title: string;
  titleHighlight: string;
  description: string;
  color: string;
  timers: Array<{ title: string; totalWeeks: number; color: string }>;
  resources: ResourceCard[];
  barData: Array<{ name: string; hours: number; color: string }>;
}

export const goalDefinitions: Record<string, GoalDefinition> = {
  coding: {
    id: "coding",
    number: "// GOAL 01 — PROGRAMMING",
    title: "Code Like a ",
    titleHighlight: "Machine",
    description: "Mechatronics is where hardware meets software. Mastering these languages gives you the ability to program microcontrollers, simulate systems, and build intelligent machines from scratch.",
    color: "#3b82f6",
    timers: [
      { title: "C/C++ Learning", totalWeeks: 12, color: "#3b82f6" },
      { title: "Python Learning", totalWeeks: 8, color: "#6366f1" },
      { title: "MATLAB Learning", totalWeeks: 8, color: "#f59e0b" },
      { title: "LabVIEW Learning", totalWeeks: 4, color: "#10b981" },
    ],
    resources: codingResources,
    barData: codingResources.map(r => ({
      name: r.name,
      hours: parseInt(r.time.split("–")[0]) * 4 * 2,
      color: r.color,
    })),
  },
  japanese: {
    id: "japanese",
    number: "// GOAL 02 — LANGUAGE",
    title: "Speak ",
    titleHighlight: "Japanese",
    description: "Language is the gateway to culture and connection. Learning Japanese opens doors to advanced robotics research, anime, manga, and direct communication with Japanese engineers and researchers.",
    color: "#ec4899",
    timers: [
      { title: "Hiragana & Katakana", totalWeeks: 2, color: "#ec4899" },
      { title: "JLPT N5 Study", totalWeeks: 12, color: "#f59e0b" },
      { title: "Daily Anki Practice", totalWeeks: 52, color: "#6366f1" },
      { title: "Immersion Practice", totalWeeks: 52, color: "#10b981" },
    ],
    resources: japaneseResources,
    barData: [
      { name: "Hiragana/Katakana", hours: 8, color: "#ec4899" },
      { name: "N5 Grammar", hours: 40, color: "#f59e0b" },
      { name: "Vocabulary", hours: 60, color: "#6366f1" },
      { name: "Kanji", hours: 80, color: "#10b981" },
    ],
  },
  discipline: {
    id: "discipline",
    number: "// GOAL 03 — MINDSET",
    title: "Iron ",
    titleHighlight: "Discipline",
    description: "Without discipline, all other goals collapse. Building unbreakable habits and mental fortitude is the foundation that makes every other achievement possible.",
    color: "#f59e0b",
    timers: [
      { title: "Morning Routine", totalWeeks: 52, color: "#f59e0b" },
      { title: "Exercise Habit", totalWeeks: 52, color: "#10b981" },
      { title: "Deep Work Sessions", totalWeeks: 52, color: "#3b82f6" },
      { title: "Sleep Schedule", totalWeeks: 52, color: "#6366f1" },
    ],
    resources: disciplineResources,
    barData: [
      { name: "Morning Routine", hours: 30, color: "#f59e0b" },
      { name: "Exercise", hours: 130, color: "#10b981" },
      { name: "Deep Work", hours: 200, color: "#3b82f6" },
      { name: "Reading", hours: 50, color: "#6366f1" },
    ],
  },
  calculus: {
    id: "calculus",
    number: "// GOAL 04 — MATHEMATICS",
    title: "Conquer ",
    titleHighlight: "Calculus IV",
    description: "Advanced mathematics is the language of engineering. Mastering multivariable calculus and vector analysis provides the mathematical foundation for control systems, signal processing, and robotics.",
    color: "#10b981",
    timers: [
      { title: "Series & Sequences", totalWeeks: 3, color: "#10b981" },
      { title: "Multivariable Calc", totalWeeks: 6, color: "#3b82f6" },
      { title: "Vector Calculus", totalWeeks: 4, color: "#6366f1" },
      { title: "Problem Sets", totalWeeks: 8, color: "#f59e0b" },
    ],
    resources: calculusResources,
    barData: [
      { name: "Series", hours: 20, color: "#10b981" },
      { name: "Partial Deriv.", hours: 25, color: "#3b82f6" },
      { name: "Multiple Int.", hours: 30, color: "#6366f1" },
      { name: "Vector Calc", hours: 35, color: "#f59e0b" },
    ],
  },
  mechatronics: {
    id: "mechatronics",
    number: "// GOAL 05 — ENGINEERING",
    title: "Build ",
    titleHighlight: "Machines",
    description: "Mechatronics is the synthesis of mechanical, electrical, and computer engineering. Building real systems — from sensors to actuators to autonomous robots — is the ultimate goal.",
    color: "#8b5cf6",
    timers: [
      { title: "Arduino Projects", totalWeeks: 8, color: "#8b5cf6" },
      { title: "ROS Learning", totalWeeks: 12, color: "#3b82f6" },
      { title: "Control Systems", totalWeeks: 8, color: "#f59e0b" },
      { title: "Final Project", totalWeeks: 4, color: "#10b981" },
    ],
    resources: mechatronicsResources,
    barData: [
      { name: "Arduino", hours: 40, color: "#8b5cf6" },
      { name: "ROS", hours: 60, color: "#3b82f6" },
      { name: "Control", hours: 50, color: "#f59e0b" },
      { name: "Project", hours: 80, color: "#10b981" },
    ],
  },
  flstudio: {
    id: "flstudio",
    number: "// GOAL 06 — CREATIVITY",
    title: "Make ",
    titleHighlight: "Music",
    description: "Music production is the creative counterbalance to technical study. FL Studio is the tool of choice for electronic music production, used by world-class producers.",
    color: "#ec4899",
    timers: [
      { title: "FL Studio Basics", totalWeeks: 4, color: "#ec4899" },
      { title: "Beat Making", totalWeeks: 8, color: "#f59e0b" },
      { title: "Music Theory", totalWeeks: 12, color: "#6366f1" },
      { title: "Track Production", totalWeeks: 16, color: "#10b981" },
    ],
    resources: flstudioResources,
    barData: [
      { name: "Basics", hours: 20, color: "#ec4899" },
      { name: "Beats", hours: 40, color: "#f59e0b" },
      { name: "Theory", hours: 30, color: "#6366f1" },
      { name: "Production", hours: 60, color: "#10b981" },
    ],
  },
  webdev: {
    id: "webdev",
    number: "// GOAL 07 — TECHNOLOGY",
    title: "Ship ",
    titleHighlight: "Products",
    description: "Web development skills allow you to build tools, portfolios, and products that showcase your work to the world. Full-stack development is a superpower for any engineer.",
    color: "#3b82f6",
    timers: [
      { title: "HTML & CSS", totalWeeks: 4, color: "#3b82f6" },
      { title: "JavaScript", totalWeeks: 8, color: "#f59e0b" },
      { title: "React", totalWeeks: 8, color: "#6366f1" },
      { title: "Backend & Deploy", totalWeeks: 8, color: "#10b981" },
    ],
    resources: webdevResources,
    barData: [
      { name: "HTML/CSS", hours: 30, color: "#3b82f6" },
      { name: "JavaScript", hours: 60, color: "#f59e0b" },
      { name: "React", hours: 50, color: "#6366f1" },
      { name: "Backend", hours: 40, color: "#10b981" },
    ],
  },
};
