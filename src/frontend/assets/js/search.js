const searchInput = document.querySelector(".search-box");
const searchButton = document.querySelector(".search-button");

const trendSection = document.getElementById("trend-section");
const topSearchSection = document.getElementById("top-search-section");
const searchResultsSection = document.getElementById("search-results");
const searchMovieList = document.getElementById("search-movie-list");

const movieListContainer = document.querySelector(".left .movie-list");
const topSearchContainer = document.querySelector(".right");
const suggestionBox = document.querySelector(".suggestion-box");

const genreTranslation = {
  "Action": "Hành động",
  "Adventure": "Phiêu lưu",
  "Animation": "Hoạt hình",
  "Comedy": "Hài",
  "Crime": "Tội phạm",
  "Documentary": "Tài liệu",
  "Drama": "Chính kịch",
  "Family": "Gia đình",
  "Fantasy": "Giả tưởng",
  "History": "Lịch sử",
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

// Tải phim xu hướng
async function loadTrendingMovies() {
  try {
    const url = "http://localhost/movie_project/src/backend/server.php?controller=movie&method=index";
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      renderMovies(data.data);
    } else {
      movieListContainer.innerHTML = `<p>Không có phim xu hướng.</p>`;
    }
  } catch (error) {
    movieListContainer.innerHTML = `<p>Lỗi khi tải phim xu hướng.</p>`;
    console.error(error);
  }
}

// Tìm kiếm phim
async function searchMovies(keyword) {
  if (!keyword) {
    searchResultsSection.style.display = "none";
    trendSection.style.display = "block";
    topSearchSection.style.display = "block";
    movieListContainer.innerHTML = `<p>Vui lòng nhập từ khóa tìm kiếm</p>`;
    return;
  }

  try {
    const url = `http://localhost/movie_project/src/backend/server.php?controller=movie&method=search&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      trendSection.style.display = "none";
      topSearchSection.style.display = "none";
      searchResultsSection.style.display = "block";
      renderSearchResults(data.data);
    } else {
      trendSection.style.display = "none";
      topSearchSection.style.display = "none";
      searchResultsSection.style.display = "block";
      searchMovieList.innerHTML = `<p>Không tìm thấy phim nào phù hợp.</p>`;
    }
  } catch (error) {
    console.error(error);
    trendSection.style.display = "none";
    topSearchSection.style.display = "none";
    searchResultsSection.style.display = "block";
    searchMovieList.innerHTML = `<p>Lỗi khi tìm kiếm phim.</p>`;
  }
}

// Render phim xu hướng
function renderMovies(movies) {
  const moviesToShow = movies.slice(0, 6);
  movieListContainer.innerHTML = moviesToShow.map(movie => `
    <div class="movie" style="display:flex; align-items:center; justify-content:flex-start; margin-bottom:25px;" data-id="${movie.id || movie.movie_id}" data-trailer="${movie.trailer_url}">
      <img src="${movie.poster_url || movie.poster || "../assets/images/default-poster.jpg"}" alt="${movie.title}" class="movie-poster"
        style="width: 140px; height: 210px; object-fit: cover; border-radius: 8px;" />
      <div class="movie-info" style="margin-left: 15px;">
        <h3>${movie.title}</h3>
        <p>${movie.release_date || "N/A"} • ${genreTranslation[movie.genre_name] || movie.genre_name || "N/A"}</p>
      </div>
    </div>
  `).join("");
}

// Render kết quả tìm kiếm
function renderSearchResults(movies) {
  if (movies.length === 0) {
    searchMovieList.innerHTML = `<p>Không tìm thấy phim nào phù hợp.</p>`;
  } else {
    searchMovieList.innerHTML = movies.map(movie => `
      <div class="movie" style="display:flex; align-items:center; justify-content:flex-start; margin-bottom:25px;" data-id="${movie.id || movie.movie_id}" data-trailer="${movie.trailer_url}">
        <img src="${movie.poster_url || movie.poster || "../assets/images/default-poster.jpg"}" alt="${movie.title}" class="movie-poster"
          style="width: 140px; height: 210px; object-fit: cover; border-radius: 8px;" />
        <div class="movie-info" style="margin-left: 15px;">
          <h3>${movie.title}</h3>
          <p>${movie.release_date || "N/A"} • ${genreTranslation[movie.genre_name] || movie.genre_name || "N/A"}</p>
        </div>
      </div>
    `).join("");
  }
}

// Tải từ khoá top
async function loadTopSearchKeywords() {
  try {
    const url = "http://localhost/movie_project/src/backend/server.php?controller=movie&method=index";
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      const movieTitles = data.data.map(movie => ({
        id: movie.id || movie.movie_id,
        title: movie.title,
      }));
      renderTopKeywords(movieTitles.slice(1, 9));
    } else {
      topSearchContainer.innerHTML += `<p>Không có từ khóa nổi bật.</p>`;
    }
  } catch (error) {
    topSearchContainer.innerHTML += `<p>Lỗi khi tải từ khóa.</p>`;
    console.error(error);
  }
}

// Render từ khóa nổi bật
function renderTopKeywords(movies) {
  const container = document.createElement("ul");
  container.className = "top-keywords";
  container.style.paddingLeft = "-30px";

  movies.forEach(movie => {
    const li = document.createElement("li");
    li.textContent = movie.title;
    li.className = "keyword-item";
    li.style.cursor = "pointer";
    li.style.marginBottom = "6px";
    li.dataset.id = movie.id;

    li.addEventListener("click", () => {
      handleWatchAndRedirect(movie.id);
    });

    container.appendChild(li);
  });

  topSearchContainer.querySelector("h2").after(container);
}

// Gợi ý khi nhập tìm kiếm
searchInput.addEventListener("input", async () => {
  const keyword = searchInput.value.trim();
  if (!keyword) {
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
    return;
  }

  try {
    const url = `http://localhost/movie_project/src/backend/server.php?controller=movie&method=search&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      renderSuggestions(data.data.slice(0, 6));
    } else {
      suggestionBox.style.display = "none";
      suggestionBox.innerHTML = "";
    }
  } catch (error) {
    console.error("Lỗi khi tải gợi ý:", error);
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
  }
});

