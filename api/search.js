export default async function handler(req, res) {
    const { query } = req.query;
    const signalHireKey = process.env.SIGNALHIRE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Check if keys are actually loaded
    if (!signalHireKey || !geminiKey) {
        return res.status(500).json({ summary: "Error: API Keys are missing in Vercel Settings." });
    }

    try {
        // 1. Search SignalHire
        const shResponse = await fetch(`https://www.signalhire.com/api/v1/candidate/search?email=${encodeURIComponent(query)}`, {
            headers: { 'apikey': signalHireKey }
        });
        
        if (!shResponse.ok) {
            return res.status(200).json({ summary: "SignalHire Error: Check if your API key is active or if you have credits." });
        }

        const shData = await shResponse.json();

        // 2. Ask Gemini to summarize
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize this person simply: ${JSON.stringify(shData)}` }] }]
            })
        });

        const aiData = await geminiResponse.json();
        
        // Handle Gemini empty response
        const summary = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Found the person, but Gemini couldn't generate a summary.";

        res.status(200).json({ shData, summary });
        
    } catch (error) {
        res.status(200).json({ summary: "Connection Error: The app couldn't reach the data sources." });
    }
}
