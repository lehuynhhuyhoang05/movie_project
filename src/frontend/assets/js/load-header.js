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
            a.textContent = genre.name;
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

  // Lấy param URL (nếu có)
  const urlParams = new URLSearchParams(window.location.search);

  // Highlight các link trong nav-menu
  document.querySelectorAll(".nav-menu a").forEach(link => {
    const href = link.getAttribute("href");
    const hrefPath = href.split("?")[0]; // Lấy phần path trước dấu hỏi

    // Nếu đang ở trang details.html và link là genre.html thì vẫn highlight nếu có id param
    if (
      (currentPath === hrefPath) ||
      (currentPath === "details.html" && hrefPath === "genre.html" && urlParams.has("id"))
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