function renderSuggestions(movies) {
  suggestionBox.innerHTML = "";
  movies.forEach(movie => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `<i class="fa fa-search"></i><span>${movie.title}</span>`;
    div.addEventListener("click", () => {
      handleWatchAndRedirect(movie.id || movie.movie_id);
    });
    suggestionBox.appendChild(div);
  });
  suggestionBox.style.display = "block";
}

// Ẩn gợi ý khi click ra ngoài
document.addEventListener("click", (e) => {
  if (!suggestionBox.contains(e.target) && e.target !== searchInput) {
    suggestionBox.style.display = "none";
  }
});

// Tìm kiếm khi bấm nút hoặc Enter
searchButton.addEventListener("click", () => {
  const keyword = searchInput.value.trim();
  searchMovies(keyword);
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});

// Xử lý click vào thẻ phim để chuyển trang + lưu lịch sử
document.body.addEventListener("click", (e) => {
  const movieDiv = e.target.closest(".movie");
  if (!movieDiv) return;

  const movieId = movieDiv.getAttribute("data-id");
  if (!movieId) return;

  handleWatchAndRedirect(movieId);
});

// Khi trang load
window.addEventListener("DOMContentLoaded", () => {
  loadTrendingMovies();
  loadTopSearchKeywords();
  searchResultsSection.style.display = "none";
});

// Gọi API lưu lịch sử xem
async function addToWatchHistory(movieId) {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const url = `http://localhost/movie_project/src/backend/server.php?controller=movie&method=addWatchHistory&movie_id=${movieId}&token=Bearer%20${token}`;
    const response = await fetch(url, { method: "POST" });
    const data = await response.json();

    if (data.status === "success") {
      console.log("Đã thêm vào lịch sử xem");
    } else {
      console.warn("Không thể thêm vào lịch sử xem:", data.message);
    }
  } catch (error) {
    console.error("Lỗi khi thêm vào lịch sử xem:", error);
  }
}

// Gọi lưu lịch sử rồi chuyển trang
async function handleWatchAndRedirect(movieId) {
  await addToWatchHistory(movieId);
  location.href = `details.html?id=${movieId}`;
}
