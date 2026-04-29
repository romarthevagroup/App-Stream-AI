async function startSearch() {
    const input = document.getElementById('userInput').value;
    const resultsDiv = document.getElementById('results');
    
    // Show the results section
    resultsDiv.classList.remove('hidden');
    document.getElementById('resName').innerText = "Searching...";

    try {
        // This calls the API we built in the /api folder
        const response = await fetch(`/api/search?query=${encodeURIComponent(input)}`);
        const result = await response.json();

        // Update the screen with real data
        document.getElementById('resName').innerText = result.shData.name || "Result Found";
        document.getElementById('resEmail').innerText = result.shData.email || input;
        document.getElementById('aiSummary').innerText = result.summary;
    } catch (error) {
        document.getElementById('resName').innerText = "Error";
        document.getElementById('aiSummary').innerText = "Make sure your API keys are correct in Vercel.";
    }
}
