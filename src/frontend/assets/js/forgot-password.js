document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("forgotPasswordForm");
  const recoveryInput = document.getElementById("recovery");
  const errorDiv = document.getElementById("recovery-error");
  const popup = document.getElementById("otp-popup");
  const closePopupBtn = document.getElementById("closePopupBtn");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = recoveryInput.value.trim();
    errorDiv.textContent = "";

    if (value === "") {
      errorDiv.textContent = "Vui lòng nhập email hoặc số điện thoại.";
      return;
    }

    // Hiển thị popup thông báo gửi OTP
    popup.classList.remove("popup-hidden");
    popup.classList.add("popup-show");

    recoveryInput.value = "";

    // Xử lý nút Đóng popup
    closePopupBtn.onclick = function () {
      popup.classList.remove("popup-show");
      popup.classList.add("popup-hidden");

      // Sau khi đóng popup, chuyển trang sau 0.5s
      setTimeout(() => {
        window.location.href = 'verify-otp.html';
      }, 500);
    };
  });
});
