// Extend Vercel function execution timeout for high-volume multimodal processing
export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // 1. Fetch environment API keys
    const keys = [
      process.env.GEMINI_KEY_1,
      process.env.GEMINI_KEY_2,
      process.env.GEMINI_KEY_3,
    ].filter(Boolean);

    if (keys.length === 0) {
      return res.status(500).json({
        error: "No API keys configured on server environment variables.",
      });
    }

    // 2. Select a random key from the pool
    const selectedKey = keys[Math.floor(Math.random() * keys.length)];

    // 3. Gemini 3.1 Flash-Lite Endpoint
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${selectedKey}`;

    // 4. Robust Body Parsing
    let requestBody;
    if (typeof req.body === "string") {
      requestBody = req.body;
    } else if (req.body && typeof req.body === "object") {
      requestBody = JSON.stringify(req.body);
    } else {
      return res.status(400).json({ error: "Empty or invalid request body." });
    }

    // 5. Forward request to Gemini API
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: requestBody,
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    console.error("Vercel Function Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to execute serverless function.",
    });
  }
}
