// STEP SWITCHING
function showStep(stepId) {
  document.getElementById("step-input").classList.add("hidden");
  document.getElementById("step1").classList.add("hidden");
  document.getElementById("step2").classList.add("hidden");
  document.getElementById("step3").classList.add("hidden");

  document.getElementById(stepId).classList.remove("hidden");
}


// FETCH AI RESPONSE
async function fetchReply(productName, productDesc, targetMarket) {
  const url = '/.netlify/functions/fetchAI';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, productDesc, targetMarket })
    });

    const text = await response.text();
    console.log("RAW FUNCTION RESPONSE:", text);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = JSON.parse(text);
    return data.reply;
  } catch (error) {
    console.error("Fetch API Error:", error);
    alert("Error generating ad copy. Check console.");
    throw error;
  }
}


// FETCH COMPETITORS
async function fetchCompetitors(productName, productDesc, targetMarket) {
  const url = '/.netlify/functions/fetchCompetitors';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName, productDesc, targetMarket })
    });

    const text = await response.text();
    console.log("COMPETITOR RESPONSE:", text);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const data = JSON.parse(text);

    return data.results
      .split("\n")
      .filter(item => item.trim() !== "")
      .map(item => `<li>${item}</li>`)
      .join("");

  } catch (error) {
    console.error("Fetch Competitors Error:", error);
    alert("Error fetching competitors.");
    throw error;
  }
}


// GENERATE BUTTON
document.getElementById("generate-btn").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const desc = document.getElementById("desc").value;
  const target = document.getElementById("target").value;

  if (!name || !desc || !target) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    const adCopy = await fetchReply(name, desc, target);
    const competitors = await fetchCompetitors(name, desc, target);

    // Populate Step 1
    document.getElementById("ad-text").innerText = adCopy;

    // Save competitors for Step 2
    window._competitorsHTML = competitors;

    showStep("step1");

  } catch (error) {
    console.error("Generate Error:", error);
  }
});


// NAVIGATION BUTTONS
document.getElementById("to-step2").addEventListener("click", () => {
  document.getElementById("step2").classList.remove("hidden");
  document.getElementById("step1").classList.add("hidden");

  document.getElementById("competitor-list").innerHTML = window._competitorsHTML;
});

document.getElementById("to-step3").addEventListener("click", () => {
  showStep("step3");
});

document.getElementById("back-to-step1").addEventListener("click", () => {
  showStep("step1");
});


// COPY BUTTON
document.getElementById("copy-btn").addEventListener("click", () => {
  const text = document.getElementById("ad-text").innerText;
  navigator.clipboard.writeText(text);

  alert("Copied!");
});


// RESET APP
document.getElementById("again-btn").addEventListener("click", () => {
  location.reload();
});
