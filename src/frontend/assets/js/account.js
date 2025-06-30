const apiBase = "http://localhost/movie_project/src/backend";

const genreNameMapVi = {
  "Action": "Hành động",
  "Adventure": "Phiêu lưu",
  "Animation": "Hoạt hình",
  "Comedy": "Hài",
  "Crime": "Tội phạm",
  "Documentary": "Tài liệu",
  "History": "Lịch sử",
  "Family": "Gia đình",
  "Fantasy": "Giả tưởng",
  "Drama": "Chính kịch",
  "Horror": "Kinh dị",
  "Music": "Âm nhạc",
  "Mystery": "Bí ẩn",
  "Romance": "Lãng mạn",
  "Science Fiction": "Khoa học viễn tưởng",
  "Thriller": "Gây cấn",
  "War": "Chiến tranh",
  "Western": "Cao bồi viễn tây",
  "TV Movie": "Phim truyền hình"
};

document.addEventListener("DOMContentLoaded", () => {
  const userInfoContainer = document.getElementById("userInfo");
  if (!userInfoContainer) {
    return;
  }
  handleTabSwitch();
  handlePasswordToggle();
  loadUserData();
  loadWatchHistory();
  loadFavoriteMovies();
  loadWatchlistMovies();
  loadWatchlistOptions();
  const createWatchlistBtn = document.getElementById("createWatchlistBtn");
  if (createWatchlistBtn) {
    createWatchlistBtn.addEventListener("click", openCreateWatchlistPopup);
  } else {
    console.warn("Không tìm thấy nút createWatchlistBtn. Vui lòng kiểm tra HTML.");
  }
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
const API_BASE = "http://localhost/movie_project/src/backend/server.php";

// Load thông tin người dùng
async function loadUserData() {
  const token = localStorage.getItem("token");
  const userInfoDiv = document.getElementById("userInfo");
  const fullNameInput = document.getElementById("fullName");

  if (!token) {
    userInfoDiv.innerHTML = `<p style="color:red;">Vui lòng đăng nhập để xem thông tin tài khoản.</p>`;
    return;
  }

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
        await loadUserData();
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật hồ sơ"));
      }
    } catch (error) {
      console.error(error);
      alert("Đã xảy ra lỗi khi cập nhật hồ sơ");
    }
  });

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
    const response = await fetch(`${API_BASE}?controller=movie&method=getFavorites&token=Bearer%20${token}`);
    const data = await response.json();

    if (data.status === "success" && Array.isArray(data.data) && data.data.length > 0) {
      renderMovies(data.data, "favorite-movies");
      const movieCards = favoriteContainer.querySelectorAll('.movie-card');
      movieCards.forEach(card => {
        const movieId = card.querySelector('.movie-btn').getAttribute('data-movie-id');
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-btn';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = (e) => { removeFavorite(movieId); e.stopPropagation(); };
        card.appendChild(closeBtn);
      });
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
    const response = await fetch(`${API_BASE}?controller=movie&method=removeFavorite&movie_id=${movieId}&token=Bearer%20${token}`, {
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
    const response = await fetch(`${API_BASE}?controller=movie&method=getWatchHistory&token=Bearer%20${token}`);
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

        renderMovies(filteredHistory, "watch-history");
        const movieCards = historyContainer.querySelectorAll('.movie-card');
        movieCards.forEach(card => {
          const movieId = card.querySelector('.movie-btn').getAttribute('data-movie-id');
          const closeBtn = document.createElement('span');
          closeBtn.className = 'close-btn';
          closeBtn.innerHTML = '×';
          closeBtn.onclick = (e) => { removeFromWatchHistory(movieId); e.stopPropagation(); };
          card.appendChild(closeBtn);
        });
      }
    } else {
      historyContainer.innerHTML = "<p>Lỗi khi tải lịch sử xem.</p>";
    }
  } catch (err) {
    console.error("Lỗi khi gọi API getWatchHistory:", err);
    const historyContainer = document.getElementById("watch-history");
    if (historyContainer) historyContainer.innerHTML = "<p>Lỗi khi tải lịch sử xem.</p>";
  }
}

// Xóa khỏi lịch sử xem
async function removeFromWatchHistory(movieId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    return;
  }

  const confirmDelete = confirm("Bạn có chắc muốn xóa phim này khỏi lịch sử xem?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=removeWatchHistory&token=Bearer%20${token}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ movie_id: movieId })
    });

    const data = await response.json();

    if (response.ok && data.status === "success") {
      alert("Đã xóa khỏi lịch sử xem.");
      loadWatchHistory();
    } else {
      alert("Lỗi: " + (data.message || "Không thể xóa lịch sử xem."));
    }
  } catch (error) {
    console.error("Lỗi khi xóa lịch sử xem:", error);
    alert("Đã xảy ra lỗi khi xóa lịch sử xem.");
  }
}

