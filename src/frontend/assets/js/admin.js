  // 1. Hiển thị trang theo menu
  function showPage(pageId) {
    const pages = document.querySelectorAll(".page-section");
    pages.forEach(page => page.classList.add("hidden"));
    document.getElementById(pageId).classList.remove("hidden");

    const titles = {
      dashboard: "Trang tổng quan",
      genres: "Quản Lý Thể Loại",
      movies: "Quản Lý Phim",
      review: "Quản Lý Đánh Giá",
      users: "Quản Lý Người Dùng"
    };
    document.getElementById("page-title").textContent = titles[pageId] || "";

    const links = document.querySelectorAll("aside nav a");
    links.forEach(link => link.classList.remove("active-link"));
    links.forEach(link => {
      if (link.textContent.trim().toLowerCase() === pageId) {
        link.classList.add("active-link");
      }
    });
  }

  // 2. Mặc định trang dashboard
  showPage("dashboard");

document.addEventListener("DOMContentLoaded", function () {
  const addGenreForm = document.getElementById("addGenreForm");
  const genreList = document.getElementById("genreList");
  const genreInput = document.getElementById("genreName");
  const submitBtn = addGenreForm.querySelector('button[type="submit"]');
  let editingGenre = null;

  // Hàm viết hoa chữ cái đầu mỗi từ
  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  addGenreForm.addEventListener("submit", function (e) {
    e.preventDefault();
    let newGenreRaw = genreInput.value.trim();
    if (!newGenreRaw) return;

    // Viết hoa chữ đầu mỗi từ
    const newGenre = capitalizeWords(newGenreRaw);

    if (editingGenre) {
      // Cập nhật thể loại đang sửa
      editingGenre.querySelector("strong").textContent = newGenre;
      alert("Đã sửa thể loại thành công!");
      editingGenre = null;
      submitBtn.textContent = "Thêm"; // Đổi nút về Thêm khi sửa xong
    } else {
      // Thêm thể loại mới với cấu trúc HTML mới
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${newGenre}</strong>
        <div class="button-group">
          <button class="editBtn">Sửa</button>
          <button class="deleteBtn">Xóa</button>
        </div>
      `;
      genreList.appendChild(li);
      alert("Đã thêm thể loại mới!");
    }

    addGenreForm.reset();
  });

  genreList.addEventListener("click", function (e) {
    const target = e.target;
    const li = target.closest("li");

    if (target.classList.contains("deleteBtn")) {
      if (confirm("Bạn có chắc muốn xóa thể loại này không?")) {
        li.remove();
        alert("Đã xóa thể loại thành công.");
        if (editingGenre === li) {
          editingGenre = null;
          addGenreForm.reset();
          submitBtn.textContent = "Thêm";
        }
      }
    }

    if (target.classList.contains("editBtn")) {
      const currentName = li.querySelector("strong").textContent.trim();
      genreInput.value = currentName;
      editingGenre = li;
      submitBtn.textContent = "Lưu"; // Đổi nút thành Lưu khi đang sửa
      alert("Bạn đang sửa thể loại: " + currentName);
    }
  });
});



  // 5. Thống kê - click thẻ -> hiện biểu đồ
  const cards = document.querySelectorAll(".stats .card");
  const chart = document.querySelector(".chart");

  const chartData = [
    "Biểu đồ thống kê tổng số phim trong 12 tháng gần đây.",
    "Biểu đồ số lượng người dùng mới theo tháng.",
    "Biểu đồ trung bình đánh giá của người xem.",
    "Biểu đồ số lượng thể loại đang được sử dụng."
  ];

  let currentActiveIndex = null;

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      if (currentActiveIndex === index) {
        card.classList.remove("active");
        chart.textContent = chartData[0];
        currentActiveIndex = null;
        return;
      }

      showPage("dashboard");

      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      chart.textContent = chartData[index];
      currentActiveIndex = index;
    });
  });

  // 6. Xử lý thêm, sửa, xóa phim
document.addEventListener("DOMContentLoaded", function () {
  const addMovieForm = document.getElementById("addMovieForm");
  const movieList = document.getElementById("movieList");
  const submitBtn = addMovieForm.querySelector('button[type="submit"]');
  let editingMovie = null;

  // Hàm viết hoa chữ cái đầu mỗi từ
  function capitalizeWords(str) {
    return str
      .toLowerCase()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  addMovieForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const titleInput = document.getElementById("movieTitle");
    const genreInput = document.getElementById("movieGenre");

    const titleRaw = titleInput.value.trim();
    const genreRaw = genreInput.value.trim();

    if (!titleRaw || !genreRaw) return;

    const title = capitalizeWords(titleRaw);
    const genre = capitalizeWords(genreRaw);

    if (editingMovie) {
      // Sửa phim
      editingMovie.querySelector("strong").textContent = title;
      editingMovie.querySelector(".movie-genre").textContent = genre;
      alert("Đã sửa phim thành công!");
      editingMovie = null;
      submitBtn.textContent = "Thêm";
    } else {
      // Thêm phim mới, dùng &nbsp; để chắc chắn khoảng trắng
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${title}</strong>&nbsp;-&nbsp;<span class="movie-genre">${genre}</span>
        <div class="button-group">
          <button class="editMovieBtn">Sửa</button>
          <button class="deleteMovieBtn">Xóa</button>
        </div>
      `;
      movieList.appendChild(li);
      alert("Đã thêm phim mới!");
    }

    addMovieForm.reset();
  });

  movieList.addEventListener("click", function (e) {
    const target = e.target;

    if (target.classList.contains("deleteMovieBtn")) {
      const li = target.closest("li");
      if (confirm("Bạn có chắc muốn xóa phim này không?")) {
        li.remove();
        alert("Đã xóa phim thành công.");
        if (editingMovie === li) {
          editingMovie = null;
          addMovieForm.reset();
          submitBtn.textContent = "Thêm";
        }
      }
    }

    if (target.classList.contains("editMovieBtn")) {
      const li = target.closest("li");
      const title = li.querySelector("strong").textContent;
      const genre = li.querySelector(".movie-genre").textContent;

      document.getElementById("movieTitle").value = title;
      document.getElementById("movieGenre").value = genre;
      editingMovie = li;
      submitBtn.textContent = "Lưu";
      alert("Bạn đang sửa phim: " + title);
    }
  });
});


