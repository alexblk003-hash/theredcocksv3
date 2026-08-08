const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_ITEMS = 8;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

const systemInstruction = `You are the friendly, concise concierge for THE RED COCKS, a Kolkata poultry and meat business. Answer in the visitor's language when possible (English, Hindi/Hinglish, or Bangla). You can help with fresh poultry/meat, hygienic packing, delivery within Kolkata, specific cuts, bulk/business enquiries, and general food questions. Do not invent prices, availability, delivery areas, hours, certifications, or order details. For anything that needs confirmation, warmly ask the visitor to contact the team. Do not provide medical, legal, or financial advice. Keep answers practical and under 120 words unless the user asks for detail.`;

function safeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY_ITEMS).flatMap((item) => {
    if (!item || typeof item.content !== 'string') return [];
    const role = item.role === 'model' ? 'model' : 'user';
    const text = item.content.trim().slice(0, MAX_MESSAGE_LENGTH);
    return text ? [{ role, parts: [{ text }] }] : [];
  });
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (!process.env.GEMINI_API_KEY) return response.status(503).json({ error: 'Chat is not configured yet. Please contact us directly.' });

  const message = typeof request.body?.message === 'string' ? request.body.message.trim().slice(0, MAX_MESSAGE_LENGTH) : '';
  if (!message) return response.status(400).json({ error: 'Please enter a message.' });

  const contents = safeHistory(request.body?.history);
  if (!contents.length || contents.at(-1).role !== 'user' || contents.at(-1).parts[0].text !== message) contents.push({ role: 'user', parts: [{ text: message }] });
  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: systemInstruction }] }, contents, generationConfig: { temperature: 0.7, maxOutputTokens: 350 } })
    });
    const payload = await geminiResponse.json();
    if (!geminiResponse.ok) {
      console.error('Gemini request failed:', geminiResponse.status, payload?.error?.message);
      return response.status(geminiResponse.status === 429 ? 429 : 502).json({ error: geminiResponse.status === 429 ? 'The assistant is busy right now. Please try again shortly.' : 'The assistant is temporarily unavailable. Please try again.' });
    }
    const reply = payload?.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('').trim();
    if (!reply) return response.status(502).json({ error: 'The assistant did not return a response. Please try again.' });
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).json({ reply });
  } catch (error) {
    console.error('Chat endpoint error:', error);
    return response.status(502).json({ error: 'Connection issue. Please try again.' });
  }
}
