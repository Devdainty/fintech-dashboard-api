Api.redirectIfAuth();

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  const res = await Api.request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (res.ok && res.data.token) {
    //Stores JWT token and user info in browser localStorage
    Api.setToken(res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    Api.showAlert("alertBox", "Login successful! Redirecting...", true);
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 1000);
  } else {
    Api.showAlert(
      "alertBox",
      res.data.message || "Invalid username or password",
      false,
    );
  }
});
