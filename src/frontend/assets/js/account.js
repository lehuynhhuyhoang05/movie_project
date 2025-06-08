// quản lý chuyển tab
document.querySelectorAll('.tab-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.tab-link').forEach(tab => tab.classList.remove('active'));
    this.classList.add('active');

    document.querySelectorAll('.content').forEach(section => section.classList.add('hidden'));
    const target = this.getAttribute('data-target');
    document.getElementById(target).classList.remove('hidden');
  });
});

// Toggle ẩn/hiện mật khẩu
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".toggle-password").forEach((icon) => {
      icon.addEventListener("click", function () {
        const input = document.querySelector(this.getAttribute("toggle"));
        const isPassword = input.getAttribute("type") === "password";

        input.setAttribute("type", isPassword ? "text" : "password");
        this.classList.toggle("fa-eye");
        this.classList.toggle("fa-eye-slash");
      });
    });
  });

// lấy thông tin user
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userInfoDiv = document.getElementById("userInfo");
  const fullNameInput = document.getElementById("fullName");

  if (!token) {
    userInfoDiv.innerHTML = `<p style="color:red;">Vui lòng đăng nhập để xem thông tin tài khoản.</p>`;
    return;
  }

  const API_BASE = "http://movieon.atwebpages.com/movie_project/src/backend/server.php";

  async function loadUserInfo() {
    try {
      const res = await fetch(`${API_BASE}?controller=user&method=getProfile&token=Bearer%20${token}`, {
        method: "GET"
      });
      const result = await res.json();

      if (result.status === "success" && result.data) {
        const user = result.data;

      userInfoDiv.innerHTML = `
        <p><strong>Tên đăng nhập:</strong> ${user.full_name || "(chưa cập nhật)"}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Mật khẩu:</strong> ********</p>
        <p><strong>Vai trò:</strong> ${user.role?.toUpperCase()}</p>
        <p><strong>Ngày tạo:</strong> ${user.created_at?.slice(0, 10)}</p>
      `;


        fullNameInput.value = user.full_name || "";
      } else {
        userInfoDiv.innerHTML = `<p style="color:red;">${result.message || "Không thể tải thông tin tài khoản."}</p>`;
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      userInfoDiv.innerHTML = `<p style="color:red;">Đã xảy ra lỗi khi tải thông tin.</p>`;
    }
  }

  await loadUserInfo();

  // Xử lý form cập nhật hồ sơ
  document.getElementById("updateProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = fullNameInput.value.trim();
    if (!fullName) return alert("Vui lòng nhập tên đầy đủ mới");

    try {
      console.log("Sending updateProfile request with full_name:", fullName);
      const res = await fetch(`${API_BASE}?controller=user&method=updateProfile&token=Bearer%20${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName }),
      });
      const result = await res.json();
      console.log("Update profile result:", result);

      if (result.status === "success") {
        alert("Cập nhật hồ sơ thành công!");
        await loadUserInfo(); // load lại info mới
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật hồ sơ"));
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi cập nhật hồ sơ");
    }
  });

  // Xử lý form đổi mật khẩu
  document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();

    if (!currentPassword || !newPassword) {
      return alert("Vui lòng nhập đầy đủ thông tin mật khẩu");
    }

    try {
      const res = await fetch(`${API_BASE}?controller=user&method=changePassword&token=Bearer%20${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const result = await res.json();

      if (result.status === "success") {
        alert("Đổi mật khẩu thành công!");
        document.getElementById("changePasswordForm").reset();
      } else {
        alert("Lỗi: " + (result.message || "Không thể đổi mật khẩu"));
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi đổi mật khẩu");
    }
  });
});
