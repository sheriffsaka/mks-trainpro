import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-01-27" as any })
  : null;

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `
You are the Thames Support UK AI Assistant. Your goal is to help potential students and corporate clients find the right training courses.
Thames Support UK provides accredited training in:
1. Health and Social Care (Level 2, 3, 4, 5 Diplomas, Mandatory Training)
2. SIA Training (Door Supervisor, Security Guarding, CCTV, Top-up)
3. Functional Skills (English and Maths Level 1 & 2)

Key Brand Values: Professional, Enterprise-grade, Scalable, Secure, Trustworthy.
Brand Colors: Navy Blue (#003366) and Red (#E31E24).

Pricing Strategy:
- Standard Package: Full course access + Digital certificate.
- Platinum Package: Priority support + Hardcopy certificate + Career guidance + CV review + Free retake.
- Installment options available (Deposit + Balance).

Corporate Solutions:
- Bulk enrollment for teams.
- Centralized management dashboard.
- Performance analytics.

Guidelines:
- Be professional, helpful, and concise.
- If asked about specific course details, mention the Standard and Platinum options.
- Encourage users to view the "Courses" page for the full catalog.
- For corporate inquiries, suggest visiting the "Corporate" page or requesting a demo.
- Do not provide legal or medical advice.
- If you don't know something, suggest contacting human support at info@thamessupport.com.
`;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API Routes ---

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Gemini Chat Route
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model,
        contents: [
          ...history,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Server Error:", error);
      res.status(500).json({ error: "Failed to generate response" });
    }
  });

  // Stripe Checkout Session
  app.post("/api/payments/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { courseId, packageType, isInstallment, userId, userEmail } = req.body;
      
      // Fetch course details from DB
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError || !course) {
        return res.status(404).json({ error: "Course not found" });
      }

      const amount = packageType === 'platinum' ? course.price_platinum : course.price_standard;
      const depositAmount = course.deposit_amount || 50;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: `Thames Support: ${course.title} (${packageType} Package)`,
                description: isInstallment ? "Deposit Payment" : "Full Course Payment",
              },
              unit_amount: (isInstallment ? depositAmount : amount) * 100, // convert to pence
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/courses/${course.slug}`,
        customer_email: userEmail,
        metadata: {
          courseId,
          packageType,
          isInstallment: isInstallment.toString(),
          userId,
        },
      });

      res.json({ id: session.id });
    } catch (error: any) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Webhook handling
  app.post("/api/payments/webhook", express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    // Verification logic would go here with webhook secret
    res.json({ received: true });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
