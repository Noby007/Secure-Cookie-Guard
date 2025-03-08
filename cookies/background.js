// Set up side panel behavior on installation
chrome.runtime.onInstalled.addListener(() => {
    if (chrome.sidePanel) {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
            .then(() => console.log("Side panel behavior set successfully."))
            .catch((error) => console.error("Error setting panel behavior:", error));
    } else {
        console.warn("⚠️ chrome.sidePanel API is not supported in this browser version.");
    }
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCookies") {
        chrome.cookies.getAll({}, (cookies) => {
            if (chrome.runtime.lastError) {
                // Handle errors from chrome.cookies.getAll
                console.error("Error fetching cookies:", chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
            } else {
                // Send the cookies back to the sender
                sendResponse({ cookies });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    }
});