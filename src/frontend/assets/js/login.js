document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-password");
  const usernameError = document.getElementById("username-error");
  const passwordError = document.getElementById("password-error");

  if (!form || !usernameInput || !passwordInput || !usernameError || !passwordError) {
    console.error("One or more login elements not found");
    return;
  }

  if (toggleIcon) {
    toggleIcon.addEventListener("click", function () {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      toggleIcon.classList.remove("fa-eye", "fa-eye-slash");
      toggleIcon.classList.add(isHidden ? "fa-eye-slash" : "fa-eye");
    });
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    usernameError.textContent = "";
    passwordError.textContent = "";

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = document.getElementById("rememberMe")?.checked || false;
    let isValid = true;

    if (username === "") {
      usernameError.textContent = "Vui lòng nhập số điện thoại hoặc email.";
      usernameInput.focus();
      isValid = false;
    }

    if (password === "") {
      passwordError.textContent = "Vui lòng nhập mật khẩu.";
      if (isValid) passwordInput.focus();
      isValid = false;
    }

    if (!isValid) return;

    const formData = {
      username,
      password,
      rememberMe
    };

    try {
      const response = await fetch("http://movieon.atwebpages.com/src/backend/server.php?controller=user&method=login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        passwordError.textContent = `Lỗi server: ${response.status} ${response.statusText}`;
        return;
      }

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid response format:", text);
        passwordError.textContent = "Lỗi server: Phản hồi không đúng định dạng.";
        return;
      }

      const result = await response.json();

      if (result.status === "success") {
        const user = result.user;

        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("user", JSON.stringify(user));
        alert("Đăng nhập thành công!");

        // Phân quyền chuyển trang
        if (user.role === "admin") {
          window.location.href = "admin/dashboard.html";
        } else if (user.role === "user") {
            window.location.href = "/src/frontend/pages/home.html";
        } else {
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
      console.error("Error during login:", error);
      if (error.message.includes("Failed to fetch")) {
        passwordError.textContent = "Không thể kết nối đến server. Vui lòng kiểm tra server.";
      } else {
        passwordError.textContent = "Có lỗi xảy ra. Vui lòng thử lại sau.";
      }
    }
  });
});