// review
document.addEventListener("DOMContentLoaded", function () {
  const reviewList = document.getElementById("reviewList");
  const filterStars = document.getElementById("filterStars");

  let editingReview = null;
  function addButtonsToReview(li) {
    if (li.querySelector(".button-group")) return;

    const header = li.querySelector(".review-header");
    const content = li.querySelector(".review-content");
    const ratingSpan = li.querySelector(".review-rating");

    const hasHeader = header && header.textContent.trim() !== "";
    const hasRating = ratingSpan && ratingSpan.textContent.trim().length > 0;
    const hasContent = content && content.textContent.trim() !== "";

    if (!hasHeader || !hasRating || !hasContent) return; 

    const btnGroup = document.createElement("div");
    btnGroup.className = "button-group";
    btnGroup.innerHTML = `
      <button class="approveReviewBtn">Phê duyệt</button>
      <button class="editReviewBtn">Sửa</button>
      <button class="deleteReviewBtn">Xóa</button>
      <button class="saveReviewBtn" style="display:none;">Lưu</button>
    `;
    li.appendChild(btnGroup);

    if (!li.dataset.approved) {
      li.dataset.approved = "false";
    }
    content.style.opacity = li.dataset.approved === "true" ? "1" : "0.6";
  }
  reviewList.querySelectorAll("li").forEach(addButtonsToReview);

  // Xử lý các hành động trên review
  reviewList.addEventListener("click", function (e) {
    const target = e.target;
    const li = target.closest("li");
    if (!li) return;

    const contentDiv = li.querySelector(".review-content");
    const headerDiv = li.querySelector(".review-header");
    const ratingSpan = headerDiv.querySelector(".review-rating");
    const approveBtn = li.querySelector(".approveReviewBtn");
    const editBtn = li.querySelector(".editReviewBtn");
    const deleteBtn = li.querySelector(".deleteReviewBtn");
    const saveBtn = li.querySelector(".saveReviewBtn");

    // Xóa đánh giá
    if (target === deleteBtn) {
      if (confirm("Bạn có chắc muốn xóa đánh giá này không?")) {
        if (editingReview === li) editingReview = null;
        li.remove();
      }
    }

    // Phê duyệt đánh giá
    else if (target === approveBtn) {
      li.dataset.approved = "true";
      contentDiv.style.opacity = "1";
      approveBtn.style.display = "none";
      alert("Đã phê duyệt đánh giá.");
    }

    // Sửa đánh giá
    else if (target === editBtn) {
      if (editingReview) {
        alert("Bạn đang chỉnh sửa đánh giá khác, vui lòng lưu hoặc hủy trước.");
        return;
      }
      editingReview = li;

      contentDiv.contentEditable = "true";
      contentDiv.style.border = "1px solid #ccc";
      contentDiv.style.padding = "6px";
      contentDiv.style.borderRadius = "4px";

      const nameText = headerDiv.childNodes[0].textContent.trim();
      const ratingCount = ratingSpan.textContent.trim().length;

      const nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = nameText;
      nameInput.style.fontWeight = "bold";
      nameInput.style.fontSize = "16px";
      nameInput.style.marginRight = "8px";

      const ratingSelect = document.createElement("select");
      for (let i = 5; i >= 1; i--) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i + " sao";
        if (i === ratingCount) opt.selected = true;
        ratingSelect.appendChild(opt);
      }

      headerDiv.textContent = "";
      headerDiv.appendChild(nameInput);
      headerDiv.appendChild(ratingSelect);

      editBtn.style.display = "none";
      saveBtn.style.display = "inline-block";
      approveBtn.style.display = "none";
    }

    // Lưu đánh giá sau khi sửa
    else if (target === saveBtn) {
      if (!editingReview) return;

      const headerDiv = editingReview.querySelector(".review-header");
      const nameInput = headerDiv.querySelector("input[type=text]");
      const ratingSelect = headerDiv.querySelector("select");
      const contentDiv = editingReview.querySelector(".review-content");

      const newName = nameInput.value.trim();
      const newRating = ratingSelect.value;
      const newContent = contentDiv.textContent.trim();

      if (!newName || !newContent || !newRating) {
        alert("Vui lòng điền đầy đủ tên, nội dung và chọn số sao.");
        return;
      }

      headerDiv.textContent = `${newName} `;
      const newRatingSpan = document.createElement("span");
      newRatingSpan.className = "review-rating";
      newRatingSpan.textContent = "⭐".repeat(newRating);
      headerDiv.appendChild(newRatingSpan);

      contentDiv.textContent = newContent;
      contentDiv.contentEditable = "false";
      contentDiv.style.border = "none";
      contentDiv.style.padding = "0";

      editingReview.querySelector(".editReviewBtn").style.display = "inline-block";
      saveBtn.style.display = "none";

      if (editingReview.dataset.approved !== "true") {
        contentDiv.style.opacity = "0.6";
        editingReview.querySelector(".approveReviewBtn").style.display = "inline-block";
      }

      alert("Đã lưu đánh giá.");
      editingReview = null;
    }
  });

  // Lọc đánh giá theo số sao
  filterStars.addEventListener("change", function () {
    const val = this.value;
    reviewList.querySelectorAll("li").forEach(li => {
      const ratingSpan = li.querySelector(".review-rating");
      const ratingCount = ratingSpan ? ratingSpan.textContent.trim().length : 0;
      if (val === "all" || parseInt(val) === ratingCount) {
        li.style.display = "flex";
      } else {
        li.style.display = "none";
      }
    });
  });
});



