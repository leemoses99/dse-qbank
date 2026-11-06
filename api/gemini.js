export default async function handler(req, res) {
  // CORS Headers so your React app can make cross-origin requests
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Respond immediately to browser CORS preflight checks
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Gather environment API keys and remove any missing values
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

  // Select a random key from the pool
  const selectedKey = keys[Math.floor(Math.random() * keys.length)];

 const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${key}`;

  try {
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message || "Failed to reach Gemini servers." });
  }
}
