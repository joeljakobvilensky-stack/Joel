import { Friend, ActiveBattle, BattleGroup, DesignTheme } from "./types";

// Dynamic Themes for App Customizations
export const INITIAL_THEMES: DesignTheme[] = [
  {
    id: "emerald-sprout",
    name: "Emerald Sprout",
    description: "Our default high-contrast clean look. Natural light-greens and refreshing herbal slate overlays.",
    appleCost: 0,
    unlocked: true,
    previewUrl: "🟢 Default Natural Green Theme",
    primaryClass: "from-emerald-500 to-green-600 bg-emerald-600 text-white",
    bgClass: "bg-slate-900 border-emerald-500/20",
    cardBgClass: "bg-slate-800/90 border-slate-700/60",
    textClass: "text-emerald-400 font-display",
    accentClass: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
  },
  {
    id: "cosmic-vitamin",
    name: "Cosmic Vitamin",
    description: "Step into deep space. Dark navy background with amber and golden starlight glow effects.",
    appleCost: 40,
    unlocked: false,
    previewUrl: "🌌 Indigo & Neon Yellow Space",
    primaryClass: "from-indigo-600 to-violet-700 bg-indigo-600 text-white",
    bgClass: "bg-slate-950 border-indigo-500/20",
    cardBgClass: "bg-indigo-950/60 border-indigo-800/40",
    textClass: "text-amber-300 font-display",
    accentClass: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30"
  },
  {
    id: "sunset-citrus",
    name: "Sunset Citrus Gold",
    description: "Rich shades of mandarin orange and grapefruit. Perfect for vitamin C energy boosts.",
    appleCost: 80,
    unlocked: false,
    previewUrl: "🍊 Warm Orange-Gold Mandarin",
    primaryClass: "from-orange-500 to-red-500 bg-orange-500 text-white",
    bgClass: "bg-stone-900 border-orange-500/20",
    cardBgClass: "bg-stone-850 bg-stone-900/90 border-stone-800",
    textClass: "text-amber-400 font-display",
    accentClass: "bg-orange-500/10 text-orange-400 border-orange-500/30"
  },
  {
    id: "cyber-apple",
    name: "Cyber Apple Arcade",
    description: "High tech cybersecurity meets organic nutrition. Laser neon-greens and obsidian backdrops.",
    appleCost: 150,
    unlocked: false,
    previewUrl: "⚡ High-Vibe Cyber Obsidian Mode",
    primaryClass: "from-lime-500 to-emerald-500 bg-lime-500 text-black",
    bgClass: "bg-zinc-950 border-lime-500/30",
    cardBgClass: "bg-zinc-900/90 border-zinc-800",
    textClass: "text-lime-400 font-display",
    accentClass: "bg-lime-500/10 text-lime-400 border-lime-500/30"
  }
];

// Seed Friends list
export const INITIAL_FRIENDS: Friend[] = [
  {
    id: "friend-1",
    name: "Sam (Sprout)",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    rank: "Sprout 🌿",
    apples: 180,
    progressPercentage: 85,
    vitaminProgress: 90,
    lastActive: "Active 2m ago"
  },
  {
    id: "friend-2",
    name: "Jessica (Harvest)",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    rank: "Harvest 🍎",
    apples: 820,
    progressPercentage: 95,
    vitaminProgress: 100,
    lastActive: "Active 1h ago"
  },
  {
    id: "friend-3",
    name: "Toby (Seedling)",
    avatarUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&auto=format&fit=crop&q=80",
    rank: "Seedling 🌱",
    apples: 65,
    progressPercentage: 45,
    vitaminProgress: 30,
    lastActive: "Active yesterday"
  },
  {
    id: "friend-4",
    name: "Dr. Rachel (Blossom)",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rank: "Blossom 🌸",
    apples: 410,
    progressPercentage: 70,
    vitaminProgress: 85,
    lastActive: "Active 5m ago"
  }
];

