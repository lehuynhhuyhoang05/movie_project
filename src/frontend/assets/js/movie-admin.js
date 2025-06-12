// movie-admin.js
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = 'http://movieon.atwebpages.com/src/backend/server.php';
  const token = localStorage.getItem('token');
  const addMovieForm = document.getElementById("addMovieForm");
  const movieList = document.getElementById("movieList");
  const submitBtn = addMovieForm.querySelector('button[type="submit"]');
  const titleInput = document.getElementById("movieTitle");
  const genreInput = document.getElementById("movieGenre");
  const searchInput = document.getElementById("searchMoviesInput");
  const searchBtn = document.getElementById("searchMoviesBtn");
  let editingMovieId = null;
  let genreMap = {};

  const genreTranslation = {
    "Action": "Hành động", "Adventure": "Phiêu lưu", "Animation": "Hoạt hình", "Comedy": "Hài",
    "Crime": "Tội phạm", "Documentary": "Tài liệu", "Drama": "Chính kịch", "Family": "Gia đình",
    "Fantasy": "Giả tưởng", "History": "Lịch sử", "Horror": "Kinh dị", "Music": "Âm nhạc",
    "Mystery": "Bí ẩn", "Romance": "Lãng mạn", "Science Fiction": "Khoa học viễn tưởng",
    "TV Movie": "Phim truyền hình", "Thriller": "Gây cấn", "War": "Chiến tranh", "Western": "Cao bồi viễn tây"
  };

  function capitalizeWords(str) {
    return str.toLowerCase().split(' ').filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  async function loadGenres() {
    try {
      const res = await fetch(`${API_BASE}?controller=genre&method=index&token=Bearer%20${token}`);
      const data = await res.json();
      if (data.status === 'success') {
        data.data.forEach(g => genreMap[g.id] = g.name);
      } else {
        alert("Lỗi khi tải thể loại: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi khi tải thể loại:", err);
    }
  }

  function translateGenre(name) {
    return genreTranslation[name] || name || "Không rõ";
  }

  function renderMovieItem(movie) {
    const li = document.createElement("li");
    li.dataset.id = movie.id;
    const genreNameEn = genreMap[movie.genre_id] || "Không rõ";
    const genreNameVi = translateGenre(genreNameEn);
    li.innerHTML = `<strong>${movie.title}</strong> - <span class="movie-genre">${genreNameVi}</span><div class="button-group"><button class="editMovieBtn">Sửa</button><button class="deleteMovieBtn">Xóa</button></div>`;
    movieList.appendChild(li);
  }

  function getGenreIdByName(name) {
    name = name.toLowerCase();
    for (const id in genreMap) {
      const genreEn = genreMap[id].toLowerCase();
      const genreVi = genreTranslation[capitalizeWords(genreMap[id])] ? genreTranslation[capitalizeWords(genreMap[id])].toLowerCase() : null;
      if (name === genreEn || name === (genreVi || "")) return id;
    }
    return null;
  }

  async function loadMovies() {
    await loadGenres();
    try {
      const res = await fetch(`${API_BASE}?controller=movie&method=index&token=Bearer%20${token}`);
      const data = await res.json();
      if (data.status === 'success') {
        movieList.innerHTML = '';
        data.data.forEach(movie => renderMovieItem(movie));
        window.chartData = window.chartData || { movies: 0 };
        window.chartData.movies = data.total || data.data.length;
        if (window.updateChart) window.updateChart(window.currentActiveIndex);
      } else {
        alert("Không thể tải danh sách phim.");
      }
    } catch (err) {
      console.error("Lỗi khi tải phim:", err);
    }
  }

  async function searchMovies(keyword) {
    if (!keyword.trim()) return loadMovies();
    try {
      const url = `${API_BASE}?controller=movie&method=search&keyword=${encodeURIComponent(keyword)}&token=Bearer%20${token}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'success') {
        movieList.innerHTML = '';
        if (data.data.length === 0) {
          movieList.innerHTML = '<li>Không tìm thấy phim phù hợp.</li>';
        } else {
          data.data.forEach(movie => renderMovieItem(movie));
        }
      } else {
        alert("Lỗi tìm kiếm phim: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi tìm kiếm phim:", err);
      alert("Lỗi khi tìm kiếm phim.");
    }
  }

  addMovieForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const titleRaw = titleInput.value.trim();
    const genreRaw = genreInput.value.trim();
    if (!titleRaw || !genreRaw) return;
    const title = capitalizeWords(titleRaw);
    const genreName = capitalizeWords(genreRaw);
    const genreId = getGenreIdByName(genreName);
    if (!genreId) {
      alert("Thể loại không hợp lệ hoặc chưa tồn tại.");
      return;
    }

    if (editingMovieId) {
      try {
        const res = await fetch(`${API_BASE}?controller=movie&method=update&id=${editingMovieId}&token=Bearer%20${token}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, genre_id: genreId })
        });
        const data = await res.json();
        if (data.status === 'success') {
          alert("Đã cập nhật phim!");
          loadMovies();
          editingMovieId = null;
          submitBtn.textContent = "Thêm";
          addMovieForm.reset();
        } else {
          alert("Lỗi khi cập nhật phim: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi cập nhật:", err);
      }
    } else {
      try {
        const res = await fetch(`${API_BASE}?controller=movie&method=create&token=Bearer%20${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, genre_id: genreId })
        });
        const data = await res.json();
        if (data.status === 'success') {
          alert("Đã thêm phim mới!");
          loadMovies();
          addMovieForm.reset();
        } else {
          alert("Lỗi khi thêm phim: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi thêm phim:", err);
      }
    }
  });

  movieList.addEventListener("click", async function (e) {
    const btn = e.target;
    const li = btn.closest("li");
    if (!li) return;
    const movieId = li.dataset.id;
    if (btn.classList.contains("deleteMovieBtn")) {
      if (!confirm("Bạn có chắc muốn xóa phim này không?")) return;
      try {
        const res = await fetch(`${API_BASE}?controller=movie&method=delete&id=${movieId}&token=Bearer%20${token}`, {
          method: 'DELETE'
        });
        const data = await res.json();
        if (data.status === 'success') {
          alert("Đã xóa phim.");
          loadMovies();
        } else {
          alert("Lỗi khi xóa: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi xóa phim:", err);
      }
    }
    if (btn.classList.contains("editMovieBtn")) {
      const title = li.querySelector("strong").textContent;
      const genreNameVi = li.querySelector(".movie-genre").textContent;
      titleInput.value = title;
      genreInput.value = genreNameVi;
      editingMovieId = movieId;
      submitBtn.textContent = "Lưu";
    }
  });

  searchBtn.addEventListener("click", function () {
    const keyword = searchInput.value;
    searchMovies(keyword);
  });

  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBtn.click();
    }
  });

  loadMovies();
});