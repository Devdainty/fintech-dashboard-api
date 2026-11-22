const urlParams = new URLSearchParams(window.location.search);
const emailParam =
  urlParams.get("email") || sessionStorage.getItem("verify_email");
if (emailParam) {
  document.getElementById("email").value = emailParam;
}

document.getElementById("otpForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();

  const res = await Api.request("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });

  if (res.ok) {
    Api.showAlert(
      "alertBox",
      "Email successfully verified! Redirecting to login...",
      true,
    );
    setTimeout(() => {
      window.location.href = "/login.html";
    }, 1500);
  } else {
    Api.showAlert(
      "alertBox",
      res.data.message || "Invalid or expired OTP",
      false,
    );
  }
});
