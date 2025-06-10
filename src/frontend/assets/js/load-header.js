document.addEventListener("DOMContentLoaded", () => {
  // Load header từ file HTML
  fetch('../components/header.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;

      // Cập nhật hiển thị header theo trạng thái đăng nhập
      updateHeaderDisplay();

      // Khởi tạo thông báo tùy theo trạng thái đăng nhập
      if (typeof initNotifications === "function") {
        const userData = localStorage.getItem("user");
        if (userData) {
          initNotifications("User");
        } else {
          initNotifications("Guest");
        }
      }

      // Lấy danh sách thể loại phim và gán vào dropdown
      fetchGenres();

      // Highlight menu sau khi header đã được load vào DOM
      highlightMenu();
    })
    .catch(error => console.error("Lỗi load header:", error));
});

// Hiển thị header phù hợp với trạng thái đăng nhập
function updateHeaderDisplay() {
  const headerGuest = document.getElementById("header-guest");
  const headerUser = document.getElementById("header-user");

  if (!headerGuest || !headerUser) {
    console.warn("Không tìm thấy header-guest hoặc header-user trong DOM");
    return;
  }

  const userData = localStorage.getItem("user");
  const isLoggedIn = !!userData;

  headerGuest.hidden = isLoggedIn;
  headerUser.hidden = !isLoggedIn;
}

// Khởi tạo thông báo cho User hoặc Guest
function initNotifications(userType) {
  const notificationBtn = document.getElementById(`notificationBtn${userType}`);
  const notificationPopup = document.getElementById(`notificationPopup${userType}`);
  const closePopupBtn = document.getElementById(`closePopupBtn${userType}`);

  if (!notificationBtn || !notificationPopup || !closePopupBtn) {
    console.warn("Một trong các phần tử thông báo không tồn tại.");
    return;
  }

  notificationBtn.addEventListener("click", () => {
    notificationPopup.removeAttribute("hidden");
  });

  closePopupBtn.addEventListener("click", () => {
    notificationPopup.setAttribute("hidden", "");
  });
}

// Lấy danh sách thể loại phim và gán vào dropdown
function fetchGenres() {
  const dropdownContents = document.querySelectorAll(".dropdownContent");
  if (!dropdownContents.length) {
    console.error("Không tìm thấy dropdownContent trong DOM");
    return;
  }

  fetch("http://movieon.atwebpages.com/src/backend/server.php?controller=genre&method=index")
    .then(res => res.json())
    .then(result => {
      if (result.status !== "success" || !result.data) {
        console.error("Lỗi dữ liệu thể loại:", result);
        return;
      }
      const genres = result.data;

      // Map tên thể loại tiếng Anh sang tiếng Việt
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
  "Western": "Cao bồi viễn tây",
  "TV Movie": "Phim truyền hình"
};


      const columns = [[], []];
      genres.forEach((genre, index) => {
        columns[index % 2].push(genre);
      });

      dropdownContents.forEach(dropdownContent => {
        dropdownContent.innerHTML = "";  // Xóa dữ liệu cũ

        columns.forEach(colGenres => {
          const colDiv = document.createElement("div");
          colDiv.classList.add("column");
          colGenres.forEach(genre => {
            const a = document.createElement("a");
            a.href = `genre.html?id=${genre.id}`;

            // Đổi tên tiếng Anh sang tiếng Việt nếu có
            a.textContent = genreNameMapVi[genre.name] || genre.name || "Không rõ";

            colDiv.appendChild(a);
          });
          dropdownContent.appendChild(colDiv);
        });
      });
    })
    .catch(error => {
      console.error("Lỗi khi fetch thể loại:", error);
    });
}


// Highlight menu tương ứng với trang hiện tại (bao gồm cả nút search)
function highlightMenu() {
  const currentPath = window.location.pathname.split("/").pop();

  const urlParams = new URLSearchParams(window.location.search);

  document.querySelectorAll(".nav-menu a").forEach(link => {
    const href = link.getAttribute("href");
    const hrefPath = href.split("?")[0];

    // Highlight "Diễn viên" khi vào actor.html hoặc actor-detail.html
    if (
      (currentPath === hrefPath) ||
      (currentPath === "details.html" && hrefPath === "genre.html" && urlParams.has("id")) ||
      ( (currentPath === "actor-detail.html" || currentPath === "actor.html") && hrefPath === "actor.html")
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  // Highlight các link trong header-actions (nút Search, Account...)
  document.querySelectorAll(".header-actions a.nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

