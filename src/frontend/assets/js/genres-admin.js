// genres-admin.js
document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = 'http://localhost/movie_project/src/backend/server.php';
  const token = localStorage.getItem('token');
  const addGenreForm = document.getElementById("addGenreForm");
  const genreList = document.getElementById("genreList");
  const genreInput = document.getElementById("genreName");
  const submitBtn = addGenreForm.querySelector('button[type="submit"]');
  let editingGenre = null;

  const genreTranslation = {
    "Action": "Hành động", "Adventure": "Phiêu lưu", "Animation": "Hoạt hình", "Comedy": "Hài",
    "Crime": "Tội phạm", "Documentary": "Tài liệu", "Drama": "Chính kịch", "Family": "Gia đình",
    "Fantasy": "Giả tưởng", "History": "Lịch sử", "Horror": "Kinh dị", "Music": "Âm nhạc",
    "Mystery": "Bí ẩn", "Romance": "Lãng mạn", "Science Fiction": "Khoa học viễn tưởng",
    "Thriller": "Gây cấn", "War": "Chiến tranh", "Western": "Cao bồi viễn tây", "TV Movie": "Phim truyền hình"
  };

  function capitalizeWords(str) {
    return str.toLowerCase().split(' ').filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  function addGenreToList(genre) {
    const li = document.createElement("li");
    li.dataset.id = genre.id;
    const nameViet = genreTranslation[genre.name] || genre.name;
    li.innerHTML = `<strong>${nameViet}</strong><div class="button-group"><button class="editBtn">Sửa</button><button class="deleteBtn">Xóa</button></div>`;
    genreList.appendChild(li);
  }

  async function loadGenres() {
    try {
      const res = await fetch(`${API_BASE}?controller=genre&method=index&token=Bearer%20${token}`);
      const data = await res.json();
      if (data.status === "success") {
        genreList.innerHTML = "";
        data.data.forEach(genre => addGenreToList(genre));
        window.chartData = window.chartData || { genres: 0 };
        window.chartData.genres = data.total || data.data.length;
        if (window.updateChart) window.updateChart(window.currentActiveIndex);
      } else {
        alert("Lỗi khi tải thể loại: " + data.message);
      }
    } catch (err) {
      console.error("Lỗi tải thể loại:", err);
    }
  }

  addGenreForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    let newGenreRaw = genreInput.value.trim();
    if (!newGenreRaw) return;
    const newGenre = capitalizeWords(newGenreRaw);

    if (editingGenre) {
      try {
        const res = await fetch(`${API_BASE}?controller=genre&method=update&id=${editingGenre.id}&token=Bearer%20${token}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newGenre })
        });
        const data = await res.json();
        if (data.status === "success") {
          const nameViet = genreTranslation[newGenre] || newGenre;
          editingGenre.li.querySelector("strong").textContent = nameViet;
          alert("Đã sửa thể loại thành công!");
          editingGenre = null;
          submitBtn.textContent = "Thêm";
          addGenreForm.reset();
          await loadGenres();
        } else {
          alert("Lỗi khi sửa thể loại: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi sửa thể loại:", err);
      }
    } else {
      try {
        const res = await fetch(`${API_BASE}?controller=genre&method=create&token=Bearer%20${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newGenre })
        });
        const data = await res.json();
        if (data.status === "success") {
          addGenreToList(data.data);
          alert("Đã thêm thể loại mới!");
          addGenreForm.reset();
          await loadGenres();
        } else {
          alert("Lỗi khi thêm thể loại: " + data.message);
        }
      } catch (err) {
        console.error("Lỗi thêm thể loại:", err);
      }
    }
  });

  genreList.addEventListener("click", async function (e) {
    const target = e.target;
    const li = target.closest("li");
    if (!li) return;
    const id = li.dataset.id;

    if (target.classList.contains("deleteBtn")) {
      if (!id) return alert("Không có ID thể loại để xóa.");
      if (confirm("Bạn có chắc muốn xóa thể loại này không?")) {
        try {
          const res = await fetch(`${API_BASE}?controller=genre&method=delete&id=${id}&token=Bearer%20${token}`, {
            method: "DELETE"
          });
          const data = await res.json();
          if (data.status === "success") {
            li.remove();
            alert("Đã xóa thể loại thành công.");
            if (editingGenre && editingGenre.id === id) {
              editingGenre = null;
              addGenreForm.reset();
              submitBtn.textContent = "Thêm";
            }
            await loadGenres();
          } else {
            alert("Lỗi khi xóa thể loại: " + data.message);
          }
        } catch (err) {
          console.error("Lỗi xóa thể loại:", err);
        }
      }
    }

    if (target.classList.contains("editBtn")) {
      const currentName = li.querySelector("strong").textContent.trim();
      const originalName = Object.keys(genreTranslation).find(key => genreTranslation[key] === currentName) || currentName;
      genreInput.value = originalName;
      editingGenre = { id: id, li: li };
      submitBtn.textContent = "Lưu";
      alert("Bạn đang sửa thể loại: " + currentName);
    }
  });

  loadGenres();
});