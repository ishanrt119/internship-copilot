document.getElementById('saveBtn').addEventListener('click', async () => {
  const status = document.getElementById('status');
  status.textContent = "Scanning page...";
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {action: "extractJob"}, async function(response) {
      if(response && response.jobData) {
        status.textContent = "Saving to Copilot...";
        try {
          const addRes = await fetch("http://localhost:3000/api/extension/save", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(response.jobData)
          });
          if(addRes.ok) {
            status.textContent = "Job Saved ✅";
          } else {
            status.textContent = "Failed to save.";
          }
        } catch(e) {
          status.textContent = "Error connecting to app.";
        }
      } else {
        status.textContent = "No job data found.";
      }
    });
  });
});
