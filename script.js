async function startSearch() {
    const input = document.getElementById('userInput').value;
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    document.getElementById('aiSummary').innerText = "Searching and thinking...";

    const response = await fetch(`/api/search?query=${input}`);
    const result = await response.json();

    // Fill in the card with data
    document.getElementById('resName').innerText = result.data.name || "User Found";
    document.getElementById('resEmail').innerText = result.data.email || input;
    document.getElementById('aiSummary').innerText = result.summary;
}
