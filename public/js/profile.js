const avatarForm = document.getElementById("avatarForm");
const profileFileInput = document.getElementById("profileFileInput");
const avatarImg = document.getElementById("avatarImg");
const uploadBtn = document.getElementById("uploadBtn");

avatarForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = profileFileInput.files[0];
  if (!file) {
    Api.showAlert(
      "uploadFeedback",
      "Please select an image file first.",
      false,
    );
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    Api.showAlert("uploadFeedback", "File size must be 2MB or less.", false);
    return;
  }

  //Builds FormData
  const formData = new FormData();
  formData.append("profile", file);

  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";

  try {
    const token = Api.getToken();
    const response = await fetch("/api/profile/upload-profile", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      Api.showAlert(
        "uploadFeedback",
        "Profile image uploaded successfully!",
        true,
      );
      avatarImg.src = data.profileImage;
      avatarForm.reset();
    } else {
      Api.showAlert("uploadFeedback", data.message || "Upload failed.", false);
    }
  } catch (error) {
    Api.showAlert(
      "uploadFeedback",
      "An error occurred during upload: " + error.message,
      false,
    );
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "Upload Picture";
  }
});