// Hiển thị phim trong lưới với tên thể loại tiếng Việt, thời lượng và đạo diễn
function renderMovies(movies, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.error(`Không tìm thấy grid với ID: ${gridId}`);
    return;
  }
  grid.innerHTML = ''; // Xóa nội dung cũ

  if (!movies || movies.length === 0) {
    grid.innerHTML = '<p>Không có phim nào trong watchlist</p>';
    return;
  }

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    const genreEn = movie.genre_name || movie.genre || 'Không rõ';
    const genreVi = genreNameMapVi[genreEn] || genreEn;
    const duration = movie.duration ? `${movie.duration} phút` : 'Chưa rõ';
    const director = movie.director || 'Chưa rõ';

    movieCard.innerHTML = `
      <div class="movie-poster">
        <img src="${movie.poster_url || movie.poster || '../assets/images/default-poster.jpg'}" alt="${movie.title || 'Phim không tên'}">
      </div>
      <div class="info">
        <h3>${movie.title || 'Không có tiêu đề'}</h3>
        <p>${movie.description ? movie.description.substring(0, 50) + '...' : 'Không có mô tả'}</p>
        <p class="movie-genre">Thể loại: ${genreVi}</p>
        <p><strong>Thời lượng:</strong> ${duration}</p>
        <p><strong>Đạo diễn:</strong> ${director}</p>
        <p class="movie-rating">${movie.imdb_rating || 'N/A'}</p>
        <button class="movie-btn" data-movie-id="${movie.id}">Xem ngay</button>
      </div>
    `;
    grid.appendChild(movieCard);
  });

  integrateWatchHistory(gridId);
}

// Hàm tích hợp logic lịch sử xem cho các nút "Xem ngay"
function integrateWatchHistory(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.querySelectorAll('.movie-btn').forEach(button => {
    const movieId = button.getAttribute('data-movie-id');
    if (movieId) {
      button.onclick = () => handleWatchAndRedirect(parseInt(movieId));
    }
  });
}

// Khi bấm "Xem ngay"
async function handleWatchAndRedirect(movieId) {
  try {
    await addToWatchHistory(movieId);
  } catch (e) {
    console.warn("Không thể lưu lịch sử, chuyển hướng vẫn tiếp tục");
  } finally {
    location.href = `details.html?id=${movieId}`;
  }
}

