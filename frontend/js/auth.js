const API = "http://localhost:5000/api";

const loginPanel = document.getElementById("loginPanel");
const registerPanel = document.getElementById("registerPanel");
const authMessage = document.getElementById("authMessage");

// Switch to registration
document.getElementById("showRegister").addEventListener("click", function (event) {
    event.preventDefault();

    loginPanel.classList.add("hidden");
    registerPanel.classList.remove("hidden");
    authMessage.textContent = "";
});

// Switch to login
document.getElementById("showLogin").addEventListener("click", function (event) {
    event.preventDefault();

    registerPanel.classList.add("hidden");
    loginPanel.classList.remove("hidden");
    authMessage.textContent = "";
});

// Common authentication function
async function authenticate(endpoint, form) {
    authMessage.textContent = "Please wait...";

    const formData = new FormData(form);
    const userData = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API}/auth/${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Authentication failed");
        }

        // Save login information
        localStorage.setItem("carbontrace_token", result.token);
        localStorage.setItem(
            "carbontrace_user",
            JSON.stringify(result.user)
        );

        // Redirect based on account role
        if (result.user.role === "admin") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "dashboard.html";
        }

    } catch (error) {
        authMessage.textContent = error.message;
    }
}

// Login form
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();
    authenticate("login", this);
});

// Registration form
document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault();
    authenticate("register", this);
});

// Open registration panel if URL contains #register
if (window.location.hash === "#register") {
    loginPanel.classList.add("hidden");
    registerPanel.classList.remove("hidden");
}