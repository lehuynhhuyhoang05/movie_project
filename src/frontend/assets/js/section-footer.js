document.addEventListener("DOMContentLoaded", function () {
  const sidebarLinks = document.querySelectorAll(".sidebar a");
  // Lấy các thẻ h1 có id
  const sections = Array.from(document.querySelectorAll("h1[id]"));
  const headerOffset = 120;

  function getCurrentSectionId() {
    if (sections.length === 0) return ""; // Nếu không có section nào, trả về rỗng

    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const fullHeight = document.documentElement.scrollHeight;

    const nearBottom = (scrollY + viewportHeight) >= (fullHeight - 5);

    if (nearBottom) {
      return sections[sections.length - 1].id;
    }

    for (let i = sections.length - 1; i >= 0; i--) {
      const sectionTop = sections[i].offsetTop;
      if (scrollY + headerOffset >= sectionTop) {
        return sections[i].id;
      }
    }

    return "";
  }

  function updateActiveLink() {
    const currentId = getCurrentSectionId();
    sidebarLinks.forEach((link) => {
      const href = link.getAttribute("href")?.slice(1) || "";
      if (href === currentId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  // Lắng nghe scroll
  window.addEventListener("scroll", updateActiveLink);

  // Smooth scroll và cập nhật active
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href")?.slice(1);
      if (!targetId) return;

      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        window.scrollTo({
          top: targetEl.offsetTop - headerOffset,
          behavior: "smooth"
        });

        setTimeout(updateActiveLink, 700); // chờ scroll smooth xong
      }
    });
  });

  // Nếu truy cập từ link có hash
  if (window.location.hash) {
    const targetId = window.location.hash.slice(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      setTimeout(() => {
        window.scrollTo({
          top: targetEl.offsetTop - headerOffset,
          behavior: "smooth"
        });

        setTimeout(updateActiveLink, 700);
      }, 300);
    }
  }

  // Gọi ban đầu
  updateActiveLink();
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("showUpdateFormBtn");
  const updateForms = document.getElementById("updateForms");

  toggleBtn.addEventListener("click", () => {
    if (updateForms.style.display === "none") {
      updateForms.style.display = "block";
      toggleBtn.textContent = "Ẩn cập nhật";
    } else {
      updateForms.style.display = "none";
      toggleBtn.textContent = "Cập nhật thông tin";
    }
  });
});
