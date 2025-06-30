function initNotifications(userType) {
  const notificationBtn = document.getElementById(`notificationBtn${userType}`);
  const notificationPopup = document.getElementById(`notificationPopup${userType}`);
  const closePopupBtn = document.getElementById(`closePopupBtn${userType}`);
  const notificationList = notificationPopup ? notificationPopup.querySelector('ul') : null;
  const notificationCount = document.getElementById(`notificationCount${userType}`);

  if (!notificationBtn || !notificationPopup || !closePopupBtn || !notificationList || !notificationCount) {
    console.warn(`Một trong các phần tử thông báo cho ${userType} không tồn tại.`, {
      notificationBtn,
      notificationPopup,
      closePopupBtn,
      notificationList,
      notificationCount
    });
    return;
  }

  notificationBtn.addEventListener("click", () => {
    notificationPopup.removeAttribute('hidden');
    loadNotifications(userType);
  });

  closePopupBtn.addEventListener("click", () => {
    notificationPopup.setAttribute('hidden', '');
  });

  async function loadNotifications(userType) {
    const token = localStorage.getItem('token');
    if (!token && userType === 'User') {
      console.warn("No token found, user may not be logged in.");
      notificationList.innerHTML = '<li>Bạn cần đăng nhập để xem thông báo.</li>';
      notificationCount.textContent = '0';
      return;
    }

    try {
      const res = await fetch('http://localhost/movie_project/src/backend/server.php?controller=user&method=getNotifications', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      console.log('API Response:', data); // Debug response
      if (data.status === 'success') {
        notificationList.innerHTML = ''; // Xóa nội dung cũ
        let unread = 0;
        if (data.data.length > 0) {
          data.data.forEach(notification => {
            const li = document.createElement('li');
            li.textContent = notification.content;
            if (notification.is_read === 0) { // Đếm thông báo chưa đọc
              unread++;
            }
            notificationList.appendChild(li);
          });
        } else {
          notificationList.innerHTML = '<li>Không có thông báo nào.</li>';
        }
        notificationCount.textContent = unread > 0 ? unread : '0';
      } else {
        notificationList.innerHTML = `<li>Lỗi: ${data.message}</li>`;
        notificationCount.textContent = '0';
        console.error("Failed to load notifications:", data.message);
      }
    } catch (err) {
      notificationList.innerHTML = '<li>Lỗi khi tải thông báo. Vui lòng thử lại.</li>';
      notificationCount.textContent = '0';
      console.error("Error loading notifications:", err);
    }
  }

  // Tải thông báo ban đầu nếu là User và có token, đồng thời tự động mở popup
  const token = localStorage.getItem('token');
  if (userType === 'User' && token) {
    loadNotifications(userType).then(() => {
      // Mở popup tự động khi vừa đăng nhập
      notificationPopup.removeAttribute('hidden');
      // Đóng popup sau 3 giây
      setTimeout(() => {
        notificationPopup.setAttribute('hidden', '');
      }, 3000); // 3000ms = 3 giây
    });
  }
}

// Khởi tạo thông báo dựa trên trạng thái đăng nhập
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const headerGuest = document.getElementById('header-guest');
  const headerUser = document.getElementById('header-user');

  // Nếu header không tồn tại, chạy fallback dựa trên token
  if (!headerGuest || !headerUser) {
    console.warn('Header elements not found or not loaded yet. Ensure this script runs after header is included.', {
      headerGuest,
      headerUser
    });
    if (token) {
      initNotifications('User');
    } else {
      initNotifications('Guest');
    }
    return;
  }

  // Chuyển đổi header dựa trên token
  if (token) {
    headerGuest.setAttribute('hidden', '');
    headerUser.removeAttribute('hidden');
    initNotifications('User');
  } else {
    headerUser.setAttribute('hidden', '');
    headerGuest.removeAttribute('hidden');
    initNotifications('Guest');
  }
});