Api.requireAuth();

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Api.removeToken();
    window.location.href = "/login.html";
  });
}

function renderVerificationBadge(status) {
  const badge = document.getElementById("verificationStatusBadge");
  const videoInput = document.getElementById("videoFileInput");
  const videoBtn = document.getElementById("videoSubmitBtn");

  if (!badge) return;

  const statusConfig = {
    not_submitted: { text: "Not Submitted", bg: "#f1f5f9", color: "#475569" },
    pending_review: {
      text: "Pending Review ⏳",
      bg: "#fef3c7",
      color: "#b45309",
    },
    approved: { text: "Approved ✅", bg: "#dcfce7", color: "#15803d" },
    rejected: { text: "Rejected ❌", bg: "#fee2e2", color: "#b91c1c" },
  };

  const current = statusConfig[status] || statusConfig.not_submitted;
  badge.textContent = current.text;
  badge.style.backgroundColor = current.bg;
  badge.style.color = current.color;

  const shouldDisable = status === "pending_review" || status === "approved";
  if (videoInput) videoInput.disabled = shouldDisable;
  if (videoBtn) videoBtn.disabled = shouldDisable;
}

window.renderVerificationBadge = renderVerificationBadge;
window.updateStatusBadge = renderVerificationBadge;

async function loadDashboard() {
  const res = await Api.request("/api/dashboard");

  if (res && res.ok) {
    const data = res.data;

    const welcomeEl = document.getElementById("welcomeMsg");
    if (welcomeEl) {
      welcomeEl.textContent = `Welcome back, ${data.username || "User"}!`;
    }

    const emailEl = document.getElementById("userEmail");
    if (emailEl && data.email) {
      emailEl.textContent = data.email;
    }

    const avatarEl = document.getElementById("avatarImg");
    if (avatarEl) {
      if (data.profileImage && data.profileImage.trim() !== "") {
        avatarEl.src = data.profileImage;
      } else {
        avatarEl.src =
          "https://via.placeholder.com/120/cbd5e1/475569?text=User";
      }
    }

    renderVerificationBadge(data.verificationStatus || "not_submitted");

    const balanceEl = document.getElementById("balanceDisplay");
    if (balanceEl) {
      balanceEl.textContent = `₦${Number(data.balance).toLocaleString()}`;
    }

    const tbody = document.getElementById("transactionList");
    if (tbody) {
      tbody.innerHTML = "";

      if (!data.transactions || data.transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center;">No transactions found.</td></tr>`;
        return;
      }

      data.transactions.forEach((tx) => {
        const row = document.createElement("tr");
        const date = new Date(
          tx.timestamp || tx.createdAt,
        ).toLocaleDateString();
        const badgeClass = tx.type === "credit" ? "tag-credit" : "tag-debit";

        row.innerHTML = `
          <td>${date}</td>
          <td><span class="tag ${badgeClass}">${tx.type.toUpperCase()}</span></td>
          <td>₦${Number(tx.amount).toLocaleString()}</td>
          <td>₦${Number(tx.balanceAfter).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
      });
    }
  }
}

const depositForm = document.getElementById("depositForm");
if (depositForm) {
  depositForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const amountInput = document.getElementById("depositAmount");
    const depositBtn = document.getElementById("depositBtn");
    const amount = Number(amountInput.value);

    if (amount < 100) {
      Api.showAlert("depositAlert", "Minimum deposit amount is ₦100", false);
      return;
    }

    depositBtn.disabled = true;
    depositBtn.textContent = "Connecting to Paystack...";

    const res = await Api.request("/api/payments/initialize", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });

    if (res && res.ok && res.data.authorization_url) {
      window.location.href = res.data.authorization_url;
    } else {
      Api.showAlert(
        "depositAlert",
        res?.data?.message || "Failed to initialize payment gateway.",
        false,
      );
      depositBtn.disabled = false;
      depositBtn.textContent = "Pay with Paystack";
    }
  });
}

loadDashboard();
