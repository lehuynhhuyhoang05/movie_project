document.addEventListener("DOMContentLoaded", function () {
  const API_BASE = 'http://localhost/movie_project/src/backend/server.php';
  const token = localStorage.getItem('token');
  const addGenreForm = document.getElementById("addGenreForm");
  const genreList = document.getElementById("genreList");
  const genreInput = document.getElementById("genreName");
  const submitBtn = addGenreForm.querySelector('button[type="submit"]');
  let editingGenre = null;

  if (!submitBtn) {
    console.error("Button submit not found in form!");
    alert("Không tìm thấy nút submit trong form!");
    return;
  }

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
    if (!genre || !genre.id) {
      console.error("Genre object is invalid:", genre);
      alert("Không thể thêm thể loại vào danh sách: Dữ liệu không hợp lệ.");
      return;
    }
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
      alert("Đã xảy ra lỗi khi tải thể loại!");
    }
  }

  addGenreForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    let newGenreRaw = genreInput.value.trim();
    if (!newGenreRaw) return alert("Vui lòng nhập tên thể loại!");
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
          alert("Lỗi khi sửa thể loại: " + (data.message || "Không thể sửa thể loại."));
        }
      } catch (err) {
        console.error("Lỗi sửa thể loại:", err);
        alert("Đã xảy ra lỗi khi sửa thể loại!");
      }
    } else {
      try {
        const res = await fetch(`${API_BASE}?controller=genre&method=create&token=Bearer%20${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newGenre })
        });
        const data = await res.json();
        if (data.status === "success" && data.data) {
          addGenreToList(data.data);
          alert("Đã thêm thể loại mới!");
          addGenreForm.reset();
          await loadGenres();
        } else {
          alert("Lỗi khi thêm thể loại: " + (data.message || "Dữ liệu trả về không hợp lệ."));
        }
      } catch (err) {
        console.error("Lỗi thêm thể loại:", err);
        alert("Đã xảy ra lỗi khi thêm thể loại!");
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
      try {
        const checkRes = await fetch(`${API_BASE}?controller=genre&method=checkGenreMovies&id=${id}&token=Bearer%20${token}`);
        const checkData = await checkRes.json();
        let warningMessage = "Bạn có chắc muốn xóa thể loại này không?";
        if (checkData.status === "success" && checkData.movieCount > 0) {
          warningMessage = `Cảnh báo: Thể loại này đang được sử dụng bởi ${checkData.movieCount} phim. Nếu xóa, các phim này sẽ mất thông tin thể loại (genre_id sẽ được đặt thành NULL). Bạn có chắc muốn tiếp tục?`;
        } else {
          warningMessage = "Bạn có chắc muốn xóa thể loại này không? Hành động này không thể hoàn tác.";
        }

        if (confirm(warningMessage)) {
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
            alert("Lỗi khi xóa thể loại: " + (data.message || "Không thể xóa thể loại."));
          }
        }
      } catch (err) {
        console.error("Lỗi xóa thể loại:", err);
        alert("Đã xảy ra lỗi khi xóa thể loại!");
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