// Thêm vào lịch sử
async function addToWatchHistory(movieId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const url = `${API_BASE}?controller=movie&method=addWatchHistory&movie_id=${movieId}&token=Bearer%20${token}`;
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

async function loadWatchlistMovies() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("watchlist-movies");

  if (!container) {
    console.warn("Không tìm thấy container #watchlist-movies");
    return;
  }

  if (!token) {
    container.innerHTML = "<p>Bạn cần đăng nhập để xem danh sách xem sau.</p>";
    return;
  }

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=getWatchlist`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch Response Status for getWatchlist:", response.status);
    const result = await response.json();
    console.log("getWatchlist Response:", result);

    if (result.status === "success" && Array.isArray(result.data)) {
      const movies = result.data;

      if (movies.length === 0) {
        container.innerHTML = "<p>Chưa có danh sách nào. Hãy tạo một danh sách mới!</p>";
        return;
      }

      container.innerHTML = "";

      const uniqueListTypes = [...new Set(movies.map(movie => movie.list_type || 'watch_later'))];
      uniqueListTypes.forEach(listType => {
        const section = document.createElement("div");
        section.className = `list-section list-section-${listType.replace(/\s/g, '-')}`;
        section.innerHTML = `
          <div class="list-card" data-list-type="${listType}">
            <h3>${listType}</h3>
            <span class="list-count">${movies.filter(m => m.list_type === listType || (!m.list_type && listType === 'watch_later')).length} phim</span>
            <i class="fas fa-chevron-down"></i>
            <span class="close-btn" onclick="removeWatchlist('${listType}')">×</span>
          </div>
          <div class="movie-list" id="movie-list-${listType.replace(/\s/g, '-')}"></div>
        `;
        container.appendChild(section);

        const listCard = section.querySelector('.list-card');
        const movieList = section.querySelector('.movie-list');
        listCard.addEventListener('click', (e) => {
          if (e.target.classList.contains('close-btn')) return; // Ngăn toggle khi nhấn nút xóa
          movieList.classList.toggle('active');
          if (movieList.classList.contains('active')) {
            loadMoviesInList(listType);
          } else {
            movieList.innerHTML = ''; // Xóa nội dung khi ẩn
          }
        });
      });
    } else {
      container.innerHTML = "<p>Không thể tải danh sách xem sau.</p>";
    }
  } catch (error) {
    console.error("Lỗi khi load watchlist movies:", error);
    container.innerHTML = "<p>Lỗi khi tải danh sách xem sau.</p>";
  }
}

async function loadMoviesInList(listType) {
  const token = localStorage.getItem("token");
  const containerId = `movie-list-${listType.replace(/\s/g, '-')}`;
  const container = document.getElementById(containerId);

  if (!container) {
    console.warn(`Không tìm thấy container #${containerId}`);
    return;
  }

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=getWatchlistMoviesByType&list_type=${encodeURIComponent(listType)}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log("Fetch Response Status for getWatchlistMoviesByType:", response.status);
    const result = await response.json();
    console.log("getWatchlistMoviesByType Response:", result);

    if (result.status === "success" && Array.isArray(result.data)) {
      const movies = result.data;
      if (movies.length === 0) {
        container.innerHTML = "<p>Không có phim trong danh sách này.</p>";
      } else {
        renderMovies(movies, containerId);
        const movieCards = container.querySelectorAll('.movie-card');
        movieCards.forEach(card => {
          const movieId = card.querySelector('.movie-btn').getAttribute('data-movie-id');
          const closeBtn = document.createElement('span');
          closeBtn.className = 'close-btn';
          closeBtn.innerHTML = '×';
          closeBtn.onclick = (e) => { removeFromWatchlist(movieId, listType); e.stopPropagation(); };
          card.appendChild(closeBtn);
        });
      }
    } else {
      container.innerHTML = "<p>Không thể tải phim trong danh sách.</p>";
    }
  } catch (error) {
    console.error("Lỗi khi load phim trong danh sách:", error);
    container.innerHTML = "<p>Lỗi khi tải phim trong danh sách.</p>";
  }
}

async function removeFromWatchlist(movieId, listType) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    return;
  }

  const confirmDelete = confirm("Bạn có chắc muốn xóa phim này khỏi danh sách xem sau?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=removeFromWatchlist&token=Bearer%20${token}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ movie_id: movieId, list_type: listType })
    });

    const data = await response.json();

    if (data.status === "success") {
      alert("Đã xóa khỏi danh sách xem sau.");
      loadWatchlistMovies();
    } else {
      alert("Lỗi: " + data.message);
    }
  } catch (error) {
    console.error("Lỗi khi xóa phim khỏi watchlist:", error);
    alert("Không thể xóa phim khỏi danh sách xem sau.");
  }
}

