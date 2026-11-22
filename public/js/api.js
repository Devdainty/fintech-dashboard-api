const API_BASE_URL = "";

const Api = {
  getToken() {
    return localStorage.getItem("token");
  },

  setToken(token) {
    localStorage.setItem("token", token);
  },

  removeToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Centralized fetch helper
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    // If token expired or unauthorized, clear storage and kick to login
    if (response.status === 401 && !endpoint.includes("/auth/login")) {
      alert("Session expired. Please log in again.");
      this.removeToken();
      window.location.href = "/login.html";
      return null;
    }

    return { ok: response.ok, status: response.status, data };
  },

  // Page Auth Guard: Enforce login
  requireAuth() {
    if (!this.getToken()) {
      window.location.href = "/login.html";
    }
  },

  // Page Guest Guard: Prevent logged-in users from seeing signup/login
  redirectIfAuth() {
    if (this.getToken()) {
      window.location.href = "/dashboard.html";
    }
  },

  // Helper to show message banners
  showAlert(elId, message, isSuccess = true) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = message;
    el.className = isSuccess ? "alert alert-success" : "alert alert-danger";
    el.style.display = "block";
  },
};
