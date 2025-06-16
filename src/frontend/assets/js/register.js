document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const togglePasswordIcons = document.querySelectorAll(".toggle-password");

  if (!form || !fullnameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    console.error("Không tìm thấy các phần tử cần thiết cho đăng ký");
    return;
  }

  // Hiện/ẩn mật khẩu
  togglePasswordIcons.forEach(icon => {
    icon.addEventListener("click", () => {
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

  function showError(input, message) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;
    const errorDiv = formGroup.querySelector(".error-message");
    if (!errorDiv) return;
    errorDiv.textContent = message;
    errorDiv.style.color = "red";
  }

  function clearError(input) {
    const formGroup = input.closest(".form-group");
    if (!formGroup) return;
    const errorDiv = formGroup.querySelector(".error-message");
    if (!errorDiv) return;
    errorDiv.textContent = "";
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    [fullnameInput, emailInput, passwordInput, confirmPasswordInput].forEach(clearError);

    let hasError = false;

    const username = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username) {
      showError(fullnameInput, "Vui lòng nhập tên đăng ký.");
      hasError = true;
    }

    if (!email) {
      showError(emailInput, "Vui lòng nhập email.");
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

    if (hasError) return;

    try {
      const response = await fetch("http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password
        }),
      });

      const text = await response.text();

      // Tách JSON trong trường hợp server trả kèm log lỗi trước JSON
      const jsonStart = text.lastIndexOf('{');
      if (jsonStart === -1) {
        alert("Server trả về dữ liệu không hợp lệ.");
        return;
      }
      const jsonString = text.substring(jsonStart);
      let data;
      try {
        data = JSON.parse(jsonString);
      } catch (err) {
        console.error("Lỗi parse JSON:", err);
        console.error("Response trả về:", text);
        alert("Server trả về dữ liệu JSON không hợp lệ.");
        return;
      }

      if (data.status === "success") {
        alert("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
        sessionStorage.setItem("registeredEmail", email);
        sessionStorage.setItem("registeredPassword", password);
        window.location.href = "/src/frontend/pages/login.html";
      } else if (data.message === "Username already exists") {
        showError(fullnameInput, "Tên người dùng đã tồn tại. Vui lòng chọn tên khác.");
      } else {
        alert(data.message || "Đăng ký thất bại.");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  });
});
