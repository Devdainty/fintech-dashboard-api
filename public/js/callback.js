Api.requireAuth();

async function processPaymentCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const reference = urlParams.get("reference");

  if (!reference) {
    Api.showAlert("verifyAlert", "No payment reference found in URL.", false);
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("dashboardLink").style.display = "inline-block";
    return;
  }

  const res = await Api.request(
    `/api/payments/verify/${encodeURIComponent(reference)}`,
  );

  document.getElementById("loadingSpinner").style.display = "none";
  document.getElementById("dashboardLink").style.display = "inline-block";

  if (res && res.ok) {
    Api.showAlert(
      "verifyAlert",
      res.data.message || "Payment verified and wallet credited!",
      true,
    );
    setTimeout(() => {
      window.location.href = "/dashboard.html";
    }, 2000);
  } else {
    Api.showAlert(
      "verifyAlert",
      res?.data?.message || "Verification failed. Please contact support.",
      false,
    );
  }
}

window.onload = processPaymentCallback;
