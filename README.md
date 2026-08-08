# THE RED COCKS website + AI concierge

## What changed

The website keeps its existing page design and motion. A fixed branded chat widget now sends messages to the server-side `/api/chat` endpoint. The browser never receives the Gemini API key. The widget preserves a short conversation context, supports English/Hindi/Hinglish/Bangla, displays a typing effect, and gives a safe fallback message when the service is unavailable.

## Deploy on Vercel (recommended)

1. Create a free account at https://vercel.com and click **Add New → Project**.
2. Upload this folder (or put it in a GitHub repository and import it). Vercel detects the static site and the `api/chat.js` serverless function.
3. Create a Google AI Studio API key at https://aistudio.google.com/app/apikey.
4. In Vercel, open the project → **Settings → Environment Variables**. Add `GEMINI_API_KEY` and paste the key. Select Production, Preview, and Development, then save.
5. Redeploy the project. Open the deployed site and test the “Ask us” button.

The account owner needs the Google key once. Website visitors never enter or see it. The default model is `gemini-3.1-flash-lite`; it has a free tier at the time this package was prepared, but usage limits and provider terms can change. If you later choose a paid model, update the `GEMINI_MODEL` environment variable—never add a key to the front-end files.

## Important

Do not deploy this API endpoint without basic platform protections on a very high-traffic public site. Vercel provides deployment safeguards; for a production marketing campaign also add a WAF/rate limit (for example Vercel Firewall or Upstash) to prevent abuse of your shared key/quota.
