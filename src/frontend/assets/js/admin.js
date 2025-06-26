// Hiển thị trang theo menu
function showPage(pageId) {
    const pages = document.querySelectorAll(".page-section");
    pages.forEach(page => page.classList.add("hidden"));
    document.getElementById(pageId).classList.remove("hidden");
    const titles = {
      dashboard: "Trang tổng quan",
      genres: "Quản Lý Thể Loại",
      movies: "Quản Lý Phim",
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
showPage("dashboard");
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
function toggleBackToAdmin(show) {
  const btn = document.getElementById('backToAdminBtn');
  if (show) {
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}

/* BIỀU ĐỒ TRONG TRANG TÔNG QUÁT  */
const token = localStorage.getItem('token') || 'default-token';
let chartData = { movies: 0, users: 0, genres: 0 };
let overviewChart = null; // Biến toàn cục để lưu đối tượng Chart.js
let currentActiveIndex = null;
// Nhãn cho từng loại biểu đồ
const chartLabels = [
  "Biểu đồ thống kê tổng số phim",
  "Biểu đồ thống kê tổng số người dùng",
  "Biểu đồ thống kê tổng số thể loại"
];

// Màu sắc tương ứng với từng thẻ
const chartColors = {
  background: ['#3498db', '#f1c40f', '#e74c3c'], // Màu nền: xanh dương, vàng, đỏ
  border: ['#2980b9', '#f39c12', '#c0392b'] // Màu viền: xanh dương đậm, vàng đậm, đỏ đậm
};

async function updateTotalMovies() {
  try {
    const response = await fetch('http://localhost/movie_project/src/backend/server.php?controller=movie&method=index');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('Movie API response:', data);
    chartData.movies = data.total || data.data?.length || 571;
    document.querySelector('.card.blue h2').textContent = chartData.movies;
  } catch (error) {
    console.error('Lỗi khi cập nhật tổng số phim:', error);
    chartData.movies = 571;
    document.querySelector('.card.blue h2').textContent = chartData.movies;
  }
  updateChart(currentActiveIndex);
}

async function updateTotalUsers() {
  try {
    const url = `http://localhost/movie_project/src/backend/server.php?controller=user&method=index&token=Bearer%20${token}`;
    console.log('Calling User API with URL:', url);
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('User API response:', data);
    chartData.users = data.total || (Array.isArray(data.data) ? data.data.length : 0);
    document.querySelector('.card:nth-child(2) h2').textContent = chartData.users;
  } catch (error) {
    console.error('Lỗi khi cập nhật tổng số người dùng:', error);
    chartData.users = 0;
    document.querySelector('.card:nth-child(2) h2').textContent = chartData.users;
  }
  updateChart(currentActiveIndex);
}

async function updateTotalGenres() {
  try {
    const response = await fetch('http://localhost/movie_project/src/backend/server.php?controller=genre&method=index');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log('Genre API response:', data);
    chartData.genres = data.total || (Array.isArray(data.data) ? data.data.length : 0);
    document.querySelector('.card.red h2').textContent = chartData.genres;
  } catch (error) {
    console.error('Lỗi khi cập nhật tổng thể loại:', error);
    chartData.genres = 0;
    document.querySelector('.card.red h2').textContent = chartData.genres;
  }
  updateChart(currentActiveIndex);
}

// Khởi tạo biểu đồ
document.addEventListener('DOMContentLoaded', () => {
  // Chèn thẻ canvas động vào div.chart
  const chartDiv = document.querySelector('.chart');
  chartDiv.innerHTML = '<canvas id="overviewChart"></canvas>';

  const ctx = document.getElementById('overviewChart')?.getContext('2d');
  if (ctx) {
    overviewChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Tổng số phim', 'Người dùng', 'Thể loại'],
        datasets: [{
          label: 'Số liệu tổng quát',
          data: [chartData.movies, chartData.users, chartData.genres],
          backgroundColor: chartColors.background, // Màu ban đầu: xanh dương, vàng, đỏ
          borderColor: chartColors.border,
          borderWidth: 1
        }]
      },
      options: {
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Số lượng' } } },
        plugins: { legend: { display: false }, title: { display: true, text: 'Biểu đồ Tổng quát' } }
      }
    });
    window.updateChart = function(index) {
      if (!overviewChart) return;
      if (index === null || index === undefined) {
        // Hiển thị biểu đồ tổng quát
        overviewChart.data.labels = ['Tổng số phim', 'Người dùng', 'Thể loại'];
        overviewChart.data.datasets[0].data = [chartData.movies, chartData.users, chartData.genres];
        overviewChart.data.datasets[0].backgroundColor = chartColors.background; // Màu ban đầu
        overviewChart.data.datasets[0].borderColor = chartColors.border;
        overviewChart.options.plugins.title.text = 'Biểu đồ Tổng quát';
      } else {
        // Hiển thị biểu đồ cho thẻ được chọn
        overviewChart.data.labels = [chartLabels[index].replace('Biểu đồ thống kê ', '')];
        overviewChart.data.datasets[0].data = [
          index === 0 ? chartData.movies : 0,
          index === 1 ? chartData.users : 0,
          index === 2 ? chartData.genres : 0
        ].slice(index, index + 1);
        overviewChart.data.datasets[0].backgroundColor = [chartColors.background[index]]; // Màu của thẻ tương ứng
        overviewChart.data.datasets[0].borderColor = [chartColors.border[index]];
        overviewChart.options.plugins.title.text = chartLabels[index];
      }
      overviewChart.update();
    };
  }

  // Logic click thẻ
  const cards = document.querySelectorAll(".stats .card");
  let currentActiveIndex = null;

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      showPage("dashboard");
      if (currentActiveIndex === index) {
        card.classList.remove("active");
        currentActiveIndex = null;
        if (window.updateChart) window.updateChart(null);
      } else {
        cards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        currentActiveIndex = index;
        if (window.updateChart) window.updateChart(index);
      }
    });
  });

  // Gọi các hàm cập nhật dữ liệu
  updateTotalMovies();
  updateTotalUsers();
  updateTotalGenres();
});