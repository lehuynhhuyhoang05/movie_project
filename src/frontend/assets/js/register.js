document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const togglePasswordIcons = document.querySelectorAll(".toggle-password");

  function showError(input, message) {
    let formGroup = input.closest(".form-group");
    if (!formGroup) return;
    const errorDiv = formGroup.querySelector(".error-message");
    if (!errorDiv) return;
    errorDiv.textContent = message;
    errorDiv.style.color = "red";
  }

  function clearError(input) {
    let formGroup = input.closest(".form-group");
    if (!formGroup) return;
    const errorDiv = formGroup.querySelector(".error-message");
    if (!errorDiv) return;
    errorDiv.textContent = "";
  }

  togglePasswordIcons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      const targetId = icon.getAttribute("data-target");
      const passwordField = document.getElementById(targetId);
      if (!passwordField) return;

      if (passwordField.type === "password") {
        passwordField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        passwordField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    [fullnameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => clearError(input));

    let hasError = false;

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!fullname) {
      showError(fullnameInput, "Vui lòng nhập họ và tên.");
      hasError = true;
    }
    if (!email) {
      showError(emailInput, "Vui lòng nhập email hoặc số điện thoại.");
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^(0|\+84)\d{9}$/;
      if (!emailRegex.test(email) && !phoneRegex.test(email)) {
        showError(emailInput, "Email hoặc số điện thoại không hợp lệ.");
        hasError = true;
      }
    }
    if (!password) {
      showError(passwordInput, "Vui lòng nhập mật khẩu.");
      hasError = true;
    } else if (password.length < 6) {
      showError(passwordInput, "Mật khẩu phải có ít nhất 6 ký tự.");
      hasError = true;
    }
    if (!confirmPassword) {
      showError(confirmPasswordInput, "Vui lòng nhập xác nhận mật khẩu.");
      hasError = true;
    } else if (password !== confirmPassword) {
      showError(confirmPasswordInput, "Mật khẩu xác nhận không khớp.");
      hasError = true;
    }

    if (!hasError) {
      // Gửi dữ liệu lên server qua API bằng fetch
      fetch("http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: fullname, 
          email: email,
          password: password,
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.status === "success") {
          alert("Đăng ký thành công! Bạn có thể đăng nhập.");
          window.location.href = "login.html";
        } else {
          alert(data.message || "Đăng ký thất bại.");
        }
      })
      .catch(error => {
        console.error("Lỗi đăng ký:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
      });
    }
  });
});
