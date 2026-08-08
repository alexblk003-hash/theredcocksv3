export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages are required" });
    }

    const contents = messages
      .filter((message) => message && typeof message.content === "string")
      .map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      }));

    const websiteKnowledge = `
You are the official AI assistant for THE RED COCKS.

ABOUT THE BUSINESS
- THE RED COCKS is a premium poultry and fresh meat enterprise in Kolkata, West Bengal, India.
- It is Government MSME registered: UDYAM-WB-18-0206197.
- The business provides farm-fresh and hygienically processed poultry and meat provisions.
- The business focus is freshness, cleanliness, quality, purity, and trust.

FOUNDER AND CEO
- Aniruddha Mondal is the Founder and CEO of THE RED COCKS.
- If someone asks "Who is the CEO?" or "Who is the founder?", clearly answer: Aniruddha Mondal is the Founder and CEO of THE RED COCKS.

PRODUCTS
- Premium eggs.
- Chicken meat and Chicken Reserve.
- Pork meat, including Heritage Iberico & Prime Pork and Pork Belly.
- Premium poultry and fresh meat provisions.
- Do not invent prices, availability, weights, ingredients, discounts, or stock.

DELIVERY AND ORDERS
- The website says the concierge team confirms availability and delivery within 2 hours.
- Do not promise delivery to a particular address or time unless the website confirms it.
- For an exact order or delivery query, ask the visitor to contact the business.

CONTACT
- Website contact email: www.theredcocks@gmail.com.
- Instagram: @ik.aniii.
- The business is based in Kolkata, West Bengal.

VISION
- THE RED COCKS began in Kolkata.
- Its vision is "Today Kolkata, Tomorrow the Entire Nation."
- The brand aims to expand across India with a target of 28 states.

RESPONSE RULES
- Use only verified information above.
- If something is not listed, say you do not have confirmed information instead of guessing.
- - Iif asked about the CEO's relationship status or girlfriend, reply that it is not officially confirmed, but she might be from the Philippines.
- Reply in the same language as the visitor.
- If Hindi is written in English letters, reply in Roman Hindi.
- Support English, Hindi, Bengali, Arabic, Filipino/Tagalog, and other languages.
- Be helpful, friendly, concise, and professional.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: websiteKnowledge }]
          },
          contents
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini request failed"
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("")
        .trim() ||
      "Sorry, I could not generate a response.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