// Active Battles (User vs Friends or Group battles)
export const INITIAL_BATTLES: ActiveBattle[] = [
  {
    id: "battle-1",
    title: "1v1 Vitamin C Blast Speedrun",
    type: "1v1",
    opponentIds: ["friend-1"],
    yourScore: 78,
    opponentsScore: {
      "friend-1": 85
    },
    daysLeft: 1,
    status: "active",
    prizeApples: 15
  },
  {
    id: "battle-2",
    title: "Golden Orchard Weekly Group Battle",
    type: "group",
    opponentIds: ["friend-2", "friend-4"],
    yourScore: 92,
    opponentsScore: {
      "friend-2": 95,
      "friend-4": 75
    },
    daysLeft: 3,
    status: "active",
    prizeApples: 50
  }
];

// Social Battle Groups
export const INITIAL_GROUPS: BattleGroup[] = [
  {
    id: "group-1",
    name: "Vitamin Avengers",
    membersCount: 8,
    description: "We focus on reaching 100% vitamin counts every single day. Strictly oranges and spinach!"
  },
  {
    id: "group-2",
    name: "Carb Busters Group",
    membersCount: 14,
    description: "Counting carbs while maintaining maximum mineral and vitamin values. Healthy eaters win!"
  }
];

// Quick barcode presets for test scans
export const PRESETS_BARCODES = [
  {
    code: "501234567890",
    name: "Sunny Citrus Multi-Vitamin Bottle",
    brand: "GlowNutrition Inc.",
    imageUrl: "https://images.unsplash.com/photo-1610970881699-44a5587caa9a?w=400&q=80"
  },
  {
    code: "099482431252",
    name: "Super-Greens High Vit-A Organic Bar",
    brand: "Orchard Bites Co.",
    imageUrl: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400&q=80"
  },
  {
    code: "880943501242",
    name: "Natural Zinc & B-Complex Elixir",
    brand: "Hale BioLabs",
    imageUrl: "https://images.unsplash.com/photo-1626880842125-8f7f45ee3e47?w=400&q=80"
  }
];

// Quick food image presets for camera simulation
export const PRESETS_FOOD_PHOTOS = [
  {
    name: "Fresh Spinach & Salmon Salad",
    prompt: "Salad plate filled with dark leafy baby spinach, roasted pink salmon chunks, boiled, and vinaigrette.",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80"
  },
  {
    name: "Antioxidant Rich Mixed Berries Bowl",
    prompt: "Bowl containing delicious wild blueberries, red strawberries, nutrient-dense raspberries.",
    imageUrl: "https://images.unsplash.com/photo-1518133683791-0b9de5a055f0?w=400&q=80"
  },
  {
    name: "Healthy Citrus Vitamin Juice Drink",
    prompt: "Tall glass of freshly squeezed orange power juice decorated with lemon slices, high density Vitamin C.",
    imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=400&q=80"
  },
  {
    name: "Whole Wheat Avocado and Fried Egg Toast",
    prompt: "Slide of multi-grain sourdough bread sliced avocado pulp topped with one sunny side up fried hen egg.",
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80"
  }
];

// Walkthrough hotspots
export interface Hotspot {
  id: string;
  tabId: string;
  label: string;
  description: string;
}

export const INTERACTIVE_HOTSPOTS: Hotspot[] = [
  {
    id: "vitamin-meter",
    tabId: "dashboard",
    label: "Vitamin Micro-Gauges",
    description: "Shows your target Vitamin A, B, C, D, and E daily goals. Click to view deep food sources."
  },
  {
    id: "wearable-sync",
    tabId: "dashboard",
    label: "Wearables Integration Hub",
    description: "Instantly link devices (Apple Health, Fitbit) and sync stats to raise your battle speeds!"
  },
  {
    id: "barcode-scanner-hotspot",
    tabId: "scanner",
    label: "Omit Typing: Scan Barcode",
    description: "Upload a barcode image or click Preset Barcode Samples. Gemini reads the nutritional facts!"
  },
  {
    id: "food-camera-hotspot",
    tabId: "scanner",
    label: "Omit Typing: Meal Camera Recognition",
    description: "Take a picture of food, type eaten weight (grams), and Gemini logs exact micro-nutrients."
  },
  {
    id: "battle-leaderboard",
    tabId: "social",
    label: "Competitive Leaderboard & Apple-Multiplier",
    description: "Gain apples for meeting targets faster than others. Buy gorgeous application skins."
  }
];
