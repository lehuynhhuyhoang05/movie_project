function initNotifications(userType) {
  // userType = 'User' hoặc 'Guest', viết hoa chữ đầu để match id
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

  // Bạn có thể thêm code đếm số thông báo, hay load thông báo ở đây
}
