// Game-style interviewer roster — 6 unique characters
const roster = [
  {
    id: 1,
    name: "Alex Chen",
    gender: "male",
    role: "Senior Technical Interviewer",
    avatar: "👨‍💻",
    color: "#60a5fa",
    bgColor: "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)",
    suiteShade: "#1e3a8a",
    description: "10+ years in software engineering. Deep expertise in system design, algorithms, and distributed systems."
  },
  {
    id: 2,
    name: "Sarah Miller",
    gender: "female",
    role: "HR & Behavioral Specialist",
    avatar: "👩‍💼",
    color: "#a78bfa",
    bgColor: "linear-gradient(135deg, #6d28d9 0%, #1e293b 100%)",
    suiteShade: "#6d28d9",
    description: "Expert in behavioral interviews, culture fit assessment, and leadership competency evaluation."
  },
  {
    id: 3,
    name: "Marcus Wright",
    gender: "male",
    role: "System Design Architect",
    avatar: "🧑‍🔧",
    color: "#34d399",
    bgColor: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
    suiteShade: "#064e3b",
    description: "Staff engineer at a FAANG company. Will push you on scalability, trade-offs, and real-world design decisions."
  },
  {
    id: 4,
    name: "Priya Sharma",
    gender: "female",
    role: "Product & Strategy Lead",
    avatar: "👩‍💡",
    color: "#f97316",
    bgColor: "linear-gradient(135deg, #7c2d12 0%, #1c1917 100%)",
    suiteShade: "#7c2d12",
    description: "Former PM at top tech firms. Evaluates product sense, prioritization, and cross-functional communication."
  },
  {
    id: 5,
    name: "James Liu",
    gender: "male",
    role: "Engineering Manager",
    avatar: "🧑‍🏫",
    color: "#fbbf24",
    bgColor: "linear-gradient(135deg, #78350f 0%, #1c1917 100%)",
    suiteShade: "#78350f",
    description: "Leads 20-person engineering teams. Focuses on leadership maturity, conflict resolution, and team scaling."
  },
  {
    id: 6,
    name: "Emily Park",
    gender: "female",
    role: "Data Science & ML Lead",
    avatar: "👩‍🔬",
    color: "#38bdf8",
    bgColor: "linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)",
    suiteShade: "#0c4a6e",
    description: "ML engineer specializing in model evaluation, statistics, and applied AI for production systems."
  }
];

export const avatarCatalog = {
  default: roster,
  software: roster,
  data: roster
};

export const getFilteredAvatars = (catalog, _industry) => catalog.default;

// Backward compatibility
export const characterCatalog = avatarCatalog;
export const getFilteredCharacters = getFilteredAvatars;