//USER
// Biến lưu dữ liệu người dùng
let users = [];

// Lấy dữ liệu mẫu từ tbody hiện tại
function loadUsersFromTable() {
  const rows = document.querySelectorAll("#userTable tbody tr");
  const loadedUsers = [];

  rows.forEach((row, index) => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 0) return;

    loadedUsers.push({
      id: index + 1,
      name: cells[0].textContent.trim(),
      email: cells[1].textContent.trim(),
      role: cells[2].textContent.trim().toLowerCase(),
      status: parseStatus(cells[3].textContent.trim()),
      createdAt: cells[4].textContent.trim()
    });
  });

  return loadedUsers;
}

// Chuyển trạng thái hiển thị về lowercase dùng nội bộ
function parseStatus(statusText) {
  if (statusText.toLowerCase().includes("hoạt")) return "active";
  if (statusText.toLowerCase().includes("khóa")) return "locked";
  return statusText.toLowerCase();
}

// Viết hoa chữ cái đầu từng từ trong tên
function capitalizeWords(str) {
  return str.trim().split(/\s+/).map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(" ");
}

// Viết hoa chữ cái đầu (vai trò)
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Trạng thái hiển thị theo chuẩn
function capitalizeStatus(str) {
  if (str === "active") return "Hoạt động";
  if (str === "locked") return "Bị khóa";
  return str;
}

