document.addEventListener("DOMContentLoaded", function () {
    const encryptBtn = document.querySelector(".btn-primary:nth-child(1)");
    const decryptBtn = document.querySelector(".btn-primary:nth-child(2)");
    const importBtn = document.querySelector(".btn-secondary:nth-child(1)");
    const exportBtn = document.querySelector(".btn-secondary:nth-child(2)");
    const cookieList = document.getElementById("cookieList");

    // Function to load cookies
    function loadCookies() {
        cookieList.innerHTML = "<li>Loading cookies...</li>";

        chrome.cookies.getAll({}, function (cookies) {
            cookieList.innerHTML = ""; // Clear loading text
            if (cookies.length === 0) {
                cookieList.innerHTML = "<li>No cookies found.</li>";
                return;
            }

            cookies.forEach(cookie => {
                let listItem = document.createElement("li");
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

    // Encrypt & Decrypt Button Click
    encryptBtn.addEventListener("click", function () {
        fakeProcess(encryptBtn, "Encrypt Now");
    });

    decryptBtn.addEventListener("click", function () {
        fakeProcess(decryptBtn, "Decrypt Now");
    });

    // Import Functionality
    importBtn.addEventListener("click", function () {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = event => {
                const cookies = JSON.parse(event.target.result);
                cookies.forEach(cookie => {
                    chrome.cookies.set(cookie);
                });
                loadCookies();
            };
            reader.readAsText(file);
        };
        input.click();
    });

    // Export Functionality
    exportBtn.addEventListener("click", function () {
        chrome.cookies.getAll({}, function (cookies) {
            const blob = new Blob([JSON.stringify(cookies, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cookies.json';
            a.click();
            URL.revokeObjectURL(url);
        });
    });

    // Load cookies when popup opens
    loadCookies();
});
