document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");
  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");

  if (!form || !usernameInput || !passwordInput || !usernameError || !passwordError) {
    console.error("Không tìm thấy các phần tử cần thiết cho login");
    return;
  }

  // Toggle hiển thị/mật khẩu
  if (toggleIcon) {
    toggleIcon.addEventListener("click", () => {
      const isPasswordHidden = passwordInput.type === "password";
      passwordInput.type = isPasswordHidden ? "text" : "password";
      toggleIcon.classList.toggle("fa-eye");
      toggleIcon.classList.toggle("fa-eye-slash");
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset lỗi
    usernameError.textContent = "";
    passwordError.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById("rememberMe")?.checked || false;

    let isValid = true;

    if (!username) {
      usernameError.textContent = "Vui lòng nhập số điện thoại hoặc email.";
      usernameInput.focus();
      isValid = false;
    }

    if (!password) {
      passwordError.textContent = "Vui lòng nhập mật khẩu.";
      if (isValid) passwordInput.focus();
      isValid = false;
    }

    if (!isValid) return;

    const formData = { username, password, rememberMe };

    try {
      const response = await fetch("http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        passwordError.textContent = `Lỗi server: ${response.status} ${response.statusText}`;
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        console.error("Phản hồi không phải JSON:", text);
        passwordError.textContent = "Lỗi server: Phản hồi không đúng định dạng.";
        return;
      }

      const result = await response.json();

      if (result.status === "success") {
        // Lưu user, token và role vào localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.user.role); // <--- lưu role riêng

        // Điều hướng theo role
        switch (result.user.role) {
          case "admin":
            window.location.href = "admin/dashboard.html";
            break;
          case "user":
            window.location.href = "/src/frontend/pages/home.html";
            break;
          default:
            passwordError.textContent = "Vai trò người dùng không xác định.";
        }
      } else {
        if (result.errors) {
          if (result.errors.username) usernameError.textContent = result.errors.username;
          if (result.errors.password) passwordError.textContent = result.errors.password;
        } else {
          passwordError.textContent = result.message || "Tài khoản hoặc mật khẩu không đúng.";
          passwordInput.focus();
        }
      }
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      if (error.message.includes("Failed to fetch")) {
        passwordError.textContent = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối.";
      } else {
        passwordError.textContent = "Có lỗi xảy ra. Vui lòng thử lại sau.";
      }
    }
  });
});
