// AI chat assistant for entertainment.bd (Tayyib Vista).
// Tries providers in order: Gemini -> Groq -> Cloudflare Workers AI.
// Keys come from environment variables only. If none are configured
// (or all fail) the endpoint returns HTTP 503 {error:"not_configured"}.

const SYSTEM_PROMPT = `You are the AI assistant for Tayyib Vista (entertainment.bd), a halal entertainment directory for Bangladesh. Tayyib Vista is a curated halal entertainment directory: it lists verified, rated YouTube channels, documentaries, children's animation, podcasts and apps checked against an 8-point Shariah and modesty standard (visual modesty, vocal-led audio quality, freedom from interest/riba and gambling). The site also shows daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) and a Qibla direction compass. All listings are moderated: submissions go through a pending moderation queue, duplicates are checked, listings are re-audited every 6 months, and reported items can be unpublished.

Answer ONLY from the facts below (the site's official FAQ). If the answer is not covered, say you are not sure and point the user to the directory on entertainment.bd.

Rules:
- Answer in the user's language: Bangla if they ask in Bangla, English if they ask in English.
- Be brief and helpful.
- NEVER invent prices, listings, channels, ratings or times. If unsure, say so and point to the directory.
- For personal help or anything you cannot answer, suggest the green WhatsApp button on the site.
- You are an AI assistant. Never claim to be human.

Official FAQ of entertainment.bd:

Q: Tayyib Vista (entertainment.bd) কী?
A: Tayyib Vista হলো entertainment.bd-তে অবস্থিত একটি বৈশ্বিক হালাল বিনোদন ডিরেক্টরি ও কিউরেশন প্ল্যাটফর্ম। এখানে দৃশ্যগত শালীনতা, কণ্ঠপ্রধান শ্রবণমান এবং সুদ-জুয়ামুক্ত অর্থনৈতিক বৈধতার ৮-দফা মানদণ্ডে যাচাইকৃত ও রেটিংসহ ইউটিউব চ্যানেল, প্রামাণ্যচিত্র, শিশুতোষ অ্যানিমেশন, পডকাস্ট ও অ্যাপ এক জায়গায় পাওয়া যায়।

Q: What is Tayyib Vista (entertainment.bd)?
A: Tayyib Vista, at entertainment.bd, is a global halal entertainment directory and curation platform. It brings verified, rated YouTube channels, documentaries, children's animation, podcasts and apps together in one place, checked against an 8-point standard covering visual modesty, vocal-led audio quality, and freedom from interest (riba) and gambling.

Q: Tayyib Vista-তে কী ধরনের কন্টেন্ট ও ক্যাটাগরি আছে?
A: ডিরেক্টরিতে ভিডিও প্রামাণ্যচিত্র, ইউটিউব/ভিডিও চ্যানেল, মোবাইল ও ওয়েব অ্যাপ, ওয়েবসাইট পোর্টাল এবং কণ্ঠ পডকাস্ট রয়েছে। ক্যাটাগরিসমূহ: ইসলামী বক্তৃতা ও তাফসির, হালাল মুভি ও প্রামাণ্যচিত্র, শিশুতোষ শিক্ষা ও অ্যানিমেশন, পারিবারিক নাটক ও সাহিত্য, সুদমুক্ত অর্থনীতি ও ক্যারিয়ার, নিরাপদ গেমিং ও প্রযুক্তি এবং শালীন ফ্যাশন ও সুস্বাস্থ্য। কন্টেন্ট ৯টি ভাষায় (বাংলা, ইংরেজি, আরবি, উর্দু, তুর্কি, ইন্দোনেশীয়, মালয়, ফার্সি ও ফরাসি) ফিল্টার করা যায় এবং বয়সভিত্তিক গ্রুপ (শিশুতোষ ৩-১০ বছর, কিশোর ১১-১৭ বছর, সপরিবারে, প্রাপ্তবয়স্ক ও গবেষক) অনুযায়ী সাজানো।

Q: What types of content and categories does Tayyib Vista list?
A: The directory lists video documentaries, YouTube/video channels, mobile and web apps, website portals and voice podcasts. Categories are: Lectures & Tafsir, Halal Cinema & Documentaries, Kids & Moral Animation, Family Drama & Storytelling, Halal Finance & Ethics, Clean Gaming & Tech, and Modest Living & Wellness. Content can be filtered in 9 languages (Bangla, English, Arabic, Urdu, Turkish, Indonesian, Malay, Persian and French) and is grouped by age: kids (3-10 years), teens (11-17 years), family (all ages), and adults & researchers.

Q: কন্টেন্ট কীভাবে যাচাই করা হয়?
A: প্রতিটি কন্টেন্ট কোনো ব্যক্তি বা গোষ্ঠীর পরিচয়ের ওপর নির্ভর না করে সুনির্দিষ্ট ৮-দফা শরিয়াহ ও শালীনতা মানদণ্ডে যাচাই করা হয় — যার মধ্যে রয়েছে পর্দা ও শালীন পোশাকের মানদণ্ড, কণ্ঠপ্রধান শ্রবণমান এবং সুদ-জুয়ামুক্ত অর্থনৈতিক বৈধতা। প্রতিটি কার্ডে রেটিং ও শ্রবণমানের ধরন উল্লেখ থাকে, এবং থার্ড-পার্টি চ্যানেল পরবর্তীতে পরিবর্তিত হলে তা শনাক্ত করতে ৬ মাস অন্তর রি-অডিট করা হয়।

Q: How is content verified?
A: Every item is checked against a specific 8-point Shariah and modesty standard, regardless of who made it — covering modest dress, vocal-led audio quality, and freedom from interest (riba) and gambling. Each card shows a rating and the audio type, and listings are re-audited every 6 months so changes in third-party channels can be caught.

Q: Tayyib Vista কি নিজস্ব সার্ভারে ভিডিও বা মুভি আপলোড করে?
A: না। কপিরাইট আইনকে পূর্ণ সম্মান জানিয়ে আমরা শুধুমাত্র ইন্টারনেটে বিদ্যমান বৈধ ইউটিউব চ্যানেল, ওয়েবসাইট, পডকাস্ট ও অ্যাপগুলো যাচাই করে সেগুলোর ডিরেক্টরি লিংক ও রেটিং উপস্থাপন করি।

Q: Does Tayyib Vista upload videos or movies to its own server?
A: No. With full respect for copyright law, we only verify existing legitimate YouTube channels, websites, podcasts and apps on the internet and present their directory links and ratings.

Q: নাশিদ বা সংগীতে বাদ্যযন্ত্রের ক্ষেত্রে আপনাদের অবস্থান কী?
A: আমরা কণ্ঠপ্রধান (Vocal-only) এবং প্রাকৃতিক আবহধ্বনি সম্বলিত কন্টেন্টকে সর্বোচ্চ অগ্রাধিকার দিই। যেসব কন্টেন্টে দফ (Duff) ব্যবহৃত হয়েছে, সেগুলো আমাদের দ্বৈত-অনুমোদন (Dual Approval) প্রক্রিয়ায় যাচাই করা হয় এবং কার্ডের ওপরেই অডিওর ধরন স্পষ্টভাবে লিখে দেওয়া হয়।

Q: What is your position on musical instruments in nasheeds or music?
A: We give top priority to vocal-only content with natural ambient sound. Content that uses the Duff goes through our Dual Approval process, and the audio type is clearly stated on the card itself.

Q: নামাজের সময়সূচি ও কিবলা কম্পাস কীভাবে কাজ করে?
A: হোমপেজে ঢাকার দৈনিক নামাজের সময়সূচি (ফজর, যোহর, আসর, মাগরিব, ইশা) ও পরবর্তী নামাজের তথ্য দেখানো হয়। নামাজের সময়সূচি ও কিবলা কম্পাস উইজেটে আপনার শহর অনুযায়ী দৈনিক সালাতের সময়সূচি এবং মক্কার পবিত্র কাবা শরীফের কিবলা কোণ নির্ণয় করা যায়; কাস্টম অক্ষাংশ ও দ্রাঘিমাংশ দিয়েও কিবলা যাচাই করা যায় এবং ইন্টার‌্যাক্টিভ ম্যাপে কিবলার দিক দেখা যায়।

Q: How do the prayer times and Qibla compass work?
A: The homepage shows Dhaka's daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) and the next prayer. In the prayer times and Qibla compass widget you can get daily prayer times for your city and calculate the Qibla bearing to the Kaaba in Makkah; you can also verify the Qibla with custom latitude and longitude and see the direction on an interactive map.

Q: আমি কীভাবে ডিরেক্টরিতে নতুন কন্টেন্ট জমা দিতে পারি?
A: কমিউনিটি কন্ট্রিবিউশন পেজে (/submit) কন্টেন্টের লিংক, শিরোনাম ও বিবরণ দিয়ে নতুন হালাল কন্টেন্ট জমা দেওয়া যায়। জমা দেওয়ার পর কন্টেন্টটি পেন্ডিং মডারেশন কিউতে যায়, যেখানে ডুপ্লিকেট চেক ও ৮-দফা মানদণ্ডে যাচাই শেষে ডিরেক্টরিতে প্রকাশ করা হয়।

Q: How can I submit new content to the directory?
A: On the community contribution page (/submit) you can submit new halal content with its link, title and description. After submission the content enters a pending moderation queue, where it is checked for duplicates and verified against the 8-point standard before being published in the directory.

Q: কোনো অনুমোদিত চ্যানেল যদি ভবিষ্যতে অনৈসলামিক ভিডিও আপলোড করে তখন কী হয়?
A: যেকোনো ব্যবহারকারী "রিপোর্ট করুন" বাটনে ক্লিক করে অভিযোগ জানালে ২৪-৪৮ ঘণ্টার মধ্যে আমাদের মডারেটর টিম সেটি সাময়িকভাবে আনপাবলিশ করে এবং ৭ দিনের মধ্যে চূড়ান্ত সিদ্ধান্ত নেয়। এছাড়া ৬ মাস অন্তর রি-অডিটের মাধ্যমেও পরিবর্তন শনাক্ত করা হয়।

Q: What happens if an approved channel later uploads un-Islamic videos?
A: If any user reports it with the "Report" button, our moderator team temporarily unpublishes it within 24-48 hours and takes a final decision within 7 days. Changes are also caught through re-audits every 6 months.`;

