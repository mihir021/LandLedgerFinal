export const projects = [
  {
    id: "dinexa",
    title: "DINEXA",
    badge: "FULL-STACK SAAS",
    comicBadge: "FLAGSHIP 💥",
    color: "bg-[#0099FF]",
    textColor: "text-white",
    featured: true,
    tagline: "Smart Restaurant Operations & Real-Time Seat-Locking Platform",
    highlights: [
      "Real-time seat-locking algorithm preventing double booking across high-traffic restaurants",
      "MERN stack architecture with JWT authentication and granular role-based access control (RBAC)",
      "Interactive digital POS menu, live bill calculation, and downloadable automated PDF receipts"
    ],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS", "PDFKit"],
    liveUrl: "https://dinexa.vercel.app",
    githubUrl: "https://github.com/mihir021/dinexa",
    live: true
  },
  {
    id: "formbuddy",
    title: "FORMBUDDY",
    badge: "BACKEND TOOL",
    comicBadge: "POPULAR 🔥",
    color: "bg-[#FFD400]",
    textColor: "text-[#111111]",
    featured: true,
    tagline: "Zero-Code Form Endpoint & Webhook Manager for Developers",
    highlights: [
      "Instant endpoint generator for HTML/React forms with zero backend boilerplate code required",
      "Custom pop-art dashboard with webhook integrations, email notifications, and spam filtering",
      "Handling thousands of form submissions with fast MongoDB indexing and response sanitization"
    ],
    stack: ["Node.js", "Express.js", "MongoDB", "Tailwind CSS", "Nodemailer", "Webhooks"],
    liveUrl: "https://formbuddy.in",
    githubUrl: "https://github.com/mihir021/formbuddy",
    live: true
  },
  {
    id: "ai-resume-maker",
    title: "AI RESUME MAKER",
    badge: "AI & FLASK",
    comicBadge: "AI POWERED 🤖",
    color: "bg-[#FF4D5E]",
    textColor: "text-white",
    featured: true,
    tagline: "Smart Resume Builder & ATS Score Evaluator",
    highlights: [
      "Python Flask backend integrating AI text parsing algorithms to generate tailored ATS resumes",
      "Real-time preview editor with live keyword scoring and dynamic PDF export styling",
      "Structured JSON schema generator allowing instant export/import of profile data"
    ],
    stack: ["Python", "Flask", "JavaScript", "HTML5/CSS3", "fpdf2", "OpenAI API"],
    liveUrl: "https://ai-resume-maker-demo.vercel.app",
    githubUrl: "https://github.com/mihir021/ai-resume-maker",
    live: true
  },
  {
    id: "volunteerbridge",
    title: "VOLUNTEERBRIDGE",
    badge: "NEXT.JS 14",
    comicBadge: "GOOGLE 2026 🌍",
    color: "bg-[#3FCB6B]",
    textColor: "text-[#111111]",
    featured: true,
    tagline: "AI-Powered Emergency Volunteer Coordination (Google Solution Challenge)",
    highlights: [
      "4-Role system (Admin / NGO / Citizen / Volunteer) for crisis deployment during natural disasters",
      "AI task matching algorithm matching volunteer skills with geo-tagged requests",
      "Live interactive map tracking with Leaflet and real-time impact charts"
    ],
    stack: ["Next.js 14", "Firebase", "Claude API", "Leaflet", "Recharts", "Tailwind CSS"],
    liveUrl: "https://volunteerbridge.vercel.app",
    githubUrl: "https://github.com/mihir021/volunteerbridge",
    live: true
  },
  {
    id: "institute-management-system",
    title: "INSTITUTE MANAGEMENT SYSTEM",
    badge: "JAVA & DS",
    comicBadge: "CORE JAVA ⚡",
    color: "bg-[#0099FF]",
    textColor: "text-white",
    featured: true,
    tagline: "High-Performance Console College System with Custom Data Structures",
    highlights: [
      "Custom Binary Search Tree (BST) implementation for O(log n) student record lookups",
      "Stack-based operational state machine supporting multi-level undo/redo operations",
      "Role-based security login with automated iText PDF student ID card generator"
    ],
    stack: ["Java", "MySQL (JDBC)", "Custom BST", "Stack DS", "iText PDF"],
    liveUrl: null,
    githubUrl: "https://github.com/mihir021/institute-management-system",
    live: false
  },
  {
    id: "basketiq",
    title: "BASKETIQ",
    badge: "DJANGO SAAS",
    comicBadge: "E-COMMERCE 🛒",
    color: "bg-[#FF8500]",
    textColor: "text-white",
    featured: false,
    tagline: "Smart E-Commerce Analytics & Cart Recommendation Engine",
    highlights: [
      "Django ORM powered product catalog with real-time stock management and order processing",
      "Dynamic cart recommendation algorithm suggesting complementary items based on purchase history"
    ],
    stack: ["Python", "Django", "PostgreSQL", "JavaScript", "Bootstrap 5"],
    liveUrl: null,
    githubUrl: "https://github.com/mihir021/basketiq",
    live: false
  },
  {
    id: "khetsense",
    title: "KHETSENSE",
    badge: "AGRITECH AI",
    comicBadge: "SMART AGRI 🌱",
    color: "bg-[#3FCB6B]",
    textColor: "text-[#111111]",
    featured: false,
    tagline: "IoT & AI Soil Health Monitoring & Crop Yield Predictor",
    highlights: [
      "Predictive machine learning models forecasting crop yields based on soil NPK levels and weather APIs",
      "Farmer dashboard in regional languages with real-time pest alert system"
    ],
    stack: ["Python", "Flask", "Scikit-Learn", "Chart.js", "OpenWeather API"],
    liveUrl: null,
    githubUrl: "https://github.com/mihir021/khetsense",
    live: false
  },
  {
    id: "elevate-cloths",
    title: "ELEVATE CLOTHS",
    badge: "MERN STORE",
    comicBadge: "FASHION 👗",
    color: "bg-[#FF007F]",
    textColor: "text-white",
    featured: false,
    tagline: "Modern Clothing E-Commerce Portal with Razorpay Checkout",
    highlights: [
      "Full MERN e-commerce architecture with user accounts, cart persistence, and order tracking",
      "Integrated payment gateway sandbox with instant order confirmation emails"
    ],
    stack: ["React.js", "Node.js", "Express.js", "MongoDB", "Razorpay SDK"],
    liveUrl: null,
    githubUrl: "https://github.com/mihir021/elevate-cloths",
    live: false
  },
  {
    id: "krishi-connect",
    title: "KRISHI CONNECT",
    badge: "COMMUNITY HUB",
    comicBadge: "DIRECT MARKET 🚜",
    color: "bg-[#FFD400]",
    textColor: "text-[#111111]",
    featured: false,
    tagline: "Direct Farmer-to-Wholesaler Marketplace Platform",
    highlights: [
      "Direct bidding portal connecting local agricultural producers directly with commercial buyers",
      "Eliminating middleman markups with transparent pricing and escrow payment verification"
    ],
    stack: ["React.js", "Firebase Firestore", "Tailwind CSS", "Google Maps API"],
    liveUrl: null,
    githubUrl: "https://github.com/mihir021/krishi-connect",
    live: false
  }
];
