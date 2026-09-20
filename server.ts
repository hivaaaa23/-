import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS and handle preflight requests for all endpoints
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// 1. Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "HardwareLab" });
});

// Explicit static serving for 3D models with correct MIME types and CORS
app.use("/3d-models", express.static(path.join(process.cwd(), "public", "3d-models"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (filePath.endsWith(".glb")) {
      res.setHeader("Content-Type", "model/gltf-binary");
    }
  }
}));

// Route fallback for any root-level .glb requests (e.g. /motherboard.glb -> public/3d-models/motherboard.glb)
app.get("/:filename.glb", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const modelInSubdir = path.join(process.cwd(), "public", "3d-models", `${req.params.filename}.glb`);
  if (fs.existsSync(modelInSubdir)) {
    res.setHeader("Content-Type", "model/gltf-binary");
    return res.sendFile(modelInSubdir);
  }
  const modelInRoot = path.join(process.cwd(), "public", `${req.params.filename}.glb`);
  if (fs.existsSync(modelInRoot)) {
    res.setHeader("Content-Type", "model/gltf-binary");
    return res.sendFile(modelInRoot);
  }
  // Return a 404 JSON/text instead of letting Vite SPA fallback serve index.html
  res.status(404).type("text/plain").send("3D Model not found");
});

// Explicit routes for workshop, parts, and part-detail HTML pages
app.get("/parts.html", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "parts.html"));
});

app.get("/part-detail.html", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "part-detail.html"));
});

app.get("/workshop.html", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "workshop.html"));
});

app.get("/assembly.html", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "assembly.html"));
});

app.get("/annotations.css", (req, res) => {
  res.type("text/css").sendFile(path.join(process.cwd(), "public", "annotations.css"));
});

// Static serving for data directory with JSON Content-Type and CORS
app.use("/data", express.static(path.join(process.cwd(), "public", "data"), {
  setHeaders: (res, filePath) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    if (filePath.endsWith(".json")) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
    }
  }
}));

