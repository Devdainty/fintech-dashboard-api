const videoForm = document.getElementById("videoForm");
const videoFileInput = document.getElementById("videoFileInput");
const videoSubmitBtn = document.getElementById("videoSubmitBtn");
const videoFeedback = "videoFeedback";

videoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = videoFileInput.files[0];
  if (!file) {
    Api.showAlert(videoFeedback, "Please select a video file.", false);
    return;
  }

  const maxSize = 25 * 1024 * 1024;
  if (file.size > maxSize) {
    Api.showAlert(
      videoFeedback,
      "File exceeds 25MB! Please select a smaller video.",
      false,
    );
    return;
  }

  const allowedTypes = ["video/mp4", "video/webm", "video/quicktime"];
  if (!allowedTypes.includes(file.type)) {
    Api.showAlert(
      videoFeedback,
      "Invalid file type! Please upload an MP4, WebM, or MOV video.",
      false,
    );
    return;
  }

  const formData = new FormData();
  formData.append("video", file);

  videoSubmitBtn.disabled = true;
  videoSubmitBtn.textContent = "Uploading Video...";

  try {
    const token = Api.getToken();

    const response = await fetch("/api/videos/verification-video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      Api.showAlert(videoFeedback, data.message, true);
      videoForm.reset();
      updateStatusBadge("pending_review");
    } else {
      Api.showAlert(
        videoFeedback,
        data.message || "Video upload rejected.",
        false,
      );
    }
  } catch (err) {
    Api.showAlert(
      videoFeedback,
      "Error submitting video: " + err.message,
      false,
    );
  } finally {
    videoSubmitBtn.disabled = false;
    videoSubmitBtn.textContent = "Submit Video";
  }
});

function updateStatusBadge(status) {
  const badge = document.getElementById("verificationStatusBadge");
  if (!badge) return;

  const statusMap = {
    not_submitted: { text: "Not Submitted", bg: "#f1f5f9", color: "#475569" },
    pending_review: {
      text: "Pending Review ⏳",
      bg: "#fef3c7",
      color: "#b45309",
    },
    approved: { text: "Approved ✅", bg: "#dcfce7", color: "#15803d" },
    rejected: { text: "Rejected ❌", bg: "#fee2e2", color: "#b91c1c" },
  };

  const current = statusMap[status] || statusMap.not_submitted;
  badge.textContent = current.text;
  badge.style.backgroundColor = current.bg;
  badge.style.color = current.color;

  if (status === "pending_review" || status === "approved") {
    videoSubmitBtn.disabled = true;
    videoFileInput.disabled = true;
  } else {
    videoSubmitBtn.disabled = false;
    videoFileInput.disabled = false;
  }
}
