import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side middleware for JSON and general body limits (support base64 uploads)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize the Google Gemini GenAI SDK helper
const geminiApiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = geminiApiKey && geminiApiKey !== "MY_GEMINI_API_KEY" && geminiApiKey.trim() !== "";

let ai: GoogleGenAI | null = null;
if (isRealApiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    console.log("Google GenAI client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Google GenAI SDK client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY detected. Running in Sandbox Mock mode.");
}

// Simulated food nutrition database as fallback or lookup helper
const PRESET_NUTRITION_ITEMS = [
  {
    keywords: ["spinach", "salad", "salmon", "fish", "green"],
    name: "Spinach & Salmon Salad (Power Vitamin Blend)",
    nutrients: {
      calories: 320,
      protein: 24,
      carbs: 8,
      fats: 16,
      vitaminA: 95,   // mcg/percent
      vitaminB: 80,   // % DV
      vitaminC: 45,   // mg
      vitaminD: 70,   // mcg/percent
      vitaminE: 25,   // mg
      calcium: 120,   // mg
      iron: 4.5       // mg
    }
  },
  {
    keywords: ["smoothie", "berry", "orange", "juice", "fruit", "citrus"],
    name: "Citrus Vitamin-Blast Smoothie",
    nutrients: {
      calories: 160,
      protein: 3,
      carbs: 34,
      fats: 0.5,
      vitaminA: 65,
      vitaminB: 40,
      vitaminC: 180,
      vitaminD: 0,
      vitaminE: 15,
      calcium: 80,
      iron: 1.2
    }
  },
  {
    keywords: ["avocado", "egg", "toast", "breakfast", "bread"],
    name: "Daily Multi-Nutrient Avocado & Egg Toast",
    nutrients: {
      calories: 340,
      protein: 14,
      carbs: 24,
      fats: 18,
      vitaminA: 20,
      vitaminB: 55,
      vitaminC: 12,
      vitaminD: 35,
      vitaminE: 20,
      calcium: 60,
      iron: 2.8
    }
  },
  {
    keywords: ["curry", "chicken", "veggie", "rice", "dinner"],
    name: "Golden Veggie & Chicken Harvest Curry",
    nutrients: {
      calories: 420,
      protein: 26,
      carbs: 45,
      fats: 12,
      vitaminA: 110,
      vitaminB: 65,
      vitaminC: 55,
      vitaminD: 10,
      vitaminE: 18,
      calcium: 90,
      iron: 3.5
    }
  },
  {
    keywords: ["barcode", "snack", "bar", "protein bar", "chocolate"],
    name: "VitaBar Protein & Vitamin Snack",
    nutrients: {
      calories: 210,
      protein: 12,
      carbs: 22,
      fats: 6,
      vitaminA: 45,
      vitaminB: 120,
      vitaminC: 60,
      vitaminD: 50,
      vitaminE: 40,
      calcium: 150,
      iron: 4.0
    }
  }
];

// Helper to provide a randomized mock product for tests
function getRandomMockItem(promptText?: string): typeof PRESET_NUTRITION_ITEMS[0] {
  const query = (promptText || "").toLowerCase();
  
  // Try to find matching preset
  for (const preset of PRESET_NUTRITION_ITEMS) {
    if (preset.keywords.some(k => query.includes(k))) {
      return preset;
    }
  }
  
  // Default fallback items
  const defaultItems = [
    {
      keywords: [] as string[],
      name: "Sunny Garden Summer Bowl",
      nutrients: {
        calories: 190,
        protein: 4,
        carbs: 28,
        fats: 5,
        vitaminA: 120,
        vitaminB: 35,
        vitaminC: 90,
        vitaminD: 15,
        vitaminE: 30,
        calcium: 75,
        iron: 2.2
      }
    },
    {
      keywords: [] as string[],
      name: "High-Potency Vitamin Replenisher (Liquid)",
      nutrients: {
        calories: 45,
        protein: 0,
        carbs: 10,
        fats: 0,
        vitaminA: 150,
        vitaminB: 200,
        vitaminC: 250,
        vitaminD: 80,
        vitaminE: 100,
        calcium: 110,
        iron: 0.5
      }
    }
  ];
  return defaultItems[Math.floor(Math.random() * defaultItems.length)];
}

// API Routes FIRST

// Endpoint 1: Health status ping
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    geminiSupported: isRealApiKey,
    time: new Date().toISOString()
  });
});

