export default async function handler(req, res) {
    const { query } = req.query;
    const signalHireKey = process.env.SIGNALHIRE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Check if keys exist in Vercel
    if (!signalHireKey || !geminiKey) {
        return res.status(200).json({ summary: "DEBUG ERROR: Keys are missing in Vercel settings. Check the names match exactly." });
    }

    try {
        // 2. Try SignalHire
        const shResponse = await fetch(`https://www.signalhire.com/api/v1/candidate/search?email=${encodeURIComponent(query)}`, {
            headers: { 'apikey': signalHireKey }
        });
        
        if (shResponse.status === 401) return res.status(200).json({ summary: "DEBUG ERROR: SignalHire API Key is invalid." });
        if (shResponse.status === 402) return res.status(200).json({ summary: "DEBUG ERROR: SignalHire has 0 credits." });

        const shData = await shResponse.json();

        // 3. Try Gemini
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize this contact: ${JSON.stringify(shData)}` }] }]
            })
        });

        const aiData = await geminiResponse.json();
        
        if (aiData.error) return res.status(200).json({ summary: `DEBUG AI ERROR: ${aiData.error.message}` });

        const summary = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Found data, but AI couldn't summarize.";

        res.status(200).json({ shData, summary });

    } catch (err) {
        res.status(200).json({ summary: `CRITICAL ERROR: ${err.message}` });
    }
}
