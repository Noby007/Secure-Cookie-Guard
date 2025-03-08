document.addEventListener("DOMContentLoaded", function () {
    // Button elements
    const encryptBtn = document.getElementById("encryptBtn");
    const decryptBtn = document.getElementById("decryptBtn");
    const importBtn = document.getElementById("importBtn");
    const exportBtn = document.getElementById("exportBtn");
    const clearCookiesBtn = document.getElementById("clearCookiesBtn");
    const cookieList = document.getElementById("cookieList");

    // Function to load cookies
    function loadCookies() {
        if (!chrome.cookies) {
            console.error("Chrome cookies API is not available.");
            return;
        }

        cookieList.innerHTML = "<li>Loading cookies...</li>";

        chrome.cookies.getAll({}, function (cookies) {
            cookieList.innerHTML = ""; // Clear loading text
            if (cookies.length === 0) {
                cookieList.innerHTML = "<li>No cookies found.</li>";
                return;
            }

            cookies.forEach(cookie => {
                let listItem = document.createElement("li");
                listItem.className = "cookie-item";
                listItem.textContent = `${cookie.name}: ${cookie.value}`;
                cookieList.appendChild(listItem);
            });
        });
    }

    // Fake Processing Function
    function fakeProcess(button, originalText) {
        button.innerText = "Processing...";
        button.disabled = true;

        setTimeout(() => {
            button.innerText = originalText;
            button.disabled = false;
        }, 2000);
    }

    // Encrypt & Decrypt Button Clicks
    if (encryptBtn) {
        encryptBtn.addEventListener("click", function () {
            alert("🔒 Encrypting Cookies");
            fakeProcess(encryptBtn, "Encrypt Now");
        });
    }

    if (decryptBtn) {
        decryptBtn.addEventListener("click", function () {
            alert("🔓 Decrypting Cookies");
            fakeProcess(decryptBtn, "Decrypt Now");
        });
    }

    // Import Functionality
    if (importBtn) {
        importBtn.addEventListener("click", function () {
            console.log("Import Button Clicked!");
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (!file) {
                    console.error("No file selected!");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const cookies = JSON.parse(event.target.result);
                        console.log("Parsed Cookies:", cookies);

                        cookies.forEach(cookie => {
                            chrome.cookies.set({
                                url: `http${cookie.secure ? "s" : ""}://${cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain}`,
                                name: cookie.name,
                                value: cookie.value,
                                path: cookie.path || "/",
                                secure: cookie.secure || false,
                                httpOnly: cookie.httpOnly || false,
                                expirationDate: cookie.expirationDate || (Date.now() / 1000) + 3600
                            }, function (cookie) {
                                if (chrome.runtime.lastError) {
                                    console.error("Error setting cookie:", chrome.runtime.lastError);
                                } else {
                                    console.log("Cookie set:", cookie);
                                }
                            });
                        });

                        setTimeout(loadCookies, 1000); // Reload after 1s to reflect changes
                        alert("✅ Cookies imported successfully!");
                    } catch (error) {
                        alert("❌ Error importing cookies! Make sure the file is a valid JSON.");
                        console.error("Import Error:", error);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        });
    }

    // Export Functionality
    if (exportBtn) {
        exportBtn.addEventListener("click", function () {
            console.log("Export Button Clicked!");
            chrome.cookies.getAll({}, function (cookies) {
                if (chrome.runtime.lastError) {
                    console.error("Error fetching cookies:", chrome.runtime.lastError);
                    return;
                }

                if (cookies.length === 0) {
                    alert("❌ No cookies to export!");
                    return;
                }

                console.log("Exporting Cookies:", cookies);

                const formattedCookies = cookies.map(cookie => ({
                    domain: cookie.domain,
                    name: cookie.name,
                    value: cookie.value,
                    path: cookie.path || "/",
                    secure: cookie.secure || false,
                    httpOnly: cookie.httpOnly || false,
                    expirationDate: cookie.expirationDate || (Date.now() / 1000) + 3600
                }));

                const blob = new Blob([JSON.stringify(formattedCookies, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "cookies.json";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert("✅ Cookies exported successfully!");
            });
        });
    }

    // Clear Cookies Functionality
    if (clearCookiesBtn) {
        clearCookiesBtn.addEventListener("click", function () {
            if (confirm("⚠️ Are you sure you want to clear all cookies?")) {
                chrome.cookies.getAll({}, function (cookies) {
                    if (chrome.runtime.lastError) {
                        console.error("Error fetching cookies:", chrome.runtime.lastError);
                        return;
                    }

                    cookies.forEach(cookie => {
                        chrome.cookies.remove({
                            url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
                            name: cookie.name
                        });
                    });

                    setTimeout(loadCookies, 1000); // Reload after 1s to reflect changes
                    alert("✅ Cookies cleared successfully!");
                });
            }
        });
    }

    // Load cookies when the side panel opens
    loadCookies();
});