// Hiển thị danh sách người dùng
function renderUsers() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";

  users.forEach(user => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${capitalize(user.role)}</td>
      <td>${capitalizeStatus(user.status)}</td>
      <td>${user.createdAt}</td>
      <td>
        <button class="action-btn editBtn" data-id="${user.id}">Sửa</button>
        <button class="action-btn deleteBtn" data-id="${user.id}">Xóa</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  attachRowEvent();
}

// Gán sự kiện cho nút sửa và xóa
function attachRowEvent() {
  document.querySelectorAll(".editBtn").forEach(btn => {
    btn.onclick = () => {
      const id = +btn.dataset.id;
      startEditUser(id);
    };
  });

  document.querySelectorAll(".deleteBtn").forEach(btn => {
    btn.onclick = () => {
      const id = +btn.dataset.id;
      if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
        deleteUser(id);
      }
    };
  });
}

// Tìm vị trí user theo ID
function findUserIndexById(id) {
  return users.findIndex(u => u.id === id);
}

// Bắt đầu sửa
function startEditUser(id) {
  const idx = findUserIndexById(id);
  if (idx === -1) return alert("Không tìm thấy người dùng!");

  const user = users[idx];
  document.getElementById("editUserId").value = user.id;
  document.getElementById("userName").value = user.name;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userRole").value = user.role;
  document.getElementById("userStatus").value = user.status;
  document.getElementById("userPassword").value = "";

  document.getElementById("formTitle").textContent = "Sửa Người Dùng";
  document.getElementById("cancelEdit").style.display = "inline-block";
}

// Xóa user theo ID
function deleteUser(id) {
  users = users.filter(u => u.id !== id);
  renderUsers();
  updateStats();
}

// Reset form
function resetForm() {
  document.getElementById("editUserId").value = "";
  document.getElementById("userForm").reset();
  document.getElementById("formTitle").textContent = "Thêm Người Dùng Mới";
  document.getElementById("cancelEdit").style.display = "none";
}

