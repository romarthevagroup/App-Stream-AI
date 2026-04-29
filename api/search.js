export default async function handler(req, res) {
  const { query } = req.query;
  
  // This is where the app talks to your saved keys
  const signalHireKey = process.env.SIGNALHIRE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  try {
    // 1. Ask SignalHire for data
    const response = await fetch(`https://www.signalhire.com/api/v1/candidate/search?email=${query}`, {
      headers: { 'apikey': signalHireKey }
    });
    const data = await response.json();

    // 2. Use Gemini to summarize the person
    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      body: JSON.stringify({ contents: [{ parts: [{ text: `Summarize this person: ${JSON.stringify(data)}` }] }] })
    });
    const aiData = await aiResponse.json();

    res.status(200).json({ data, summary: aiData.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
}
