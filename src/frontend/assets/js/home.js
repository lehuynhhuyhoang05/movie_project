document.addEventListener("DOMContentLoaded", () => {
  const adminBackBtnContainer = document.getElementById("adminBackBtnContainer");

  const userData = localStorage.getItem("user");
  if (userData) {
    const user = JSON.parse(userData);
    if (user.role === "admin") {
      const btn = document.createElement("button");
      btn.textContent = "← Quay lại trang admin";

      // Gán class để dùng CSS
      btn.className = "admin-back-button";

      btn.addEventListener("click", () => {
        window.location.href = "/src/frontend/pages/admin/dashboard.html";
      });

      adminBackBtnContainer.appendChild(btn);
    }
  }
});