// Endpoint 2: Analyze food photos via Gemini API
app.post("/api/analyze-food", async (req, res) => {
  try {
    const { image, textPrompt } = req.body;
    
    // Check for base64 source image
    if (!image) {
      return res.status(400).json({ error: "Missing required product photo data." });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    // If API is not configured or fails, use intelligent mockup response
    if (!ai) {
      console.log("Mock Mode: Simulating Gemini analysis for food image upload...");
      const mockResult = getRandomMockItem(textPrompt || "assorted health food");
      // Add slight variance to look realistic
      const modifier = 0.9 + Math.random() * 0.2;
      const nutrients = { ...mockResult.nutrients };
      Object.keys(nutrients).forEach((k) => {
        const val = nutrients[k as keyof typeof nutrients];
        nutrients[k as keyof typeof nutrients] = Math.round(val * modifier * 10) / 10;
      });
      
      // Delay to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({
        success: true,
        isMocked: true,
        foodName: mockResult.name,
        nutrients
      });
    }

    // Call the genuine Gemini API model 'gemini-3.5-flash'
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64,
      }
    };

    const textPart = {
      text: `You are an expert nutritional scanner for a mobile application prioritizing vitamins. 
Analyze this food photograph. Estimate its identity and nutritional details per 100 grams.
Focus strongly on vitamins (A, B, C, D, E) and standard macros (Calories, Protein, Carbs, Fats, Calcium, Iron).

The prompt the user specified is: "${textPrompt || 'Estimate values for this meal'}".
Return the results in the requested JSON structure.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foodName: { 
              type: Type.STRING, 
              description: "A friendly, descriptive name for the scanned meal or food item" 
            },
            nutrients: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER, description: "Calories per 100g (kcal)" },
                protein: { type: Type.NUMBER, description: "Protein per 100g (g)" },
                carbs: { type: Type.NUMBER, description: "Carbs per 100g (g)" },
                fats: { type: Type.NUMBER, description: "Total fats per 100g (g)" },
                vitaminA: { type: Type.NUMBER, description: "Vitamin A per 100g (% DV or mcg RE)" },
                vitaminB: { type: Type.NUMBER, description: "B-Complex/Riboflavin/Thiamine/B12 per 100g (% Daily Value)" },
                vitaminC: { type: Type.NUMBER, description: "Vitamin C per 100g (mg)" },
                vitaminD: { type: Type.NUMBER, description: "Vitamin D per 100g (% DV or mcg)" },
                vitaminE: { type: Type.NUMBER, description: "Vitamin E per 100g (mg)" },
                calcium: { type: Type.NUMBER, description: "Calcium per 100g (mg)" },
                iron: { type: Type.NUMBER, description: "Iron per 100g (mg)" }
              },
              required: [
                "calories", "protein", "carbs", "fats", 
                "vitaminA", "vitaminB", "vitaminC", "vitaminD", "vitaminE",
                "calcium", "iron"
              ]
            }
          },
          required: ["foodName", "nutrients"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response string from Gemini API");
    }

    const parsedResult = JSON.parse(textOutput.trim());
    return res.json({
      success: true,
      isMocked: false,
      foodName: parsedResult.foodName || "Scanned Meals Mix",
      nutrients: parsedResult.nutrients
    });

  } catch (error: any) {
    console.error("Error in /api/analyze-food:", error);
    // Graceful fallback on genuine API failure
    const mockResult = getRandomMockItem(req.body.textPrompt || "error recovery");
    return res.json({
      success: true,
      isMocked: true,
      errorMsg: error.message,
      foodName: `Simulated: ${mockResult.name} (API Guard)`,
      nutrients: mockResult.nutrients
    });
  }
});

// Endpoint 3: Scan barcodes via image recognition (Gemini API)
app.post("/api/analyze-barcode", async (req, res) => {
  try {
    const { image, code } = req.body;

    // Fast mock for typed/manual codes
    if (!image && code) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockResult = getRandomMockItem("barcode " + code);
      return res.json({
        success: true,
        isMocked: true,
        productName: `Product ID-${code}`,
        nutrients: mockResult.nutrients
      });
    }

    if (!image) {
      return res.status(400).json({ error: "Missing barcode photograph or code." });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");

    if (!ai) {
      console.log("Mock Mode: Analyzing barcode image...");
      const mockResult = getRandomMockItem("barcode pack");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return res.json({
        success: true,
        isMocked: true,
        productName: `${mockResult.name} (Barcode Scanned)`,
        nutrients: mockResult.nutrients
      });
    }

    // Call Genuine Gemini API to detect barcode information and return details
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: cleanBase64
      }
    };

    const textPart = {
      text: `Observe this barcode photograph. Identify the product name if possible, and extract or estimate the nutritional facts per 100g. 
Special priority MUST be given to vitamins (Vitamin A, B-complex, Vitamin C, Vitamin D, Vitamin E). Ensure exact nutrients array is generated.`
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING, description: "Real product brand or generic description matching barcode item" },
            nutrients: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER },
                vitaminA: { type: Type.NUMBER },
                vitaminB: { type: Type.NUMBER },
                vitaminC: { type: Type.NUMBER },
                vitaminD: { type: Type.NUMBER },
                vitaminE: { type: Type.NUMBER },
                calcium: { type: Type.NUMBER },
                iron: { type: Type.NUMBER }
              },
              required: [
                "calories", "protein", "carbs", "fats", 
                "vitaminA", "vitaminB", "vitaminC", "vitaminD", "vitaminE",
                "calcium", "iron"
              ]
            }
          },
          required: ["productName", "nutrients"]
        }
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("No response text from Gemini barcode scanning");
    }

    const parsedResult = JSON.parse(textOutput.trim());
    return res.json({
      success: true,
      isMocked: false,
      productName: parsedResult.productName || "Product (Barcode EAN)",
      nutrients: parsedResult.nutrients
    });

  } catch (error: any) {
    console.error("Error in /api/analyze-barcode:", error);
    const mockResult = getRandomMockItem("generic barcode");
    return res.json({
      success: true,
      isMocked: true,
      errorMsg: error.message,
      productName: `Simulated: ${mockResult.name} (Barcode)`,
      nutrients: mockResult.nutrients
    });
  }
});

// Configure Vite or Serve static assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted for local UI development.");
  } else {
    // Production build delivery
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Vitamin Tracker & Battle Server running on URL: http://localhost:${PORT}`);
  });
}

startServer();