// Lưu người dùng
function saveUser(event) {
  event.preventDefault();

  const id = document.getElementById("editUserId").value;
  let name = document.getElementById("userName").value.trim();
  const email = document.getElementById("userEmail").value.trim();
  const role = document.getElementById("userRole").value;
  const status = document.getElementById("userStatus").value;
  const password = document.getElementById("userPassword").value.trim();

  // Bắt buộc nhập tên đủ 2 từ (họ và tên)
  if (!name || name.split(/\s+/).length < 2) {
    alert("Vui lòng nhập họ và tên đầy đủ họ và tên.");
    return;
  }

  if (!email || !role || !status) {
    alert("Vui lòng nhập đầy đủ thông tin.");
    return;
  }

  // Viết hoa chữ cái đầu từng từ trong tên
  name = capitalizeWords(name);

  if (id) {
    const idx = findUserIndexById(+id);
    if (idx === -1) {
      alert("Người dùng không tồn tại!");
      return;
    }
    users[idx].name = name;
    users[idx].email = email;
    users[idx].role = role;
    users[idx].status = status;
  } else {
    const newUser = {
      id: users.length ? users[users.length - 1].id + 1 : 1,
      name,
      email,
      role,
      status,
      createdAt: new Date().toISOString().slice(0, 10)
    };
    users.push(newUser);
  }

  resetForm();
  renderUsers();
  updateStats();
}

// Cập nhật thống kê
function updateStats() {
  document.getElementById("totalUsers").textContent = users.length;
  const today = new Date().toISOString().slice(0, 10);
  const newTodayCount = users.filter(u => u.createdAt === today).length;
  document.getElementById("newToday").textContent = newTodayCount;
  const lockedCount = users.filter(u => u.status === "locked").length;
  document.getElementById("lockedUsers").textContent = lockedCount;
}

// Tìm kiếm thông minh
function filterUsers() {
  const search = document.getElementById("searchUser").value.toLowerCase();
  const roleFilter = document.getElementById("filterRole").value;
  const statusFilter = document.getElementById("filterStatus").value;

  const filtered = users.filter(user => {
    const matchSearch =
      removeVietnameseTones(user.name).toLowerCase().includes(removeVietnameseTones(search)) ||
      removeVietnameseTones(user.email).toLowerCase().includes(removeVietnameseTones(search)) ||
      removeVietnameseTones(capitalizeStatus(user.status)).toLowerCase().includes(removeVietnameseTones(search)) ||
      removeVietnameseTones(user.role).toLowerCase().includes(removeVietnameseTones(search));

    const matchRole = roleFilter === "all" || user.role === roleFilter;
    const matchStatus = statusFilter === "all" || user.status === statusFilter;

    return matchSearch && matchRole && matchStatus;
  });

  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = "";

  filtered.forEach(user => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${capitalize(user.role)}</td>
      <td>${capitalizeStatus(user.status)}</td>
      <td>${user.createdAt}</td>
      <td>
        <button class="action-btn editBtn" data-id="${user.id}">Sửa</button>
        <button class="action-btn deleteBtn" data-id="${user.id}">Xóa</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  attachRowEvent();
}

// Xóa dấu tiếng Việt để tìm kiếm thông minh
function removeVietnameseTones(str) {
  return str.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/Đ/g, "D");
}

// Sự kiện các nút
document.getElementById("cancelEdit").onclick = () => {
  resetForm();
};

document.getElementById("userForm").addEventListener("submit", saveUser);
document.getElementById("searchUser").addEventListener("input", filterUsers);
document.getElementById("filterRole").addEventListener("change", filterUsers);
document.getElementById("filterStatus").addEventListener("change", filterUsers);

// Hàm khởi tạo khi trang load
function init() {
  users = loadUsersFromTable();
  renderUsers();
  updateStats();
}

window.onload = init;



//LOGOUT
function toggleLogoutMenu() {
  const menu = document.getElementById("logoutMenu");
  menu.classList.toggle("hidden");
}
// Tắt menu nếu click ra ngoài
document.addEventListener("click", function (e) {
  const userIcon = document.getElementById("userIcon");
  const logoutMenu = document.getElementById("logoutMenu");
  if (!userIcon.contains(e.target) && !logoutMenu.contains(e.target)) {
    logoutMenu.classList.add("hidden");
  }
});
