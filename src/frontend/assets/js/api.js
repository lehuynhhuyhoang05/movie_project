// Map thể loại tiếng Anh sang tiếng Việt


// Lấy danh sách phim từ API
async function getAllMovies() {
  try {
    const response = await fetch('http://localhost/movie_project/src/backend/server.php?controller=movie&method=index');
    if (!response.ok) throw new Error('Lỗi HTTP: ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tải phim:', error);
    return { status: 'error', data: [] };
  }
}

// Lấy danh sách thể loại từ API (nếu cần dùng)
async function getAllGenres() {
  try {
    const response = await fetch('http://localhost/movie_project/src/backend/server.php?controller=genre&method=index');
    if (!response.ok) throw new Error('Lỗi HTTP: ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi tải thể loại:', error);
    return { status: 'error', data: [] };
  }
}

// Hiển thị phim trong lưới với tên thể loại tiếng Việt, thời lượng và đạo diễn
function renderMovies(movies, gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) {
    console.error(`Không tìm thấy grid với ID: ${gridId}`);
    return;
  }
  grid.innerHTML = ''; // Xóa nội dung cũ

  if (!movies || movies.length === 0) {
    grid.innerHTML = '<p>Không có phim nào</p>';
    return;
  }

  movies.forEach(movie => {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    // Lấy thể loại tiếng Anh, chuyển sang tiếng Việt nếu có
    const genreEn = movie.genre_name || movie.genre || 'Không rõ';
    const genreVi = genreNameMapVi[genreEn] || genreEn;
    // Định dạng thời lượng (giả định đơn vị là phút, tùy chỉnh nếu khác)
    const duration = movie.duration ? `${movie.duration} phút` : 'Chưa rõ';
    // Đạo diễn
    const director = movie.director || 'Chưa rõ';

    movieCard.innerHTML = `
      <div class="movie-poster">
        <img src="${movie.poster_url || movie.poster || '../assets/images/default-poster.jpg'}" alt="${movie.title || 'Phim không tên'}">
      </div>
      <div class="info">
        <h3>${movie.title || 'Không có tiêu đề'}</h3>
        <p>${movie.description ? movie.description.substring(0, 50) + '...' : 'Không có mô tả'}</p>
        <p class="movie-genre">Thể loại: ${genreVi}</p>
        <p><strong>Thời lượng:</strong> ${duration}</p>
        <p><strong>Đạo diễn:</strong> ${director}</p>
        <p class="movie-rating">${movie.imdb_rating || 'N/A'}</p>
        <button class="movie-btn" data-movie-id="${movie.id}">Xem ngay</button>
      </div>
    `;
    grid.appendChild(movieCard);
  });

  // Tích hợp logic lịch sử xem sau khi render
  integrateWatchHistory(gridId);
}

// Hàm tích hợp logic lịch sử xem cho các nút "Xem ngay"
function integrateWatchHistory(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.querySelectorAll('.movie-btn').forEach(button => {
    const movieId = button.getAttribute('data-movie-id');
    if (movieId) {
      button.onclick = () => handleWatchAndRedirect(parseInt(movieId));
    }
  });
}

