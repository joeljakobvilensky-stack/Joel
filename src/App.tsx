import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, 
  QrCode, 
  Apple, 
  Heart, 
  Activity, 
  User, 
  Users, 
  CheckCircle, 
  TrendingUp, 
  Plus, 
  Search, 
  Award, 
  ShoppingBag, 
  Sliders, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  Smartphone, 
  RefreshCw, 
  Wifi, 
  Battery, 
  Compass, 
  Trash2, 
  HelpCircle, 
  Lightbulb, 
  Check, 
  Lock,
  Upload,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Nutrients, FoodLogItem, Friend, ActiveBattle, BattleGroup, DesignTheme, WearableDeviceState } from "./types";
import { 
  INITIAL_THEMES, 
  INITIAL_FRIENDS, 
  INITIAL_BATTLES, 
  INITIAL_GROUPS, 
  PRESETS_BARCODES, 
  PRESETS_FOOD_PHOTOS, 
  INTERACTIVE_HOTSPOTS 
} from "./data";

export default function App() {
  // Mobile app tabs
  type TabId = "dashboard" | "scanner" | "social" | "shop" | "goals";
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  // Dynamic Theme state
  const [themes, setThemes] = useState<DesignTheme[]>(INITIAL_THEMES);
  const [selectedThemeId, setSelectedThemeId] = useState<string>("emerald-sprout");
  const currentTheme = themes.find(t => t.id === selectedThemeId) || themes[0];

  // User Gold Balance ("unlocked by winning battles")
  const [applesCount, setApplesCount] = useState<number>(85); // Seed with enough to buy a cool theme instantly

  // User Rank and level
  const [currentRank, setCurrentRank] = useState<string>("Sprout 🌿");
  const [totalWins, setTotalWins] = useState<number>(4);

  // Wearables state
  const [wearableState, setWearableState] = useState<WearableDeviceState>({
    connected: false,
    lastSyncTime: undefined,
    stepsToday: 0,
    syncedCalories: 0,
    syncedVitaminsCount: 0
  });
  const [isSyncingWearable, setIsSyncingWearable] = useState(false);

  // Friends & Battles State
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [battles, setBattles] = useState<ActiveBattle[]>(INITIAL_BATTLES);
  const [groups, setGroups] = useState<BattleGroup[]>(INITIAL_GROUPS);

  // Input states for adding customized elements
  const [newFriendName, setNewFriendName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // High Vitamin Daily Goals (A, B-Complex, C, D, E and key macros)
  const [goals, setGoals] = useState<Nutrients>({
    calories: 2100,
    protein: 75,
    carbs: 230,
    fats: 65,
    vitaminA: 900,   // mcg RE
    vitaminB: 100,   // % DV
    vitaminC: 90,    // mg
    vitaminD: 20,    // mcg
    vitaminE: 15,    // mg
    calcium: 1000,   // mg
    iron: 18         // mg
  });

  // Logged items (populated with food seed)
  const [foodLogs, setFoodLogs] = useState<FoodLogItem[]>([
    {
      id: "seed-log-1",
      name: "Pre-Workout Berry Protein Boost",
      grams: 250,
      timestamp: "08:15 AM",
      imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=150&q=80",
      nutrients: {
        calories: 180,
        protein: 15,
        carbs: 22,
        fats: 2,
        vitaminA: 350,  // mcg
        vitaminB: 60,   // %
        vitaminC: 110,  // mg
        vitaminD: 10,   // mcg
        vitaminE: 8,    // mg
        calcium: 180,   // mg
        iron: 1.5       // mg
      }
    }
  ]);

  // Scanner state machine
  const [scannerMode, setScannerMode] = useState<"food" | "barcode">("food");
  const [gramsValue, setGramsValue] = useState<number>(150);
  const [textPrompt, setTextPrompt] = useState<string>("");
  const [manualCode, setManualCode] = useState<string>("");
  const [uploadBase64, setUploadBase64] = useState<string | null>(null);
  const [scanningStatus, setScanningStatus] = useState<"idle" | "capturing" | "analyzing" | "completed" | "error">("idle");
  const [scanResult, setScanResult] = useState<any>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Interactive Walkthrough modal/highlight
  const [activeWalkthrough, setActiveWalkthrough] = useState<boolean>(true);
  const [selectedWalkthroughHotspot, setSelectedWalkthroughHotspot] = useState<string>("vitamin-meter");

  // Clock dynamic updates
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("12:00 PM");

  useEffect(() => {
    // Keep a beautiful active mock clock running in the status bar
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const mins = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setCurrentTimeStr(`${hours}:${mins} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Show a notification
  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Automatically recalculate rank based on earned apples count
  useEffect(() => {
    let rank = "Seedling 🌱";
    if (applesCount > 400) rank = "Golden Apple 👑🍎";
    else if (applesCount > 200) rank = "Harvest Lord 🍎✨";
    else if (applesCount > 100) rank = "Blossom Knight 🌸";
    else if (applesCount > 40) rank = "Sprout 🌿";
    
    setCurrentRank(rank);
  }, [applesCount]);

  // Total nutrients calculation
  const totalLogged = foodLogs.reduce((acc, item) => {
    // Weigh values by multiplying by grams / 100g base estimation
    const factor = item.grams / 100;
    return {
      calories: acc.calories + Math.round(item.nutrients.calories * factor),
      protein: acc.protein + Math.round(item.nutrients.protein * factor),
      carbs: acc.carbs + Math.round(item.nutrients.carbs * factor),
      fats: acc.fats + Math.round(item.nutrients.fats * factor),
      vitaminA: acc.vitaminA + Math.round(item.nutrients.vitaminA * factor),
      vitaminB: acc.vitaminB + Math.round(item.nutrients.vitaminB * factor),
      vitaminC: acc.vitaminC + Math.round(item.nutrients.vitaminC * factor),
      vitaminD: acc.vitaminD + Math.round(item.nutrients.vitaminD * factor),
      vitaminE: acc.vitaminE + Math.round(item.nutrients.vitaminE * factor),
      calcium: acc.calcium + Math.round(item.nutrients.calcium * factor),
      iron: acc.iron + Math.round(item.nutrients.iron * factor)
    };
  }, {
    calories: 0, protein: 0, carbs: 0, fats: 0,
    vitaminA: 0, vitaminB: 0, vitaminC: 0, vitaminD: 0, vitaminE: 0,
    calcium: 0, iron: 0
  });

  // Calculate overall Vitamin Completion Average for goals/battles
  const vitaminACompletion = Math.min(100, (totalLogged.vitaminA / goals.vitaminA) * 100 || 0);
  const vitaminBCompletion = Math.min(100, (totalLogged.vitaminB / goals.vitaminB) * 100 || 0);
  const vitaminCCompletion = Math.min(100, (totalLogged.vitaminC / goals.vitaminC) * 100 || 0);
  const vitaminDCompletion = Math.min(100, (totalLogged.vitaminD / goals.vitaminD) * 100 || 0);
  const vitaminECompletion = Math.min(100, (totalLogged.vitaminE / goals.vitaminE) * 100 || 0);

  const averageVitaminCompletion = Math.round(
    (vitaminACompletion + vitaminBCompletion + vitaminCCompletion + vitaminDCompletion + vitaminECompletion) / 5
  );

  // Sync state into user achievements in active battles
  useEffect(() => {
    if (activeTab === "social" || activeTab === "dashboard") {
      setBattles(prev => prev.map(battle => {
        if (battle.status === "active") {
          return {
            ...battle,
            // Your battle score increases as your vitamin average and healthy food eats rise!
            yourScore: Math.min(100, Math.round(averageVitaminCompletion * 0.8 + totalLogged.protein * 0.3))
          };
        }
        return battle;
      }));
    }
  }, [averageVitaminCompletion, totalsTrigger()]);

  function totalsTrigger() {
    return totalLogged.protein + totalLogged.calories;
  }

  // File to base64 converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanningStatus("capturing");
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadBase64(reader.result as string);
      setPreviewImageUrl(reader.result as string);
      setScanningStatus("idle");
      notify(`Loaded custom photo: "${file.name}". Ready to analyze!`);
    };
    reader.readAsDataURL(file);
  };

  // Apply a preset product barcode or food photo directly
  const applyPresetBarcode = (preset: typeof PRESETS_BARCODES[0]) => {
    setPreviewImageUrl(preset.imageUrl);
    setManualCode(preset.code);
    setTextPrompt(`Barcode category: ${preset.name} brand ${preset.brand}`);
    // Simulate raw base64 mapping or use fallback trigger
    setUploadBase64("data:image/jpeg;base64,..."); 
    notify(`Loaded preset barcode scan: ${preset.name}`);
  };

  const applyPresetFoodPhoto = (preset: typeof PRESETS_FOOD_PHOTOS[0]) => {
    setPreviewImageUrl(preset.imageUrl);
    setTextPrompt(preset.prompt);
    // Simulate image input
    setUploadBase64("data:image/jpeg;base64,...");
    notify(`Loaded preset meal photo: ${preset.name}`);
  };

  // API Call handlers
  const processFoodPhotoScan = async () => {
    if (!uploadBase64 && !previewImageUrl) {
      notify("Please upload/select a food photo preset first.");
      return;
    }

    setScanningStatus("analyzing");
    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadBase64 || "PRESET", 
          textPrompt: textPrompt || `A photo resembling food, weight target: ${gramsValue} grams`
        })
      });

      const data = await response.json();
      if (data.success) {
        setScanResult(data);
        setScanningStatus("completed");
        
        // Log the food directly
        const logItem: FoodLogItem = {
          id: `scanned-${Date.now()}`,
          name: data.foodName,
          grams: gramsValue,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: previewImageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=150&q=80",
          nutrients: data.nutrients
        };
        
        setFoodLogs(prev => [logItem, ...prev]);
        setApplesCount(prev => prev + 5); // Add 5 apples for healthy photo logging
        notify(`Success! Logged ${data.foodName}. Gained 5 Apples 🍎 for scanning!`);
      } else {
        throw new Error(data.errorMsg || "Failed to analyze");
      }
    } catch (err: any) {
      console.error(err);
      setScanningStatus("error");
      notify("Oops: analysis failed, please try another preset.");
    }
  };

  // Process barcode scan
  const processBarcodeScan = async () => {
    if (!uploadBase64 && !manualCode) {
      notify("Please type a product code or select a preset barcode first.");
      return;
    }

    setScanningStatus("analyzing");
    try {
      const response = await fetch("/api/analyze-barcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: uploadBase64 || "PRESET_BARCODE",
          code: manualCode
        })
      });

      const data = await response.json();
      if (data.success) {
        setScanResult(data);
        setScanningStatus("completed");

        const logItem: FoodLogItem = {
          id: `scanned-barcode-${Date.now()}`,
          name: data.productName,
          grams: 100, // Standard serving
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          imageUrl: previewImageUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?w=150&q=80",
          isBarcodeLog: true,
          nutrients: data.nutrients
        };

        setFoodLogs(prev => [logItem, ...prev]);
        setApplesCount(prev => prev + 8); // Add 8 apples reward for barcode identification!
        notify(`Found barcode product: ${data.productName}! Logged micro-nutrients & gained 8 Apples 🍎!`);
      } else {
        throw new Error(data.errorMsg || "Scanner parse error");
      }
    } catch (err) {
      console.error(err);
      setScanningStatus("error");
      notify("Unable to scan code. Testing preset barcode works instantly!");
    }
  };

  // Simulated wearable synchronization
  const triggerWearableSync = () => {
    if (isSyncingWearable) return;
    setIsSyncingWearable(true);
    notify("Initiating automatic health data sync with wearables...");

    setTimeout(() => {
      setIsSyncingWearable(false);
      setWearableState({
        connected: true,
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        stepsToday: 7640,
        syncedCalories: 340,
        syncedVitaminsCount: 15 // Synced vitamins computed from daily metabolic activity logs
      });

      // Award matching synced vitamins to logged nutrients
      const wearableLog: FoodLogItem = {
        id: `sync-wearable-${Date.now()}`,
        name: "Synced Sports Drink & Active Metabolic Lift",
        grams: 100,
        timestamp: "Synced Live",
        imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=150&q=80",
        nutrients: {
          calories: 120,
          protein: 8,
          carbs: 25,
          fats: 0,
          vitaminA: 150,
          vitaminB: 80,
          vitaminC: 100,
          vitaminD: 25,
          vitaminE: 20,
          calcium: 150,
          iron: 1.0
        }
      };

      setFoodLogs(prev => [wearableLog, ...prev]);
      setApplesCount(prev => prev + 12); // Extra reward for healthy stats integration
      notify("Wearable dynamic synchronization completed! Logged stats + 12 Apples 🍎 added!");
    }, 2000);
  };

  // Battle simulators & actions
  const executeLaunchBattle = (battleId: string) => {
    notify("Simulating ongoing high-speed calorie and vitamin food logging with friends...");
    
    setTimeout(() => {
      // Increase your score slightly to win
      setBattles(prev => prev.map(b => {
        if (b.id === battleId) {
          const userNewScore = Math.min(100, b.yourScore + 15);
          const isWin = userNewScore >= 90;
          
          if (isWin) {
            setApplesCount(prev => prev + b.prizeApples);
            setTotalWins(prev => prev + 1);
            notify(`You won the Battle! Met your daily vitamins goals faster! Claimed ${b.prizeApples} Apples! 🍎🎉`);
            return {
              ...b,
              yourScore: userNewScore,
              status: "ended_won" as const
            };
          } else {
            notify(`Log logged food item weights to raise task values & out-speed Jessica! Current Score: ${userNewScore}`);
            return {
              ...b,
              yourScore: userNewScore
            };
          }
        }
        return b;
      }));
    }, 1000);
  };

  // Add custom friends list
  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    const newFriend: Friend = {
      id: `friend-${Date.now()}`,
      name: `${newFriendName.trim()} (Seedling)`,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150&auto=format&fit=crop&q=80`,
      rank: "Seedling 🌱",
      apples: 20,
      progressPercentage: 10 + Math.floor(Math.random() * 40),
      vitaminProgress: 5 + Math.floor(Math.random() * 40),
      lastActive: "Just added!"
    };

    setFriends(prev => [...prev, newFriend]);
    setNewFriendName("");
    notify(`Created friend link with ${newFriendName}!`);
  };

  // Create group custom battle
  const handleCreateGroupBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: BattleGroup = {
      id: `group-${Date.now()}`,
      name: newGroupName.trim(),
      membersCount: 1,
      description: "Custom vitamin health alliance group battle."
    };

    setGroups(prev => [...prev, newGroup]);
    
    // Create equivalent group active battle
    const newActiveBattle: ActiveBattle = {
      id: `battle-group-${Date.now()}`,
      title: `${newGroupName.trim()} Group Vitamin War`,
      type: "group",
      opponentIds: ["friend-1", "friend-2"],
      yourScore: 10,
      opponentsScore: {
        "friend-1": 45,
        "friend-2": 60
      },
      daysLeft: 5,
      status: "active",
      prizeApples: 45
    };

    setBattles(prev => [newActiveBattle, ...prev]);
    setNewGroupName("");
    setIsCreatingGroup(false);
    notify(`Formed group "${newGroup.name}" and started Multi-Friend Vitamin War!`);
  };

  // Buy theme implementation
  const handlePurchaseTheme = (themeId: string, cost: number) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;

    if (theme.unlocked) {
      setSelectedThemeId(themeId);
      notify(`Equipped style: "${theme.name}"!`);
      return;
    }

    if (applesCount < cost) {
      notify(`Insufficient apples! You need ${cost - applesCount} more apples. Join battles or log vitamins to earn apples faster!`);
      return;
    }

    setApplesCount(prev => prev - cost);
    setThemes(prev => prev.map(t => t.id === themeId ? { ...t, unlocked: true } : t));
    setSelectedThemeId(themeId);
    notify(`Success! Unlocked and equipped "${theme.name}" design! Apple coins remaining: ${applesCount - cost}`);
  };

  // Delete logged item helper
  const handleDeleteLogItem = (id: string) => {
    setFoodLogs(prev => prev.filter(item => item.id !== id));
    notify("Logged nutrition item deleted.");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-4 md:p-8 relative selection:bg-emerald-500 selection:text-white">
      
      {/* Background Soft Glow Bubbles */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-500/5 blur-[150px] pointer-events-none"></div>

      {/* Header Container */}
      <header className="mb-6 text-center max-w-xl z-10">
        <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full py-1 px-3 text-xs mb-3 text-amber-200">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Active Rank: <strong>{currentRank}</strong></span>
          <span className="text-slate-500">•</span>
          <span className="flex items-center gap-0.5"><Apple className="w-3 h-3 text-red-500" /> <b>{applesCount} Articles</b></span>
        </div>
        <h1 className="text-3.5xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 bg-clip-text text-transparent font-display">
          VitaQuest Companion
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          A beautifully simple, gamified vitamin & macronutrient assistant designed for all ages. Scan food or battle friends for motivative app design skins!
        </p>
      </header>

      {/* Main Container Layout: Phone Frame on the Left/Center, Info Map on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl items-start justify-center z-10">
        
        {/* PHYSICAL PHONE FRAME MODEL */}
        <section className="lg:col-span-7 xl:col-span-7 flex justify-center w-full">
          {/* External casing */}
          <div className="relative mx-auto rounded-[54px] border-[14px] border-slate-900 bg-slate-900 shadow-2xl overflow-hidden max-w-[395px] w-full transition-all duration-500">
            
            {/* Top Notch / Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-full z-40 flex items-center justify-between px-3 text-[10px] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
              <div className="w-10 h-2 bg-slate-900 rounded-full"></div>
              <span className="w-1 h-1 rounded-full bg-blue-500"></span>
            </div>

            {/* Simulated Phone Status Bar */}
            <div className="bg-slate-950 text-white text-[11px] px-8 pt-3 pb-1 flex justify-between items-center font-mono select-none">
              <span>{currentTimeStr}</span>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-slate-300" />
                <span className="text-[10px] tracking-tight">5G</span>
                <Battery className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              </div>
            </div>

            {/* PHONE INNER DYNAMIC SCREEN */}
            <div className={`w-full min-h-[690px] max-h-[690px] overflow-y-auto no-scrollbar flex flex-col text-slate-100 ${currentTheme.bgClass} transition-colors duration-500`}>
              
              {/* Dynamic Theme Banner / Top Stats mini banner */}
              <div className={`p-4 pt-3 pb-4 rounded-b-3xl bg-gradient-to-b ${currentTheme.primaryClass} shadow-md relative overflow-hidden flex flex-col gap-1`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl -mr-8 -mt-8 pointer-events-none"></div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl">🏆</span>
                    <div>
                      <h4 className="text-xs opacity-90 uppercase font-mono tracking-widest font-semibold">User Level</h4>
                      <p className="text-sm font-bold text-white drop-shadow-sm">{currentRank}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md text-white px-2.5 py-1 rounded-full border border-white/20">
                    <Apple className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300 animate-pulse" />
                    <span className="text-xs font-bold font-mono text-white">{applesCount}</span>
                  </div>
                </div>

                {/* Micro active battle prompt if any */}
                <div className="mt-2.5 pt-2 border-t border-white/15 flex justify-between items-center text-xs">
                  <span className="opacity-95 text-white/95">⚔️ Active Battle: <strong> Jessica </strong> (Day 1)</span>
                  <button 
                    onClick={() => { setActiveTab("social"); notify("Navigated to social battles panel!"); }}
                    className="text-[10px] font-bold underline text-yellow-100 hover:text-white"
                  >
                    View War
                  </button>
                </div>
              </div>

              {/* INNER CONTENT SWITCHED BY TAB */}
              <main className="p-4 flex-1 flex flex-col gap-4">
                
                {/* TOAST SYSTEM POPUP */}
                <AnimatePresence>
                  {toastMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-slate-900 border border-emerald-500/30 text-emerald-300 px-3 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg urgent z-30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>{toastMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* TAB 1: DASHBOARD CONTAINER */}
                {activeTab === "dashboard" && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Main Circular Vitamin Progress Chart */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm shadow-sm`}>
                      <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-4 h-4 text-rose-500" />
                          <h3 className="font-bold text-sm">Today's Vitamin Score</h3>
                        </div>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">{averageVitaminCompletion}% met</span>
                      </div>
                      
                      {/* Big circle + summary of goals */}
                      <div className="flex items-center justify-around py-2">
                        <div className="relative flex items-center justify-center w-24 h-24">
                          {/* Circle Background SVG */}
                          <svg className="w-full h-full transform -rotate-90">
                            <circle cx="48" cy="48" r="38" strokeWidth="6" stroke="#1e293b" fill="transparent" />
                            <circle 
                              cx="48" 
                              cy="48" 
                              r="38" 
                              strokeWidth="7" 
                              stroke={currentTheme.id === "emerald-sprout" ? "#10b981" : currentTheme.id === "cosmic-vitamin" ? "#f59e0b" : "#f97316"} 
                              fill="transparent" 
                              strokeDasharray={2 * Math.PI * 38}
                              strokeDashoffset={2 * Math.PI * 38 * (1 - averageVitaminCompletion / 100)}
                              strokeLinecap="round"
                              className="transition-all duration-700"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-bold font-display">{averageVitaminCompletion}%</span>
                            <span className="text-[9px] text-slate-400 uppercase font-mono">Vitamins</span>
                          </div>
                        </div>

                        {/* Macronutrient mini counters */}
                        <div className="flex flex-col gap-1.5 text-xs">
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-400">🔥 Calories:</span>
                            <span className="font-mono font-bold">{totalLogged.calories} / {goals.calories} kcal</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-400">🥩 Protein:</span>
                            <span className="font-mono font-bold text-blue-300">{totalLogged.protein}g / {goals.protein}g</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-400">🍌 Carbs:</span>
                            <span className="font-mono font-bold text-amber-300">{totalLogged.carbs}g / {goals.carbs}g</span>
                          </div>
                          <div className="flex justify-between gap-6">
                            <span className="text-slate-400">🥑 Fats:</span>
                            <span className="font-mono font-bold text-stone-400">{totalLogged.fats}g / {goals.fats}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Daily Suggestion Box */}
                      <div className="flex items-start gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-850 text-[11px] text-slate-300">
                        <Lightbulb className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                        <span>
                          {averageVitaminCompletion < 50 
                            ? "Your Vitamin A & C levels are low! Try capturing pictures of Spinach, Avocado eggs or Berries to log nutrients."
                            : "Splendid job! Daily vitamin scores are super high. Challenge Toby or Jessica to a 1v1 fight to multiply apples!"}
                        </span>
                      </div>
                    </div>

                    {/* MICRO-METER CHANNELS - PRIORITY ON VITAMINS */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3 backdrop-blur-sm shadow-sm`} id="vitamin-meter">
                      <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
                        <span>Daily Vitamin Priorities</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer" />
                      </h4>

                      <div className="flex flex-col gap-2.5">
                        {/* Vit A */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-amber-200">🍊 Vitamin A <span className="text-[10px] text-slate-400">(Vision & Cells)</span></span>
                            <span className="font-mono text-slate-300">{totalLogged.vitaminA} / {goals.vitaminA} mcg ({Math.round(vitaminACompletion)}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${vitaminACompletion}%` }}></div>
                          </div>
                        </div>

                        {/* Vit B */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-indigo-300">🧬 Vitamin B Complex <span className="text-[10px] text-slate-400">(Metabolic Lift)</span></span>
                            <span className="font-mono text-slate-300">{totalLogged.vitaminB} / {goals.vitaminB}% ({Math.round(vitaminBCompletion)}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-400 h-full rounded-full transition-all duration-500" style={{ width: `${vitaminBCompletion}%` }}></div>
                          </div>
                        </div>

                        {/* Vit C */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-yellow-300">🍋 Vitamin C <span className="text-[10px] text-slate-400">(Immune System)</span></span>
                            <span className="font-mono text-slate-300">{totalLogged.vitaminC} / {goals.vitaminC} mg ({Math.round(vitaminCCompletion)}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-yellow-400 h-full rounded-full transition-all duration-500" style={{ width: `${vitaminCCompletion}%` }}></div>
                          </div>
                        </div>

                        {/* Vit D */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-emerald-300">☀️ Vitamin D <span className="text-[10px] text-slate-400">(Bone Strength)</span></span>
                            <span className="font-mono text-slate-300">{totalLogged.vitaminD} / {goals.vitaminD} mcg ({Math.round(vitaminDCompletion)}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: `${vitaminDCompletion}%` }}></div>
                          </div>
                        </div>

                        {/* Vit E */}
                        <div className="flex flex-col gap-0.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-rose-300">🌰 Vitamin E <span className="text-[10px] text-slate-400">(Skin Antioxidant)</span></span>
                            <span className="font-mono text-slate-300">{totalLogged.vitaminE} / {goals.vitaminE} mg ({Math.round(vitaminECompletion)}%)</span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div className="bg-rose-400 h-full rounded-full transition-all duration-500" style={{ width: `${vitaminECompletion}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WEARABLE AUTO-SYNC CARD */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm shadow-sm`} id="wearable-sync">
                      <div className="absolute top-0 right-0 p-2">
                        <Activity className="w-5 h-5 text-emerald-400/20 animate-pulse-slow" />
                      </div>
                      
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            Automatic Integration
                          </span>
                          <h4 className="font-bold text-sm mt-1.5 flex items-center gap-1.5 text-slate-100">
                            Wearable Devices Sync
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            Simulate link to Apple Watch, Garmin or Fitbit to synchronize vitamins automatically.
                          </p>
                        </div>
                      </div>

                      {wearableState.connected ? (
                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5" /> Garmin Connect Linked
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">Last Sync: {wearableState.lastSyncTime || "Just now"}</span>
                          </div>
                          <button 
                            onClick={triggerWearableSync}
                            disabled={isSyncingWearable}
                            className={`p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 transition active:scale-95 ${isSyncingWearable ? 'animate-spin' : ''}`}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={triggerWearableSync} 
                              className="text-xs bg-slate-950 hover:bg-slate-900 text-slate-200 py-2 px-3 rounded-xl border border-slate-800 text-left flex items-center justify-between"
                            >
                              <span>⌚ Apple Health</span>
                              <Plus className="w-3 h-3 text-slate-500" />
                            </button>
                            <button 
                              onClick={triggerWearableSync} 
                              className="text-xs bg-slate-950 hover:bg-slate-900 text-slate-200 py-2 px-3 rounded-xl border border-slate-800 text-left flex items-center justify-between"
                            >
                              <span>🌱 Garmin/Fitbit</span>
                              <Plus className="w-3 h-3 text-slate-500" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RECENT FOOD LOGS ENTRY LIST */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3`}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs font-mono uppercase text-slate-400">Logged Meal Items</h4>
                        <span className="text-[10px] text-slate-500">{foodLogs.length} items logged</span>
                      </div>

                      <div className="flex flex-col gap-2 max-h-52 overflow-y-auto no-scrollbar">
                        {foodLogs.length === 0 ? (
                          <div className="text-center py-4 text-xs text-slate-500">
                            No logs for today yet. Use the scan tab below!
                          </div>
                        ) : (
                          foodLogs.map(item => (
                            <div key={item.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs gap-2">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-slate-200 truncate">{item.name}</h5>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                                  <span>⚖️ {item.grams}g</span>
                                  <span>•</span>
                                  <span className="text-emerald-400 font-semibold">💊 {Math.round((item.nutrients.vitaminC + item.nutrients.vitaminA) / 2)} micro value</span>
                                  <span>•</span>
                                  <span>{item.timestamp}</span>
                                </div>
                              </div>
                              
                              <button 
                                onClick={() => handleDeleteLogItem(item.id)}
                                className="p-1 text-slate-500 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: LOG HEALTH FOOD (SCANNER CAMERA BARCODE & PHOTO SENSOR) */}
                {activeTab === "scanner" && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Scanner Mode toggles */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                      <button 
                        onClick={() => { setScannerMode("food"); setScanningStatus("idle"); }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${scannerMode === "food" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                      >
                        <Camera className="w-3.5 h-3.5" /> Eaten Food Photo
                      </button>
                      <button 
                        onClick={() => { setScannerMode("barcode"); setScanningStatus("idle"); }}
                        className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${scannerMode === "barcode" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                        id="barcode-scanner-hotspot"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Scan Barcode
                      </button>
                    </div>

                    {/* CENTRAL INTERACTIVE VIEWFINDER */}
                    <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 min-h-[190px] flex flex-col items-center justify-center p-4">
                      
                      {previewImageUrl ? (
                        <div className="relative w-full h-44 rounded-xl overflow-hidden group">
                          <img 
                            src={previewImageUrl} 
                            alt="Camera capture target" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-xl"
                          />
                          
                          {/* Animated scan line overlay */}
                          {scanningStatus === "analyzing" && (
                            <div className="absolute inset-x-0 h-1 bg-emerald-500/80 shadow-[0_0_10px_2px_#10b981] animate-bounce top-0 pointer-events-none"></div>
                          )}

                          <button 
                            className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-950 text-white rounded-full p-1.5 text-[10px] font-semibold border border-slate-800"
                            onClick={() => { setPreviewImageUrl(""); setUploadBase64(null); setScanningStatus("idle"); }}
                          >
                            Retake 🔄
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center p-3">
                          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
                            {scannerMode === "food" ? (
                              <Camera className="w-6 h-6 text-emerald-400 animate-pulse" />
                            ) : (
                              <QrCode className="w-6 h-6 text-emerald-400 animate-pulse" />
                            )}
                          </div>
                          
                          <p className="text-xs font-semibold text-slate-300">
                            No camera photo captured
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px]">
                            {scannerMode === "food" 
                              ? "Upload a photo or choose preset healthy items below to process with Gemini."
                              : "Submit barcode numbers or trigger preset barcodes below to log instantly."}
                          </p>
                        </div>
                      )}

                      {/* File Capture / Drag Input */}
                      <div className="mt-3 flex items-center gap-2 w-full">
                        <label className="flex-1 text-center bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl py-2 px-3 text-xs font-semibold cursor-pointer text-slate-300 select-none flex items-center justify-center gap-2 transition active:scale-95">
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                          <span>Upload File / Camera</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange} 
                          />
                        </label>
                      </div>
                    </div>

                    {/* GRAMS SELECTOR OR KEYBOARD */}
                    {scannerMode === "food" ? (
                      <div className={`p-4 rounded-xl ${currentTheme.cardBgClass} border flex flex-col gap-2.5`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-300">How many GRAMS are you eating?</span>
                          <span className="font-mono text-emerald-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{gramsValue}g</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="1000" 
                          step="10"
                          value={gramsValue}
                          onChange={(e) => setGramsValue(parseInt(e.target.value))}
                          className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                          <span>10g</span>
                          <span>250g (Bowl)</span>
                          <span>500g</span>
                          <span>1000g (Salad Pack)</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`p-4 rounded-xl ${currentTheme.cardBgClass} border flex flex-col gap-2`}>
                        <label className="text-xs font-medium text-slate-300">Manual barcode or brand EAN:</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="e.g. 501234567890" 
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            className="flex-1 bg-slate-950 text-xs px-3 py-2 rounded-lg border border-slate-800 text-white font-mono"
                          />
                          <button 
                            onClick={() => { setManualCode("501234567890"); notify("Applied sample code!"); }}
                            className="bg-slate-900 border border-slate-800 px-2 py-1.5 rounded-lg text-[10px] font-mono text-slate-400 hover:text-slate-200"
                          >
                            Sample
                          </button>
                        </div>
                      </div>
                    )}

                    {/* EXECUTE ACTION BUTTON */}
                    <button
                      onClick={scannerMode === "food" ? processFoodPhotoScan : processBarcodeScan}
                      disabled={scanningStatus === "analyzing"}
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-md transition active:scale-[98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {scanningStatus === "analyzing" ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Gemini Scanning Nutrition...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{scannerMode === "food" ? "Analyze Food Image" : "Scan Barcode System"}</span>
                        </>
                      )}
                    </button>

                    {/* SAMPLE PRESETS DIRECT HOTSPOOTS - FASTER RUNS */}
                    <div className="flex flex-col gap-2">
                      <h5 className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-yellow-400" />
                        <span>Interactive Demo Presets (Instant Scanning)</span>
                      </h5>

                      {scannerMode === "food" ? (
                        <div className="grid grid-cols-2 gap-2">
                          {PRESETS_FOOD_PHOTOS.map((preset, index) => (
                            <button
                              key={index}
                              onClick={() => applyPresetFoodPhoto(preset)}
                              className="bg-slate-900/80 hover:bg-slate-900 text-left p-2 rounded-xl border border-slate-850 flex gap-2 items-center text-xs text-slate-300"
                            >
                              <img 
                                src={preset.imageUrl} 
                                alt={preset.name} 
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded object-cover"
                              />
                              <span className="truncate font-medium">{preset.name}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-1.5">
                          {PRESETS_BARCODES.map((preset, index) => (
                            <button
                              key={index}
                              onClick={() => applyPresetBarcode(preset)}
                              className="bg-slate-900/80 hover:bg-slate-900 text-left p-2 rounded-xl border border-slate-855 flex justify-between items-center text-xs text-slate-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className="opacity-75">🏷️</span>
                                <span className="font-semibold">{preset.name}</span>
                              </div>
                              <span className="font-mono text-[9px] text-slate-500">{preset.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: GAMIFIED LEADERBOARD AND BATTLES */}
                {activeTab === "social" && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Competitive Summary Banner */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" strokeWidth={2.5} />
                        <div>
                          <h4 className="text-xs font-bold font-mono">My Global Victories</h4>
                          <p className="text-[10px] text-slate-400">Winning multiplier awards more apples!</p>
                        </div>
                      </div>
                      <span className="bg-amber-400/10 text-amber-300 border border-amber-400/20 px-3 py-1 rounded-full text-xs font-extrabold font-mono font-display">
                        {totalWins} Wins 🏆
                      </span>
                    </div>

                    {/* ACTIVE BATTLES STATUS PROGRESS BAR */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3.5`}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-xs uppercase font-display tracking-wide text-slate-300">
                          Active Fitness Battles
                        </h4>
                        <span className="text-[9px] bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded font-mono">Live 🔴</span>
                      </div>

                      {battles.map((battle) => {
                        const isSingle = battle.type === "1v1";
                        // Find opponent details
                        const opponentLabel = isSingle 
                          ? (friends.find(f => f.id === battle.opponentIds[0])?.name || "Friend")
                          : `${battle.opponentIds.length} Friends`;

                        return (
                          <div key={battle.id} className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex flex-col gap-2 text-xs">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-bold text-slate-200">{battle.title}</h5>
                                <p className="text-[10px] text-slate-500">Prize: <strong className="text-yellow-400">{battle.prizeApples} apples 🍎</strong> | Time remains: {battle.daysLeft}d</p>
                              </div>
                              
                              {battle.status !== "active" ? (
                                <span className="bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded font-bold text-[10px]">
                                  Won 🏆
                                </span>
                              ) : (
                                <button
                                  onClick={() => executeLaunchBattle(battle.id)}
                                  className="bg-emerald-500 text-slate-950 font-extrabold px-2.5 py-1 rounded-lg text-[10px] hover:bg-emerald-400 transition cursor-pointer active:scale-95"
                                >
                                  Battle Step ⚡
                                </button>
                              )}
                            </div>

                            {/* Relative Progress meters */}
                            <div className="flex flex-col gap-1.5 mt-1">
                              {/* Your Speed progress */}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>You (Goals Done Speed)</span>
                                  <span className="font-bold text-emerald-400">{battle.status !== "active" ? 100 : battle.yourScore}%</span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${battle.status !== "active" ? 100 : battle.yourScore}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Opponent's metric progress */}
                              <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between text-[10px] text-slate-400">
                                  <span>Opponent ({opponentLabel})</span>
                                  <span className="font-bold text-amber-400">
                                    {isSingle ? battle.opponentsScore[battle.opponentIds[0]] : 80}%
                                  </span>
                                </div>
                                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className="bg-amber-400 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${isSingle ? battle.opponentsScore[battle.opponentIds[0]] : 80}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* SOCIAL GROUPS LIST */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3`}>
                      <div className="flex justify-between items-center">
                        <h4 className="font-display font-bold text-xs uppercase text-slate-300">My Culinary Battle Groups</h4>
                        <button 
                          onClick={() => setIsCreatingGroup(!isCreatingGroup)} 
                          className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold font-mono"
                        >
                          <Plus className="w-3 h-3" /> Create Group
                        </button>
                      </div>

                      {isCreatingGroup && (
                        <form onSubmit={handleCreateGroupBattle} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-2 mt-1">
                          <input 
                            type="text" 
                            placeholder="Enter group battle name..." 
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            className="bg-slate-900 border border-slate-850 p-2 rounded-lg text-xs"
                          />
                          <div className="flex gap-2 justify-end">
                            <button 
                              type="button" 
                              onClick={() => setIsCreatingGroup(false)}
                              className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit" 
                              className="bg-emerald-500 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-lg"
                            >
                              Launch Alliance
                            </button>
                          </div>
                        </form>
                      )}

                      <div className="flex flex-col gap-2">
                        {groups.map(g => (
                          <div key={g.id} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                            <div>
                              <h5 className="font-bold text-slate-200">{g.name}</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">{g.description}</p>
                            </div>
                            <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 shrink-0 font-mono">
                              👥 {g.membersCount} members
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FRIENDS LIST AND RANK TRACKS */}
                    <div className={`p-4 rounded-2xl ${currentTheme.cardBgClass} border flex flex-col gap-3`}>
                      <div className="flex justify-between items-center" id="battle-leaderboard">
                        <h4 className="font-display font-bold text-xs uppercase text-slate-300">Leaderboard Standings</h4>
                        <span className="text-[10px] text-slate-400 font-mono">Rankings</span>
                      </div>

                      {/* Add Friend Input Form */}
                      <form onSubmit={handleAddFriend} className="flex gap-1.5">
                        <input 
                          type="text" 
                          placeholder="Challenge a new friend name..." 
                          value={newFriendName}
                          onChange={(e) => setNewFriendName(e.target.value)}
                          className="flex-1 bg-slate-950 text-xs px-3 py-1.5 rounded-lg border border-slate-850 text-white"
                        />
                        <button 
                          type="submit" 
                          className="bg-slate-900 border border-slate-800 hover:bg-slate-850 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-200 transition shrink-0 active:scale-95"
                        >
                          Add Link
                        </button>
                      </form>

                      {/* Map friends */}
                      <div className="flex flex-col gap-2">
                        {friends.map((friend) => (
                          <div key={friend.id} className="bg-slate-950/60 p-2 rounded-xl border border-slate-850 flex items-center justify-between gap-1.5 text-xs">
                            <div className="flex items-center gap-2">
                              <img 
                                src={friend.avatarUrl} 
                                alt={friend.name} 
                                referrerPolicy="no-referrer"
                                className="w-8 h-8 rounded-full object-cover border border-slate-800 shrink-0"
                              />
                              <div>
                                <h5 className="font-bold text-slate-200 truncate max-w-[120px]">{friend.name}</h5>
                                <p className="text-[9px] text-slate-400 font-mono">Rank: {friend.rank}</p>
                              </div>
                            </div>

                            {/* Progress bars inside list */}
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold block">{friend.vitaminProgress}% goals</span>
                              <span className="text-[9px] text-slate-500 font-mono display-block">{friend.lastActive}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: THE APPFOREST DESIGN STORE (BUY NEW MOTIFS) */}
                {activeTab === "shop" && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Apples Store Header info */}
                    <div className="bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-4 rounded-xl border border-red-500/20 relative overflow-hidden">
                      <div className="absolute -right-2 -bottom-2 opacity-10">
                        <Apple className="w-24 h-24 text-red-500 fill-red-500" />
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-850 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold block">App Orchard Theme Store</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">We win battles, get apples, and customized layouts!</span>
                        </div>
                      </div>
                    </div>

                    {/* Themes list cards */}
                    <div className="flex flex-col gap-3">
                      {themes.map((theme) => {
                        const isEquipped = theme.id === selectedThemeId;
                        return (
                          <div 
                            key={theme.id} 
                            className={`p-3.5 rounded-2xl border transition-all duration-300 ${isEquipped ? 'ring-2 ring-emerald-400 border-transparent bg-slate-950' : 'bg-slate-950/70 border-slate-850'}`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <div>
                                <h4 className="font-bold text-xs font-display flex items-center gap-2 text-slate-100">
                                  <span>{theme.name}</span>
                                  {isEquipped && <span className="bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded text-[8px] uppercase tracking-wider font-mono">Active</span>}
                                </h4>
                                <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">{theme.previewUrl}</span>
                                <p className="text-[11px] text-slate-400 mt-2">
                                  {theme.description}
                                </p>
                              </div>

                              <div className="shrink-0 text-right">
                                {theme.unlocked ? (
                                  <button
                                    onClick={() => handlePurchaseTheme(theme.id, 0)}
                                    className={`py-1.5 px-3 rounded-xl font-bold text-[10px] transition cursor-pointer active:scale-95 ${isEquipped ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-default' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'}`}
                                  >
                                    {isEquipped ? "Selected" : "Equip"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handlePurchaseTheme(theme.id, theme.appleCost)}
                                    className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-200 font-bold text-[10px] flex items-center gap-1 transition active:scale-95"
                                  >
                                    <Apple className="w-3 h-3 text-red-500 fill-red-500" />
                                    <span>Buy: {theme.appleCost}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 5: PROFILE & GOAL SETTERS */}
                {activeTab === "goals" && (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    
                    {/* Goal Configuration Form */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                        <Sliders className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-bold text-xs uppercase font-mono tracking-wider">Configure Daily Goals</h4>
                      </div>

                      <div className="flex flex-col gap-3">
                        {/* Calories */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Calories target:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={goals.calories}
                              onChange={(e) => setGoals({ ...goals, calories: parseInt(e.target.value) || 2000 })}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-center"
                            />
                            <span className="text-[10px] text-slate-500">kcal</span>
                          </div>
                        </div>

                        {/* Protein */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Protein target:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={goals.protein}
                              onChange={(e) => setGoals({ ...goals, protein: parseInt(e.target.value) || 75 })}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-center"
                            />
                            <span className="text-[10px] text-slate-500">grams</span>
                          </div>
                        </div>

                        {/* Carbs */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Carbs target:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={goals.carbs}
                              onChange={(e) => setGoals({ ...goals, carbs: parseInt(e.target.value) || 200 })}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-center"
                            />
                            <span className="text-[10px] text-slate-500">grams</span>
                          </div>
                        </div>

                        {/* Vitamin A */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-amber-200 font-medium">Vitamin A goal:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={goals.vitaminA}
                              onChange={(e) => setGoals({ ...goals, vitaminA: parseInt(e.target.value) || 900 })}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-center"
                            />
                            <span className="text-[10px] text-slate-500">mcg</span>
                          </div>
                        </div>

                        {/* Vitamin C */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-yellow-300 font-medium">Vitamin C goal:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={goals.vitaminC}
                              onChange={(e) => setGoals({ ...goals, vitaminC: parseInt(e.target.value) || 90 })}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-center"
                            />
                            <span className="text-[10px] text-slate-500">mg</span>
                          </div>
                        </div>

                        {/* Vitamin D */}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-emerald-300 font-medium">Vitamin D goal:</span>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={goals.vitaminD}
                              onChange={(e) => setGoals({ ...goals, vitaminD: parseInt(e.target.value) || 20 })}
                              className="w-16 bg-slate-900 border border-slate-800 p-1 rounded font-mono text-center"
                            />
                            <span className="text-[10px] text-slate-500">mcg</span>
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => { setActiveTab("dashboard"); notify("Custom goals updated!"); }}
                        className="w-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-xl mt-2 cursor-pointer active:scale-95"
                      >
                        Save and Go Back 💾
                      </button>
                    </div>

                    {/* Wearable Connection details */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col gap-3">
                      <h4 className="font-bold text-xs uppercase font-mono text-slate-400">
                        Synchronized Integrations
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Secure connection stats via OAuth to wearable health services. Keep data synced automatically.
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                        <span className="text-xs text-slate-400">Connected to Garmin Cloud:</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-mono ${wearableState.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'}`}>
                          {wearableState.connected ? "ACTIVE" : "DISCONNECTED"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </main>

              {/* FLOATING APP BOTTOM NAVIGATION BAR */}
              <nav className="sticky bottom-0 bg-slate-950/95 border-t border-slate-850 px-3 py-2.5 flex justify-between items-center z-40 backdrop-blur-md">
                
                {/* Tab 1: Dashboard */}
                <button 
                  onClick={() => setActiveTab("dashboard")} 
                  className={`flex flex-col items-center gap-1 flex-1 relative ${activeTab === "dashboard" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-[10px]">Dashboard</span>
                  {activeTab === "dashboard" && <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />}
                </button>

                {/* Tab 2: Scanner camera */}
                <button 
                  onClick={() => setActiveTab("scanner")} 
                  className={`flex flex-col items-center gap-1 flex-1 relative ${activeTab === "scanner" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Camera className="w-5 h-5 animate-pulse-slow" />
                  <span className="text-[10px]">Log Food</span>
                  {activeTab === "scanner" && <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />}
                </button>

                {/* Tab 3: Social Battles */}
                <button 
                  onClick={() => setActiveTab("social")} 
                  className={`flex flex-col items-center gap-1 flex-1 relative ${activeTab === "social" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-[10px]">Battles</span>
                  {activeTab === "social" && <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />}
                </button>

                {/* Tab 4: Theme Shop */}
                <button 
                  onClick={() => setActiveTab("shop")} 
                  className={`flex flex-col items-center gap-1 flex-1 relative ${activeTab === "shop" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-[10px]">Shop Designs</span>
                  {activeTab === "shop" && <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />}
                </button>

                {/* Tab 5: Goals */}
                <button 
                  onClick={() => setActiveTab("goals")} 
                  className={`flex flex-col items-center gap-1 flex-1 relative ${activeTab === "goals" ? "text-emerald-400 font-bold" : "text-slate-400 hover:text-slate-200"}`}
                >
                  <Sliders className="w-5 h-5" />
                  <span className="text-[10px]">Goals</span>
                  {activeTab === "goals" && <motion.div layoutId="navIndicator" className="absolute -bottom-1 w-5 h-0.5 bg-emerald-400 rounded-full" />}
                </button>
              </nav>

            </div>
          </div>
        </section>

        {/* CLICK REGISTRY / INTERACTIVE USER GUIDE MAP */}
        <section className="col-span-1 lg:col-span-5 flex flex-col gap-4">
          
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h3 className="font-display font-extrabold text-lg text-slate-100">
                Interactive Click Hotspots Guide
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 mb-4Leading">
              The user requested to see **pictures/layouts of all places that can be clicked on** and to keep everything simple. Below is a guide revealing how to navigate the phone app layout:
            </p>

            <div className="flex flex-col gap-3.5 mt-2.5">
              {INTERACTIVE_HOTSPOTS.map((hotspot) => {
                const isActive = selectedWalkthroughHotspot === hotspot.id;
                return (
                  <button
                    key={hotspot.id}
                    onClick={() => {
                      setSelectedWalkthroughHotspot(hotspot.id);
                      setActiveTab(hotspot.tabId as TabId);
                      notify(`Interactive Hotspot: Viewport set to "${hotspot.label}"!`);
                    }}
                    className={`text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 cursor-pointer ${isActive ? 'bg-emerald-500/10 border-emerald-500/80' : 'bg-slate-950/80 border-slate-800 hover:bg-slate-950 hover:border-slate-700'}`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className={isActive ? 'text-emerald-300' : 'text-slate-200'}>
                        📍 {hotspot.label}
                      </span>
                      <span className="text-[9px] font-mono opacity-60 uppercase bg-slate-900 px-1.5 py-0.2 rounded">
                        Tab: {hotspot.tabId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {hotspot.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SIMULATED FLOW INFO PANEL */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl text-xs flex flex-col gap-3">
            <h4 className="font-bold flex items-center gap-1.5 text-slate-200 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>How are Vitamins prioritize-tracked?</span>
            </h4>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-bold shrink-0">1.</span>
                <p>
                  <strong>No Manual Typing Required:</strong> Click the "Log Food" tab, then click any of the <strong>Demo Presets</strong> (Spinach Salad, Mixed Berries, Citrus Juice). The camera simulation immediately submits base64 coordinates to Gemini to index nutrients.
                </p>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-bold shrink-0">2.</span>
                <p>
                  <strong>Set Grams Eaten:</strong> Tell the system exactly how much you are digesting. The app automatically multiplies the 100g base estimations logically.
                </p>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-bold shrink-0">3.</span>
                <p>
                  <strong>Wearables Syncing:</strong> Toggle Garmin/Fitbit sync. This auto-loads raw steps and natural micronutrient values into your daily logs.
                </p>
              </div>

              <div className="flex items-start gap-2 text-[11px] text-slate-300">
                <span className="text-emerald-400 font-bold shrink-0">4.</span>
                <p>
                  <strong>Battle and Grow:</strong> Winning a fight matches your goal speeds with friends. Gain <strong>Apples</strong> to buy the "Cosmic Space" or "Cyber Obsidian" visual skins!
                </p>
              </div>
            </div>
          </div>

        </section>

      </div>

      {/* FOOTER METRICS AND TECH BAR */}
      <footer className="mt-12 text-center text-[11px] text-slate-500 z-10 max-w-lg mx-auto flex flex-col gap-2">
        <p>
          VitaQuest Companion v1.4.0 • Built on robust Express server + Google Gemini 3.5 Models for live photo recognition.
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
          <span>Camera Access ready inside iFrame sandbox.</span>
        </div>
      </footer>
    </div>
  );
}