// Xóa toàn bộ danh sách xem
async function removeWatchlist(listType) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    return;
  }

  const confirmDelete = confirm(`Bạn có chắc muốn xóa danh sách "${listType}"? Hành động này sẽ xóa toàn bộ phim trong danh sách.`);
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=deleteWatchlist`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ list_type: listType })
    });

    const data = await response.json();

    if (data.status === "success") {
      alert(`Đã xóa danh sách "${listType}" thành công.`);
      loadWatchlistMovies(); // Tải lại danh sách xem
      loadWatchlistOptions(); // Cập nhật tùy chọn danh sách trong popup
    } else {
      alert("Lỗi: " + (data.message || "Không thể xóa danh sách."));
    }
  } catch (error) {
    console.error("Lỗi khi xóa danh sách:", error);
    alert("Đã xảy ra lỗi khi xóa danh sách.");
  }
}

let watchlistOptions = [];

function loadWatchlistOptions() {
  const token = localStorage.getItem("token");
  const select = document.getElementById("watchlistSelect");

  if (!select) {
    console.warn("Không tìm thấy thẻ select #watchlistSelect");
    return;
  }

  if (!token) {
    console.warn("Người dùng chưa đăng nhập. Không thể load danh sách.");
    select.innerHTML = '<option disabled>Vui lòng đăng nhập</option>';
    return;
  }

  select.innerHTML = '<option value="" disabled selected>Chọn danh sách</option>';

  fetch('http://localhost/movie_project/src/backend/server.php?controller=movie&method=getWatchlistOptions', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then((result) => {
      console.log("API Response getWatchlistOptions:", result);
      watchlistOptions = result.data || [];
      if (Array.isArray(watchlistOptions) && watchlistOptions.length > 0) {
        select.innerHTML = '<option value="" disabled selected>Chọn danh sách</option>';
        watchlistOptions.forEach((list) => {
          const option = document.createElement("option");
          option.value = list.id;
          option.textContent = list.name;
          select.appendChild(option);
        });
      } else {
        select.innerHTML = '<option disabled>Không có danh sách nào</option>';
      }
    })
    .catch((error) => {
      console.error("Lỗi khi load danh sách:", error);
      select.innerHTML = '<option disabled>Lỗi khi tải danh sách</option>';
    });
}

function addToWatchlist(movieId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    return;
  }

  const popup = document.getElementById("watchlistPopup");
  console.log("Popup element:", popup);
  if (!popup) {
    console.error("Popup không tồn tại. Vui lòng kiểm tra HTML.");
    alert("Không thể mở popup. Vui lòng thử lại trên trang tài khoản.");
    return;
  }

  popup.style.display = "block";
  loadWatchlistOptions();
  window.currentMovieId = movieId;
}

function closeWatchlistPopup() {
  document.getElementById("watchlistPopup").style.display = "none";
  delete window.currentMovieId;
}

async function confirmAddToWatchlist() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để thực hiện thao tác này.");
    closeWatchlistPopup();
    return;
  }

  const select = document.getElementById("watchlistSelect");
  const listId = select.value;
  const movieId = window.currentMovieId;

  console.log("Token:", token);
  console.log("Movie ID:", movieId);
  console.log("Selected List ID:", listId);

  if (!movieId) {
    alert("Không tìm thấy ID phim.");
    return;
  }

  if (!listId) {
    alert("Vui lòng chọn danh sách.");
    return;
  }

  const selectedList = watchlistOptions.find(list => list.id === parseInt(listId));
  const listType = selectedList ? selectedList.name : null;

  if (!listType) {
    alert("Không tìm thấy loại danh sách tương ứng.");
    return;
  }

  try {
    const response = await fetch('http://localhost/movie_project/src/backend/server.php?controller=movie&method=addToWatchlist', {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ movie_id: movieId, list_type: listType })
    });

    console.log("Fetch Response Status:", response.status);
    const data = await response.json();
    console.log("Add to Watchlist Response:", data);

    if (data.status === "success") {
      alert(`Đã thêm phim vào danh sách "${listType}".`);
      loadWatchlistMovies();
      loadFavoriteMovies();
      loadWatchHistory();
    } else {
      alert("Lỗi: " + (data.message || "Không thể thêm vào watchlist"));
    }
  } catch (error) {
    console.error("Lỗi khi thêm vào watchlist:", error);
    alert("Không thể thêm phim vào danh sách xem sau. Chi tiết: " + error.message);
  } finally {
    closeWatchlistPopup();
  }
}

function openCreateWatchlistPopup() {
  const popup = document.getElementById("createWatchlistPopup");
  if (popup) {
    document.getElementById("newWatchlistName").value = "";
    popup.style.display = "block";
    console.log("Popup đã mở:", popup);
  } else {
    console.error("Không tìm thấy phần tử createWatchlistPopup. Vui lòng kiểm tra HTML.");
    alert("Không thể mở popup. Vui lòng kiểm tra lại trang.");
  }
}

function closeCreateWatchlistPopup() {
  const popup = document.getElementById("createWatchlistPopup");
  if (popup) {
    popup.style.display = "none";
  }
}

async function confirmCreateWatchlist() {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Bạn cần đăng nhập để tạo danh sách.");
    closeCreateWatchlistPopup();
    return;
  }

  const listName = document.getElementById("newWatchlistName").value.trim();
  if (!listName) {
    alert("Vui lòng nhập tên danh sách.");
    return;
  }

  console.log("Gửi request với token:", token, "và listName:", listName);

  try {
    const response = await fetch(`${API_BASE}?controller=movie&method=createWatchlist`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ list_type: listName })
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);

    if (data.status === "success") {
      alert("Tạo danh sách thành công!");
      closeCreateWatchlistPopup();
      loadWatchlistOptions();
      loadWatchlistMovies();
    } else {
      alert("Lỗi: " + (data.message || "Không thể tạo danh sách."));
    }
  } catch (error) {
    console.error("Lỗi khi tạo danh sách:", error);
    alert("Đã xảy ra lỗi khi tạo danh sách. Chi tiết: " + error.message);
  }
}