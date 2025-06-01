const searchInput = document.querySelector(".search-box");
const searchButton = document.querySelector(".search-button");

const trendSection = document.getElementById("trend-section"); // phần phim xu hướng
const topSearchSection = document.getElementById("top-search-section"); // phần từ khóa tìm kiếm hàng đầu
const searchResultsSection = document.getElementById("search-results"); // phần kết quả tìm kiếm
const searchMovieList = document.getElementById("search-movie-list");

const movieListContainer = document.querySelector(".left .movie-list"); // vùng phim xu hướng
const topSearchContainer = document.querySelector(".right");
const suggestionBox = document.querySelector(".suggestion-box");

// Hàm gọi API lấy phim xu hướng (index)
async function loadTrendingMovies() {
  try {
    const url =
      "http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=index";
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

// Hàm gọi API tìm kiếm phim theo từ khóa
async function searchMovies(keyword) {
  if (!keyword) {
    // Nếu input rỗng, ẩn kết quả tìm kiếm, hiện lại xu hướng + tìm kiếm hàng đầu
    searchResultsSection.style.display = "none";
    trendSection.style.display = "block";
    topSearchSection.style.display = "block";
    movieListContainer.innerHTML = `<p>Vui lòng nhập từ khóa tìm kiếm</p>`;
    return;
  }

  try {
    const url = `http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=search&keyword=${encodeURIComponent(
      keyword
    )}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      // Ẩn xu hướng + tìm kiếm hàng đầu
      trendSection.style.display = "none";
      topSearchSection.style.display = "none";
      // Hiện kết quả tìm kiếm
      searchResultsSection.style.display = "block";

      // Render kết quả tìm kiếm
      renderSearchResults(data.data);
    } else {
      // Không có kết quả thì hiện thông báo trong phần kết quả tìm kiếm
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

// Hàm hiển thị danh sách phim xu hướng (giữ nguyên)
function renderMovies(movies) {
  const moviesToShow = movies.slice(0, 6);
  movieListContainer.innerHTML = moviesToShow
    .map(
      (movie) => `
    <div class="movie" style="display:flex; align-items:center; justify-content:flex-start; margin-bottom:25px;" data-id="${
      movie.id || movie.movie_id
    }" data-trailer="${movie.trailer_url}">
      <img 
        src="${
          movie.poster_url ||
          movie.poster ||
          "../assets/images/default-poster.jpg"
        }" 
        alt="${movie.title}" 
        class="movie-poster"
        style="width: 140px; height: 210px; object-fit: cover; border-radius: 8px;"
      />
      <div class="movie-info" style="margin-left: 15px;">
        <h3>${movie.title}</h3>
        <p>${movie.release_date || "N/A"} • ${movie.genre_name || "N/A"}</p>
      </div>
    </div>
  `
    )
    .join("");
}

// Hàm hiển thị danh sách phim kết quả tìm kiếm (mới)
function renderSearchResults(movies) {
  if (movies.length === 0) {
    searchMovieList.innerHTML = `<p>Không tìm thấy phim nào phù hợp.</p>`;
  } else {
    searchMovieList.innerHTML = movies
      .map(
        (movie) => `
      <div class="movie" style="display:flex; align-items:center; justify-content:flex-start; margin-bottom:25px;" data-id="${
        movie.id || movie.movie_id
      }" data-trailer="${movie.trailer_url}">
        <img 
          src="${
            movie.poster_url ||
            movie.poster ||
            "../assets/images/default-poster.jpg"
          }" 
          alt="${movie.title}" 
          class="movie-poster"
          style="width: 140px; height: 210px; object-fit: cover; border-radius: 8px;"
        />
        <div class="movie-info" style="margin-left: 15px;">
          <h3>${movie.title}</h3>
          <p>${movie.release_date || "N/A"} • ${movie.genre_name || "N/A"}</p>
        </div>
      </div>
    `
      )
      .join("");
  }
}

// Hàm gọi API để hiển thị tiêu đề phim ở phần "Tìm kiếm hàng đầu"
async function loadTopSearchKeywords() {
  try {
    const url =
      "http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=index";
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      const movieTitles = data.data.map((movie) => ({
        id: movie.id || movie.movie_id,
        title: movie.title,
      }));
      renderTopKeywords(movieTitles.slice(0, 8));
    } else {
      topSearchContainer.innerHTML += `<p>Không có từ khóa nổi bật.</p>`;
    }
  } catch (error) {
    topSearchContainer.innerHTML += `<p>Lỗi khi tải từ khóa.</p>`;
    console.error(error);
  }
}

// Hiển thị từ khoá bên phải
function renderTopKeywords(movies) {
  const container = document.createElement("ul");
  container.className = "top-keywords";
  container.style.paddingLeft = "-30px";

  movies.forEach((movie) => {
    const li = document.createElement("li");
    li.textContent = movie.title;
    li.className = "keyword-item";
    li.style.cursor = "pointer";
    li.style.marginBottom = "6px";
    li.dataset.id = movie.id;

    li.addEventListener("click", () => {
      window.location.href = `details.html?id=${movie.id}`;
    });

    container.appendChild(li);
  });

  topSearchContainer.querySelector("h2").after(container);
}

// Xử lý sự kiện tìm kiếm
searchButton.addEventListener("click", () => {
  const keyword = searchInput.value.trim();
  searchMovies(keyword);
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchButton.click();
  }
});

// Click phim chuyển sang details.html (áp dụng cho cả xu hướng và kết quả tìm kiếm)
document.body.addEventListener("click", (e) => {
  const movieDiv = e.target.closest(".movie");
  if (!movieDiv) return;

  const movieId = movieDiv.getAttribute("data-id");
  if (!movieId) return;

  window.location.href = `details.html?id=${movieId}`;
});

// Khi load trang: tải phim xu hướng + từ khoá tìm kiếm, ẩn phần kết quả tìm kiếm
window.addEventListener("DOMContentLoaded", () => {
  loadTrendingMovies();
  loadTopSearchKeywords();
  searchResultsSection.style.display = "none";
});

// -- Phần gợi ý tìm kiếm --
searchInput.addEventListener("input", async () => {
  const keyword = searchInput.value.trim();

  if (!keyword) {
    suggestionBox.style.display = "none";
    suggestionBox.innerHTML = "";
    return;
  }

  try {
    const url = `http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=search&keyword=${encodeURIComponent(
      keyword
    )}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "success" && data.total > 0) {
      renderSuggestions(data.data.slice(0, 6)); // Hiển thị tối đa 6 gợi ý
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
  movies.forEach((movie) => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerHTML = `<i class="fa fa-search"></i><span>${movie.title}</span>`;
    div.addEventListener("click", () => {
      window.location.href = `details.html?id=${movie.id || movie.movie_id}`;
    });
    suggestionBox.appendChild(div);
  });
  suggestionBox.style.display = "block";
}

// Ẩn suggestion khi click ra ngoài
document.addEventListener("click", (e) => {
  if (!suggestionBox.contains(e.target) && e.target !== searchInput) {
    suggestionBox.style.display = "none";
  }
});
