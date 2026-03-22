chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "extractJob") {
    let title = document.title;
    let url = window.location.href;
    let text = document.body.innerText.substring(0, 3000); // Take first 3000 chars for analysis
    
    sendResponse({
      jobData: {
        title: title,
        url: url,
        text: text,
      }
    });
  }
});
