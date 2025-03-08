document.addEventListener("DOMContentLoaded", function () {
    const searchBar = document.getElementById("searchBar");
    const cookieTableBody = document.querySelector("#cookieTable tbody");
    const noCookiesMessage = document.getElementById("noCookiesMessage");
    const addCookieButton = document.getElementById("addCookieButton");

    // Load cookies when the page loads
    loadCookies();

    // Function to load and display cookies
    function loadCookies() {
        chrome.cookies.getAll({}, function (cookies) {
            if (chrome.runtime.lastError) {
                console.error("Error fetching cookies:", chrome.runtime.lastError);
                return;
            }

            // Clear the table
            cookieTableBody.innerHTML = "";

            if (cookies.length === 0) {
                noCookiesMessage.style.display = "block";
                return;
            }

            noCookiesMessage.style.display = "none";

            // Populate the table with cookies
            cookies.forEach(cookie => {
                const row = document.createElement("tr");

                // Domain
                const domainCell = document.createElement("td");
                domainCell.className = "tooltip truncate";
                domainCell.innerHTML = `<span>${cookie.domain}</span><span class="tooltiptext">${cookie.domain}</span>`;
                row.appendChild(domainCell);

                // Path
                const pathCell = document.createElement("td");
                pathCell.className = "tooltip truncate";
                pathCell.innerHTML = `<span>${cookie.path}</span><span class="tooltiptext">${cookie.path}</span>`;
                row.appendChild(pathCell);

                // Name
                const nameCell = document.createElement("td");
                nameCell.className = "tooltip truncate";
                nameCell.innerHTML = `<span>${cookie.name}</span><span class="tooltiptext">${cookie.name}</span>`;
                row.appendChild(nameCell);

                // Store ID/Partition Key (Placeholder)
                const storeCell = document.createElement("td");
                storeCell.textContent = "0"; // Placeholder
                row.appendChild(storeCell);

                // Value
                const valueCell = document.createElement("td");
                valueCell.className = "tooltip truncate";
                valueCell.innerHTML = `<span>${cookie.value}</span><span class="tooltiptext">${cookie.value}</span>`;
                row.appendChild(valueCell);

                // Expires
                const expiresCell = document.createElement("td");
                expiresCell.textContent = cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : "Session";
                row.appendChild(expiresCell);

                // Same Site
                const sameSiteCell = document.createElement("td");
                sameSiteCell.textContent = cookie.sameSite || "None";
                row.appendChild(sameSiteCell);

                // Host-Only
                const hostOnlyCell = document.createElement("td");
                hostOnlyCell.textContent = cookie.hostOnly ? "Yes" : "No";
                row.appendChild(hostOnlyCell);

                // Http-Only
                const httpOnlyCell = document.createElement("td");
                httpOnlyCell.textContent = cookie.httpOnly ? "Yes" : "No";
                row.appendChild(httpOnlyCell);

                // Secure
                const secureCell = document.createElement("td");
                secureCell.textContent = cookie.secure ? "Yes" : "No";
                row.appendChild(secureCell);

                // Actions
                const actionsCell = document.createElement("td");
                const copyButton = document.createElement("button");
                copyButton.className = "action-button copy-button";
                copyButton.textContent = "Copy";
                copyButton.addEventListener("click", () => copyCookie(cookie));
                actionsCell.appendChild(copyButton);

                const editButton = document.createElement("button");
                editButton.className = "action-button edit-button";
                editButton.textContent = "Edit";
                editButton.addEventListener("click", () => editCookie(cookie));
                actionsCell.appendChild(editButton);

                const deleteButton = document.createElement("button");
                deleteButton.className = "action-button delete-button";
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => deleteCookie(cookie));
                actionsCell.appendChild(deleteButton);

                row.appendChild(actionsCell);

                cookieTableBody.appendChild(row);
            });
        });
    }

    // Function to copy cookie details
    function copyCookie(cookie) {
        const cookieDetails = `Domain: ${cookie.domain}\nPath: ${cookie.path}\nName: ${cookie.name}\nValue: ${cookie.value}\nExpires: ${cookie.expirationDate ? new Date(cookie.expirationDate * 1000).toLocaleString() : "Session"}\nSame Site: ${cookie.sameSite || "None"}\nHost-Only: ${cookie.hostOnly ? "Yes" : "No"}\nHttp-Only: ${cookie.httpOnly ? "Yes" : "No"}\nSecure: ${cookie.secure ? "Yes" : "No"}`;
        navigator.clipboard.writeText(cookieDetails).then(() => {
            alert("✅ Cookie details copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy:", err);
        });
    }

    // Function to edit a cookie
    function editCookie(cookie) {
        const newValue = prompt(`Edit the value for "${cookie.name}":`, cookie.value);
        if (newValue !== null) {
            chrome.cookies.set({
                url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
                name: cookie.name,
                value: newValue,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expirationDate: cookie.expirationDate
            }, function (updatedCookie) {
                if (chrome.runtime.lastError) {
                    alert("❌ Error updating cookie!");
                    console.error("Update Error:", chrome.runtime.lastError);
                } else {
                    alert("✅ Cookie updated successfully!");
                    loadCookies(); // Refresh the table
                }
            });
        }
    }

    // Function to delete a cookie
    function deleteCookie(cookie) {
        if (confirm(`Are you sure you want to delete "${cookie.name}"?`)) {
            chrome.cookies.remove({
                url: `http${cookie.secure ? "s" : ""}://${cookie.domain}${cookie.path}`,
                name: cookie.name
            }, function (details) {
                if (chrome.runtime.lastError) {
                    alert("❌ Error deleting cookie!");
                    console.error("Delete Error:", chrome.runtime.lastError);
                } else {
                    alert("✅ Cookie deleted successfully!");
                    loadCookies(); // Refresh the table
                }
            });
        }
    }

    // Function to add a new cookie
    addCookieButton.addEventListener("click", function () {
        const domain = prompt("Enter the domain (e.g., example.com):");
        if (!domain) return;

        const path = prompt("Enter the path (e.g., /):", "/");
        const name = prompt("Enter the cookie name:");
        if (!name) return;

        const value = prompt("Enter the cookie value:");
        if (!value) return;

        const secure = confirm("Is the cookie secure?");
        const httpOnly = confirm("Is the cookie HTTP-only?");
        const sameSite = prompt("Enter the SameSite value (None, Lax, Strict):", "None");
        const expirationDate = prompt("Enter the expiration date (in seconds since epoch) or leave blank for session cookie:");

        chrome.cookies.set({
            url: `http${secure ? "s" : ""}://${domain}${path}`,
            name: name,
            value: value,
            path: path,
            secure: secure,
            httpOnly: httpOnly,
            sameSite: sameSite,
            expirationDate: expirationDate ? parseInt(expirationDate) : undefined
        }, function (cookie) {
            if (chrome.runtime.lastError) {
                alert("❌ Error adding cookie!");
                console.error("Add Error:", chrome.runtime.lastError);
            } else {
                alert("✅ Cookie added successfully!");
                loadCookies(); // Refresh the table
            }
        });
    });

    // Search functionality
    searchBar.addEventListener("input", function () {
        const searchTerm = searchBar.value.toLowerCase();
        const rows = cookieTableBody.querySelectorAll("tr");

        rows.forEach(row => {
            const name = row.querySelector("td:nth-child(3)").textContent.toLowerCase();
            const value = row.querySelector("td:nth-child(5)").textContent.toLowerCase();
            if (name.includes(searchTerm) || value.includes(searchTerm)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
});