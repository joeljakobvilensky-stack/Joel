export interface Nutrients {
  calories: number;       // kcal
  protein: number;        // grams
  carbs: number;          // grams
  fats: number;           // grams
  vitaminA: number;       // mcg or % DV
  vitaminB: number;       // % DV (B-complex)
  vitaminC: number;       // mg
  vitaminD: number;       // mcg or % DV
  vitaminE: number;       // mg
  calcium: number;        // mg
  iron: number;           // mg
}

export interface FoodLogItem {
  id: string;
  name: string;
  grams: number;
  timestamp: string;
  nutrients: Nutrients;
  imageUrl?: string;
  isBarcodeLog?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  avatarUrl: string;
  rank: string;
  apples: number;
  progressPercentage: number; // overall goal completion for today
  vitaminProgress: number;    // vitamin-specific completion percentage
  lastActive: string;
}

export interface ActiveBattle {
  id: string;
  title: string;
  type: "1v1" | "group";
  opponentIds: string[]; // friend IDs or "group" tag
  yourScore: number;     // calculated based on speed & meal healthiness
  opponentsScore: Record<string, number>;
  daysLeft: number;
  status: "active" | "ended_won" | "ended_lost";
  prizeApples: number;
}

export interface BattleGroup {
  id: string;
  name: string;
  membersCount: number;
  description: string;
}

export interface DesignTheme {
  id: string;
  name: string;
  description: string;
  appleCost: number;
  unlocked: boolean;
  previewUrl: string;
  // CSS styling mappings for colors
  primaryClass: string;
  bgClass: string;
  cardBgClass: string;
  textClass: string;
  accentClass: string;
}

export interface WearableDeviceState {
  connected: boolean;
  lastSyncTime?: string;
  stepsToday?: number;
  syncedCalories?: number;
  syncedVitaminsCount?: number; // artificial sync of vitamin points from wearable sleep/activity tracker
}