// Assembly steps data endpoint
app.get(["/data/assembly-steps.json", "/api/assembly-steps", "/api/assembly-steps.json"], (req, res) => {
  try {
    const stepsPath = path.join(process.cwd(), "public", "data", "assembly-steps.json");
    const altStepsPath = path.join(process.cwd(), "data", "assembly-steps.json");
    const targetPath = fs.existsSync(stepsPath) ? stepsPath : altStepsPath;
    if (fs.existsSync(targetPath)) {
      const data = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    }
    return res.status(404).json({ error: "assembly-steps.json not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Parts data endpoint
app.get(["/data/parts.json", "/api/parts", "/api/parts.json"], (req, res) => {
  try {
    const partsPath = path.join(process.cwd(), "public", "data", "parts.json");
    if (fs.existsSync(partsPath)) {
      const data = JSON.parse(fs.readFileSync(partsPath, "utf-8"));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    }
    return res.status(404).json({ error: "parts.json not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Workshop parts data endpoint
app.get(["/data/workshop-parts.json", "/api/workshop-parts", "/api/workshop-parts.json"], (req, res) => {
  try {
    const wpPath = path.join(process.cwd(), "public", "data", "workshop-parts.json");
    if (fs.existsSync(wpPath)) {
      const data = JSON.parse(fs.readFileSync(wpPath, "utf-8"));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    }
    return res.status(404).json({ error: "workshop-parts.json not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Troubleshooting flowcharts data endpoint
app.get(["/data/troubleshooting.json", "/api/troubleshooting", "/api/troubleshooting.json"], (req, res) => {
  try {
    const tPath = path.join(process.cwd(), "public", "data", "troubleshooting.json");
    const altPath = path.join(process.cwd(), "data", "troubleshooting.json");
    const targetPath = fs.existsSync(tPath) ? tPath : altPath;
    if (fs.existsSync(targetPath)) {
      const data = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    }
    return res.status(404).json({ error: "troubleshooting.json not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// BIOS beep codes data endpoint
app.get(["/data/beep-codes.json", "/api/beep-codes", "/api/beep-codes.json"], (req, res) => {
  try {
    const bPath = path.join(process.cwd(), "public", "data", "beep-codes.json");
    const altPath = path.join(process.cwd(), "data", "beep-codes.json");
    const targetPath = fs.existsSync(bPath) ? bPath : altPath;
    if (fs.existsSync(targetPath)) {
      const data = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    }
    return res.status(404).json({ error: "beep-codes.json not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Quizzes data endpoint
app.get(["/data/quizzes.json", "/api/quizzes", "/api/quizzes.json"], (req, res) => {
  try {
    const qPath = path.join(process.cwd(), "public", "data", "quizzes.json");
    const altPath = path.join(process.cwd(), "data", "quizzes.json");
    const targetPath = fs.existsSync(qPath) ? qPath : altPath;
    if (fs.existsSync(targetPath)) {
      const data = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Access-Control-Allow-Origin", "*");
      return res.json(data);
    }
    return res.status(404).json({ error: "quizzes.json not found" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Persian hardware educational AI chat endpoint
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const systemInstruction = `شما دستیار هوشمند و متخصص آموزش سخت‌افزار کامپیوتر در پروژه HardwareLab (آزمایشگاه سخت‌افزار) برای دانش‌آموزان هنرستان فنی و حرفه‌ای هستید.
وظیفه شما پاسخگویی دقیق، دلسوزانه، آموزشی و مرحله‌به‌مرحله به زبان فارسی روان است.
اطلاعات کلیدی که بر آن‌ها تسلط دارید:
۱. قطعات سخت‌افزار: مادربرد (ASUS Prime H510M-K)، پردازنده (Intel Core i5 LGA 1200)، حافظه رم (DDR4 3200)، کارت گرافیک (PCIe x16)، پاور، حافظه M.2 NVMe SSD، کولر بادی، کیس.
۲. مراحل ۱۵ گانه سرهم‌بندی (مونتاژ کیس، نصب مادربرد، نصب پردازنده، خمیر سیلیکون، نصب خنک‌کننده، نصب رم، نصب پاور، کابل‌های پنل جلویی، کارت گرافیک، کابل‌های برق، اولین بوت، بررسی بایوس).
۳. نکات ایمنی: استفاده از مچ‌بند ضد الکتریسیته ساکن، جدا کردن دوشاخه برق، آسیب‌پذیری پین‌های سوکت CPU، قفل شدن ضامن‌های رم، پیچ‌های برنجی اسپیسر کیس.
۴. کدهای بوق BIOS و عیب‌یابی:
   - 1-1-2-3: خطای حافظه (مشکل در نصب یا خرابی رم)
   - 1-1-3-3: خطای کارت گرافیک (عدم شناسایی کارت گرافیک یا کابل تصویر)
   - 1-3-1-3: خطای CPU (مشکل در پردازنده یا کابل ۸ پین برق)
   - 1-3-3-1: خطای مادربرد (مشکل در بایوس یا باتری CMOS)
همیشه پاسخ‌ها را منسجم، با شماره‌گذاری یا بولت‌پوینت‌های آموزشی و لحن انگیزشی و علمی ارائه دهید.`;

  try {
    const ai = getAI();
    if (ai) {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini request timeout")), 3500)
      );
      const apiPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          { role: "user", parts: [{ text: `${systemInstruction}\n\nپرسش کاربر: ${message}` }] }
        ]
      });
      const response: any = await Promise.race([apiPromise, timeoutPromise]);
      if (response && response.text) {
        return res.json({ reply: response.text });
      }
    }
  } catch (error: any) {
    console.warn("Gemini API call failed or key not configured, falling back to local hardware engine:", error.message);
  }

  // Smart local fallback engine tailored to Iranian vocational computer hardware curriculum
  const lower = (message || "").toLowerCase();
  let reply = "";

  if (lower.includes("رم") || lower.includes("ram")) {
    reply = "📌 **نکات کلیدی حافظه رم (RAM):**\n" +
      "۱. در مادربرد ASUS Prime H510M-K از حافظه‌های DDR4 با فرکانس کاری تا ۳۲۰۰ مگاهرتز پشتیبانی می‌شود.\n" +
      "۲. شیار وسط رم (Key Notch) نامتقارن است؛ قبل از جا زدن جهت را با شیار داخل اسلات مادربرد چک کنید.\n" +
      "۳. ضامن‌های دوطرف اسلات را کاملاً باز کرده، ماژول را عمودی قرار دهید و با دو انگشت دو سمت آن را فشار دهید تا صدای کلیک قفل شدن به گوش برسد.\n" +
      "⚠️ کد بوق ۱-۱-۲-۳ نشانه عدم شناسایی یا جا نخوردن درست رم است.";
  } else if (lower.includes("پردازنده") || lower.includes("cpu") || lower.includes("سی پی یو")) {
    reply = "📌 **راهنمای نصب پردازنده (CPU):**\n" +
      "۱. اهرم ضامن فلزی سوکت LGA 1200 را به بیرون و بالا بکشید تا درپوش سوکت باز شود.\n" +
      "۲. مثلث طلایی کوچک در گوشه پردازنده را با نشانگر روی سوکت هماهنگ کنید.\n" +
      "۳. پردازنده را با لبه‌ها گرفته و بدون هیچ فشاری روی پین‌ها بنشانید.\n" +
      "۴. اهرم را پایین آورده و قفل کنید (درپوش محافظ مشکی پلاستیکی خودبه‌خود خارج می‌شود).";
  } else if (lower.includes("بوق") || lower.includes("بایوس") || lower.includes("beep") || lower.includes("bios")) {
    reply = "🔊 **جدول کدهای بوق بایوس (BIOS Beep Codes):**\n" +
      "• **۱-۱-۲-۳**: خطای حافظه رم — تمیز کردن پایه‌های رم با پاک‌کن و جا زدن مجدد.\n" +
      "• **۱-۱-۳-۳**: خطای کارت گرافیک — بررسی کابل برق ۸ پین و اطمینان از قفل شدن شیار PCIe.\n" +
      "• **۱-۳-۱-۳**: خطای CPU — بررسی اتصال کابل ۴ یا ۸ پین برق پردازنده و فن خنک‌کننده.\n" +
      "• **۱-۳-۳-۱**: خطای مادربرد — ریست کردن تنظیمات بایوس با درآوردن باتری سکه‌ای CMOS برای ۵ دقیقه.";
  } else if (lower.includes("تصویر") || lower.includes("مانیتور") || lower.includes("صفحه سیاه")) {
    reply = "🖥️ **عیب‌یابی عدم نمایش تصویر:**\n" +
      "۱. بررسی کنید کابل HDMI یا DP به پشت کارت گرافیک مجزا وصل شده باشد نه به پورت خروجی مادربرد.\n" +
      "۲. کابل برق ۸ پین کارت گرافیک محکم در جای خود قفل شده باشد.\n" +
      "۳. رم‌ها را خارج کرده و هر کدام را تک‌تک در اسلات دیگر تست کنید.\n" +
      "۴. مطمئن شوید مانیتور روشن و منبع ورودی (Input Source) درست انتخاب شده باشد.";
  } else if (lower.includes("پاور") || lower.includes("روشن") || lower.includes("برق")) {
    reply = "⚡ **بررسی مدار تغذیه و روشن نشدن سیستم:**\n" +
      "۱. بررسی کابل دوشاخه برق و کلید صفر/یک (I/O) پشت منبع تغذیه.\n" +
      "۲. بررسی کابل‌های متصل به مادربرد: کانکتور اصلی ۲۴ پین و کابل برق پردازنده (۸ پین EPS).\n" +
      "۳. اطمینان از اتصال صحیح سیم‌های کلید پاور پنل جلو (Power SW) به هدرهای مادربرد طبق دفترچه راهنما.";
  } else {
    reply = `سلام دوست عزیز! من دستیار هوشمند آزمایشگاه سخت‌افزار هستم.
می‌توانم در موارد زیر راهنمایی‌تان کنم:
• معرفی مشخصات فنی و استانداردهای قطعات (مادربرد، CPU، RAM، GPU، پاور، SSD)
• راهنمای قدم‌به‌قدم ۱۵ مرحله مونتاژ ایمن کامپیوتر
• تشخیص علت خرابی، رفع مشکل عدم نمایش تصویر و تحلیل کدهای بوق بایوس
• پاسخ به سوالات آزمون‌های هنرستان

درباره کدام بخش یا قطعه سوالی دارید؟`;
  }

  return res.json({ reply });
});

// Vite middleware for development vs static build in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`HardwareLab Server running on port ${PORT}`);
  });
}

startServer();