// Hàm lưu vào lịch sử xem
async function addToWatchHistory(movieId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const response = await fetch(`http://localhost/movie_project/src/backend/server.php?controller=movie&method=addWatchHistory&movie_id=${movieId}&token=Bearer%20${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie_id: movieId })
    });
    const data = await response.json();
    console.log("Add to Watch History Response:", data);
    if (data.status !== "success") {
      console.warn("Không thể thêm vào lịch sử xem:", data.message);
    }
  } catch (error) {
    console.error("Lỗi khi lưu lịch sử xem:", error);
  }
}

// Hàm xử lý xem phim và chuyển hướng
async function handleWatchAndRedirect(movieId) {
  try {
    await addToWatchHistory(movieId);
  } catch (e) {
    console.warn("Không thể lưu lịch sử, chuyển hướng vẫn tiếp tục");
  } finally {
    location.href = `details.html?id=${movieId}`;
  }
}

// Thiết lập carousel cho từng danh mục phim
function setupCarousel(category) {
  const container = document.querySelector(`#movieGrid${category.charAt(0).toUpperCase() + category.slice(1)}`);
  if (!container) {
    console.error(`Không tìm thấy movie-grid cho category: ${category}`);
    return;
  }
  const grid = container;
  const parent = grid.parentElement;
  const prevBtn = parent.querySelector('.left-arrow');
  const nextBtn = parent.querySelector('.right-arrow');
  let scrollAmount = 0;
  const scrollStep = 300; // Khoảng cách cuộn mỗi lần (px)

  if (!prevBtn || !nextBtn) {
    console.error(`Không tìm thấy nút prev/next cho category: ${category}`);
    return;
  }

  prevBtn.addEventListener('click', () => {
    scrollAmount = Math.max(scrollAmount - scrollStep, 0);
    grid.style.transform = `translateX(-${scrollAmount}px)`;
    updateButtonStates();
  });

  nextBtn.addEventListener('click', () => {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    scrollAmount = Math.min(scrollAmount + scrollStep, maxScroll);
    grid.style.transform = `translateX(-${scrollAmount}px)`;
    updateButtonStates();
  });

  function updateButtonStates() {
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    prevBtn.disabled = scrollAmount <= 0;
    nextBtn.disabled = scrollAmount >= maxScroll;
  }

  updateButtonStates();
  window.addEventListener('resize', updateButtonStates);
}

// Khởi tạo carousel cho các danh mục
function initCarousels() {
  const categories = ['newRelease', 'history', 'family', 'animation'];
  categories.forEach(category => {
    setupCarousel(category);
  });
}

// Khởi tạo slider banner
function initBannerSlider() {
  const slider = document.querySelector('.banner-slider');
  const images = document.querySelectorAll('.banner-slider img');
  const leftArrow = document.querySelector('.banner-arrow.left');
  const rightArrow = document.querySelector('.banner-arrow.right');
  let currentIndex = 0;

  if (!slider || !leftArrow || !rightArrow || images.length === 0) {
    console.error('Không tìm thấy slider hoặc các thành phần liên quan.');
    return;
  }

  function slideTo(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;
    currentIndex = index;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  leftArrow.addEventListener('click', () => slideTo(currentIndex - 1));
  rightArrow.addEventListener('click', () => slideTo(currentIndex + 1));
  setInterval(() => slideTo(currentIndex + 1), 5000);
}

// Hàm khởi tạo khi trang tải
window.onload = async function () {
  const genreResult = await getAllGenres();
  const movieResult = await getAllMovies();
  console.log('Dữ liệu phim từ API:', movieResult.data); // Log để kiểm tra dữ liệu

  if (genreResult.status === 'success' && movieResult.status === 'success' && movieResult.data.length > 0) {
    // Lấy ID các thể loại cần thiết
    const historyGenre = genreResult.data.find(g => g.name.toLowerCase() === 'history');
    const familyGenre = genreResult.data.find(g => g.name.toLowerCase() === 'family');
    const animationGenre = genreResult.data.find(g => g.name.toLowerCase() === 'animation');

    const historyGenreId = historyGenre ? historyGenre.id : null;
    const familyGenreId = familyGenre ? familyGenre.id : null;
    const animationGenreId = animationGenre ? animationGenre.id : null;

    // Lọc phim mới ra mắt (release_date >= 2025-01-01)
    const newReleases = movieResult.data.filter(movie => {
      try {
        return new Date(movie.release_date) >= new Date('2025-01-01');
      } catch {
        return false;
      }
    });

    // Lấy ID phim mới ra mắt để loại trừ
    const newReleaseIds = newReleases.map(movie => movie.id);

    // Lọc phim theo thể loại, loại trừ phim mới ra mắt
    const historyMovies = historyGenreId
      ? movieResult.data.filter(movie => movie.genre_id === historyGenreId && !newReleaseIds.includes(movie.id))
      : [];

    const familyMovies = familyGenreId
      ? movieResult.data.filter(movie => movie.genre_id === familyGenreId && !newReleaseIds.includes(movie.id))
      : [];

    const animationMovies = animationGenreId
      ? movieResult.data.filter(movie => movie.genre_id === animationGenreId && !newReleaseIds.includes(movie.id))
      : [];

    // Hiển thị phim vào các grid tương ứng
    renderMovies(newReleases, 'movieGridNewRelease');
    renderMovies(historyMovies, 'movieGridHistory');
    renderMovies(familyMovies, 'movieGridFamily');
    renderMovies(animationMovies, 'movieGridAnimation');
  } else {
    document.querySelectorAll('.movie-grid').forEach(grid => {
      grid.innerHTML = '<p>Không có phim nào</p>';
    });
  }

  initCarousels();
  initBannerSlider();
};