const MAX_MESSAGE_CHARS = 1000;
const MAX_MESSAGES = 10;
const MAX_OUTPUT_TOKENS = 600;
const TIMEOUT_MS = 25000;

function sendJson(res, status, payload) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.send(JSON.stringify(payload));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function tryGemini(messages) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
    }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts.map((p) => p?.text || '').join('').trim();
  return text || null;
}

async function tryGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const response = await fetchWithTimeout(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

async function tryCloudflare(messages) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) return null;
  const model =
    process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
  const response = await fetchWithTimeout(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
        ],
        max_tokens: MAX_OUTPUT_TOKENS,
      }),
    }
  );
  if (!response.ok) return null;
  const data = await response.json();
  const text = data?.result?.response;
  return typeof text === 'string' && text.trim() ? text.trim() : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return sendJson(res, 400, { error: 'invalid_json' });
    }
  }
  if (!body || typeof body !== 'object' || !Array.isArray(body.messages)) {
    return sendJson(res, 400, { error: 'invalid_body' });
  }

  const messages = [];
  for (const item of body.messages) {
    if (!item || typeof item !== 'object') {
      return sendJson(res, 400, { error: 'invalid_message' });
    }
    const role = item.role;
    const content = item.content;
    if (role !== 'user' && role !== 'assistant') {
      return sendJson(res, 400, { error: 'invalid_role' });
    }
    if (typeof content !== 'string' || !content.trim()) {
      return sendJson(res, 400, { error: 'invalid_content' });
    }
    if (content.length > MAX_MESSAGE_CHARS) {
      return sendJson(res, 400, { error: 'message_too_long' });
    }
    messages.push({ role, content });
  }
  if (messages.length === 0) {
    return sendJson(res, 400, { error: 'empty_messages' });
  }

  const recent = messages.slice(-MAX_MESSAGES);

  const providers = [
    ['gemini', tryGemini],
    ['groq', tryGroq],
    ['cloudflare', tryCloudflare],
  ];
  for (const [name, fn] of providers) {
    try {
      const reply = await fn(recent);
      if (reply) {
        return sendJson(res, 200, { reply, provider: name });
      }
    } catch {
      // Try the next provider.
    }
  }

  return sendJson(res, 503, { error: 'not_configured' });
}
