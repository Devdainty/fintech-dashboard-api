Api.redirectIfAuth();

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const res = await Api.request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

  if (res.ok) {
    Api.showAlert(
      "alertBox",
      "Registration successful! Redirecting to OTP verification...",
      true,
    );
    // Stores email temporarily so verify page can pre-fill it
    sessionStorage.setItem("verify_email", email);
    setTimeout(() => {
      window.location.href = `/verify-otp.html?email=${encodeURIComponent(email)}`;
    }, 1500);
  } else {
    Api.showAlert("alertBox", res.data.message || "Registration failed", false);
  }
});
