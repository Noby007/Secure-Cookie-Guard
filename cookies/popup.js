document.addEventListener("DOMContentLoaded", function () {
    const encryptBtn = document.querySelector(".btn-primary:nth-child(1)");
    const decryptBtn = document.querySelector(".btn-primary:nth-child(2)");
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

    // Load cookies when popup opens
    loadCookies();
});
