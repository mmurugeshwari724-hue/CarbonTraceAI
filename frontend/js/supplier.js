const API_BASE = "http://localhost:5000/api";

const token = localStorage.getItem("carbontrace_token");

const supplierMessage = document.getElementById("supplierMessage");
const activityList = document.getElementById("activityList");
const documentList = document.getElementById("documentList");

// Check login
if (!token) {
    window.location.href = "login.html";
}

// Secure API request helper
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            ...(options.headers || {})
        }
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result;
}

// Escape text before displaying API data
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}

// Load supplier activities and documents
async function loadSupplierData() {
    try {
        const [activities, documents] = await Promise.all([
            apiRequest("/activities/mine"),
            apiRequest("/uploads/mine")
        ]);

        // Display activities
        if (activities.length === 0) {
            activityList.innerHTML = "<p>No activities submitted yet.</p>";
        } else {
            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <span>
                        ${escapeHTML(activity.category)}
                        · ${new Date(activity.activityDate).toLocaleDateString()}
                    </span>
                    <strong>
                        ${Number(activity.emissionsKgCO2e).toFixed(2)}
                        kg CO₂e
                    </strong>
                </div>
            `).join("");
        }

        // Display documents
        if (documents.length === 0) {
            documentList.innerHTML = "<li>No documents uploaded yet.</li>";
        } else {
            documentList.innerHTML = documents.map(document => `
                <li>
                    ${escapeHTML(document.originalName)}
                    · ${new Date(document.uploadedAt).toLocaleDateString()}
                </li>
            `).join("");
        }

    } catch (error) {
        supplierMessage.textContent = error.message;
    }
}

// Submit activity
document.getElementById("activityForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    supplierMessage.textContent = "Submitting activity...";

    const formData = new FormData(this);
    const activityData = Object.fromEntries(formData.entries());

    activityData.quantity = Number(activityData.quantity);

    try {
        const result = await apiRequest("/activities", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(activityData)
        });

        supplierMessage.textContent =
            `Activity saved! Estimated emissions: ${result.emissionsKgCO2e} kg CO₂e`;

        this.reset();

        await loadSupplierData();

    } catch (error) {
        supplierMessage.textContent = error.message;
    }
});

// Upload supplier document
document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const fileInput = this.querySelector('input[type="file"]');
    const file = fileInput.files[0];

    if (!file) {
        document.getElementById("uploadResult").textContent =
            "Please select a document.";
        return;
    }

    const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png"
    ];

    if (!allowedTypes.includes(file.type)) {
        document.getElementById("uploadResult").textContent =
            "Only PDF, JPG and PNG files are allowed.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        document.getElementById("uploadResult").textContent =
            "File size must not exceed 5 MB.";
        return;
    }

    const uploadData = new FormData();
    uploadData.append("document", file);

    document.getElementById("uploadResult").textContent =
        "Uploading document...";

    try {
        const result = await apiRequest("/uploads", {
            method: "POST",
            body: uploadData
        });

        document.getElementById("uploadResult").textContent =
            result.message || "Document uploaded successfully.";

        this.reset();

        await loadSupplierData();

    } catch (error) {
        document.getElementById("uploadResult").textContent =
            error.message;
    }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("carbontrace_token");
    localStorage.removeItem("carbontrace_user");

    window.location.href = "login.html";
});

// Load data when page opens
loadSupplierData();