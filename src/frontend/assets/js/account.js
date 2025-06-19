document.addEventListener("DOMContentLoaded", () => {
  handleTabSwitch();
  handlePasswordToggle();
  loadUserData();
  loadWatchHistory();
  loadFavoriteMovies();
});

// Chuyển tab
function handleTabSwitch() {
  document.querySelectorAll(".tab-link").forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelectorAll(".tab-link").forEach(tab => tab.classList.remove("active"));
      this.classList.add("active");

      document.querySelectorAll(".content").forEach(section => section.classList.add("hidden"));
      const target = this.getAttribute("data-target");
      document.getElementById(target).classList.remove("hidden");
    });
  });
}

// Toggle mật khẩu
function handlePasswordToggle() {
  document.querySelectorAll(".toggle-password").forEach(icon => {
    icon.addEventListener("click", function () {
      const input = document.querySelector(this.getAttribute("toggle"));
      const isPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", isPassword ? "text" : "password");
      this.classList.toggle("fa-eye");
      this.classList.toggle("fa-eye-slash");
    });
  });
}

// API base
const API_BASE = "http://movieon.atwebpages.com/movie_project/src/backend/server.php";

// Load thông tin người dùng
async function loadUserData() {
  const token = localStorage.getItem("token");
  const userInfoDiv = document.getElementById("userInfo");
  const fullNameInput = document.getElementById("fullName");

  if (!token) {
    userInfoDiv.innerHTML = `<p style="color:red;">Vui lòng đăng nhập để xem thông tin tài khoản.</p>`;
    return;
  }

  async function loadUserInfo() {
    try {
      const res = await fetch(`${API_BASE}?controller=user&method=getProfile&token=Bearer%20${token}`);
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

  // Cập nhật hồ sơ
  document.getElementById("updateProfileForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = fullNameInput.value.trim();
    if (!fullName) return alert("Vui lòng nhập tên đầy đủ mới");

    try {
      const res = await fetch(`${API_BASE}?controller=user&method=updateProfile&token=Bearer%20${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName })
      });
      const result = await res.json();
      if (result.status === "success") {
        alert("Cập nhật hồ sơ thành công!");
        await loadUserInfo();
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật hồ sơ"));
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi cập nhật hồ sơ");
    }
  });

  // Đổi mật khẩu
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
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
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
}

// Tải danh sách phim yêu thích
async function loadFavoriteMovies() {
  const token = localStorage.getItem("token");
  const favoriteContainer = document.getElementById("favorite-movies");
  if (!favoriteContainer) return;

  if (!token) {
    favoriteContainer.innerHTML = "<p>Bạn cần đăng nhập để xem phim yêu thích.</p>";
    return;
  }

  try {
    const response = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=getFavorites&token=Bearer%20${token}`);
    const data = await response.json();

    if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
      favoriteContainer.innerHTML = data.data.map(movie => `
        <div onclick="handleWatchAndRedirect(${movie.id})"
             style="width: 200px; background: #111; color: #fff; padding: 10px; border-radius: 8px; cursor: pointer;">
          <img src="${movie.poster_url || movie.poster || '../assets/images/default-poster.jpg'}" alt="${movie.title}" style="width: 100%; border-radius: 6px;">
          <h4 style="white-space: nowrap; overflow: hidden;">${movie.title}</h4>
          <button 
            onclick="event.stopPropagation(); removeFavorite(${movie.id});" 
            class="remove-btn">
            Xóa khỏi yêu thích
          </button>
        </div>
      `).join("");
    } else {
      favoriteContainer.innerHTML = "<p>Chưa có phim yêu thích nào.</p>";
    }
  } catch (error) {
    console.error("Lỗi tải phim yêu thích:", error);
    favoriteContainer.innerHTML = "<p>Không thể tải danh sách phim yêu thích.</p>";
  }
}


// Xóa khỏi yêu thích
async function removeFavorite(movieId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    return;
  }

  const confirmDelete = confirm("Bạn có chắc muốn xóa phim này khỏi danh sách yêu thích?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=removeFavorite&movie_id=${movieId}&token=Bearer%20${token}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();

    if (data.status === "success") {
      alert("Đã xóa khỏi yêu thích.");
      loadFavoriteMovies();
    } else {
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error("Lỗi khi xóa phim yêu thích:", error);
    alert("Không thể xóa phim khỏi yêu thích.");
  }
}

// Tải lịch sử xem phim
async function loadWatchHistory() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=getWatchHistory&token=Bearer%20${token}`);
    const data = await response.json();

    const historyContainer = document.getElementById("watch-history");
    if (!historyContainer) return;

    if (data.status === "success" && Array.isArray(data.data)) {
      if (data.data.length === 0) {
        historyContainer.innerHTML = "<p>Chưa có lịch sử xem.</p>";
      } else {
        const filteredHistory = [];
        const seenTitles = new Set();

        for (const movie of data.data) {
          const title = movie.title?.trim().toLowerCase();
          if (title && !seenTitles.has(title)) {
            seenTitles.add(title);
            filteredHistory.push(movie);
          }
        }

        historyContainer.innerHTML = filteredHistory.map(movie => `
          <div class="movie-itemm">
            <img src="${movie.poster_url || movie.poster || '../assets/images/default-poster.jpg'}" alt="${movie.title}" style="width: 100%; border-radius: 6px;">
            <h4>${movie.title}</h4>
            <button class="watch-now-btn" onclick="handleWatchAndRedirect(${movie.id})">Xem ngay</button>
          </div>
        `).join("");
      }
    } else {
      historyContainer.innerHTML = "<p>Lỗi khi tải lịch sử xem.</p>";
    }
  } catch (err) {
    console.error("Lỗi khi gọi API getWatchHistory:", err);
  }
}

// Thêm vào lịch sử
async function addToWatchHistory(movieId) {
  const token = localStorage.getItem("token");
  if (!token) return; // Không thông báo gì, chỉ bỏ qua

  try {
    const url = `http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=addWatchHistory&movie_id=${movieId}&token=Bearer%20${token}`;
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();
    if (data.status === "success") {
      console.log("Đã thêm vào lịch sử xem");
    } else {
      console.warn("Không thể thêm vào lịch sử xem:", data.message);
    }
  } catch (error) {
    console.error("Lỗi khi thêm vào lịch sử xem:", error);
  }
}


// Khi bấm "Xem ngay"
async function handleWatchAndRedirect(movieId) {
  await addToWatchHistory(movieId);
  location.href = `details.html?id=${movieId}`;
}
