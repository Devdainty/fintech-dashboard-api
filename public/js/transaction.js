// Protects page
Api.requireAuth();

document.getElementById("txForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const type = document.getElementById("type").value;
  const amount = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;

  const res = await Api.request("/api/transactions", {
    method: "POST",
    body: JSON.stringify({ type, amount, description }),
  });

  if (res.ok) {
    Api.showAlert(
      "alertBox",
      `Success! ${type.toUpperCase()} of ₦${amount.toLocaleString()} completed. New Balance: ₦${res.data.currentBalance.toLocaleString()}`,
      true,
    );
    document.getElementById("txForm").reset();
  } else {
    // Shows validation or insufficient balance error directly from backend
    Api.showAlert(
      "alertBox",
      res.data.message || "Transaction rejected by server.",
      false,
    );
  }
});
