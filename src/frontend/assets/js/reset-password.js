document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resetForm");
  const otpInput = document.getElementById("otp");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");

  function showError(input, message) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    errorDiv.textContent = message;
  }

  function clearError(input) {
    const errorDiv = input.parentElement.querySelector(".error-message");
    errorDiv.textContent = "";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    clearError(otpInput);
    clearError(newPasswordInput);
    clearError(confirmPasswordInput);

    let hasError = false;

    const otp = otpInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Lấy email từ query string (truyền từ forgot-password.html)
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (!email) {
      showError(document.getElementById("error-message"), "Email is missing. Please try again.");
      hasError = true;
    }

    // Kiểm tra OTP
    if (!otp) {
      showError(otpInput, "Vui lòng nhập mã OTP.");
      hasError = true;
    } else if (!/^\d{6}$/.test(otp)) {
      showError(otpInput, "Mã OTP phải là 6 chữ số.");
      hasError = true;
    }

    // Kiểm tra mật khẩu mới
    if (!newPassword) {
      showError(newPasswordInput, "Vui lòng nhập mật khẩu mới.");
      hasError = true;
    } else if (newPassword.length < 6) {
      showError(newPasswordInput, "Mật khẩu mới phải có ít nhất 6 ký tự.");
      hasError = true;
    }

    // Kiểm tra xác nhận mật khẩu
    if (!confirmPassword) {
      showError(confirmPasswordInput, "Vui lòng nhập lại mật khẩu.");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      showError(confirmPasswordInput, "Mật khẩu xác nhận không khớp.");
      hasError = true;
    }

    if (!hasError) {
      // Gửi request API để kiểm tra OTP và đổi mật khẩu
      fetch('http://localhost/movie_project/src/backend/server.php?controller=user&method=resetPassword', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          otp: otp,
          newPassword: newPassword
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === "success") {
          alert("Đặt lại mật khẩu thành công!");
          window.location.href = "login.html";
        } else {
          showError(document.getElementById("error-message"), data.message);
        }
      })
      .catch(error => {
        console.error("Error:", error);
        showError(document.getElementById("error-message"), "An error occurred. Please try again.");
      });
    }
  });
});