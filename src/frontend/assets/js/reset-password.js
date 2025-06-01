document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("resetForm");
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

    clearError(newPasswordInput);
    clearError(confirmPasswordInput);

    let hasError = false;

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!newPassword) {
      showError(newPasswordInput, "Vui lòng nhập mật khẩu mới.");
      hasError = true;
    } else if (newPassword.length < 6) {
      showError(newPasswordInput, "Mật khẩu mới phải có ít nhất 6 ký tự.");
      hasError = true;
    }

    if (!confirmPassword) {
      showError(confirmPasswordInput, "Vui lòng nhập lại mật khẩu.");
      hasError = true;
    } else if (newPassword !== confirmPassword) {
      showError(confirmPasswordInput, "Mật khẩu xác nhận không khớp.");
      hasError = true;
    }

    if (!hasError) {
      alert("Đặt lại mật khẩu thành công! (giả lập)");
       window.location.href = "login.html";
    }
  });
});
