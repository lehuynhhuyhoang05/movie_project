document.addEventListener('DOMContentLoaded', async () => {
  const actorId = getActorIdFromURL();
  if (!actorId) {
    document.getElementById('actor-detail').innerHTML = '<p>Không tìm thấy diễn viên.</p>';
    return;
  }

  try {
    const res = await fetch(`http://localhost/movie_project/src/backend/server.php?controller=actor&method=show&actor_id=${actorId}`);
    const data = await res.json();

    if (data.status === 'success') {
      const actor = data.actor;
      const movies = data.data || [];

      renderActorInfo(actor);
      renderActorMoviesWithVideos(movies, actor); // Truyền actor vào đây
    } else {
      document.getElementById('actor-detail').innerHTML = `<p>Lỗi: ${data.message}</p>`;
    }
  } catch (error) {
    console.error('Lỗi fetch actor:', error);
    document.getElementById('actor-detail').innerHTML = '<p>Đã xảy ra lỗi khi tải dữ liệu diễn viên.</p>';
  }
});

function getActorIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('actor_id');
}

function renderActorInfo(actor) {
  const container = document.getElementById('actor-detail');
  container.innerHTML = `
    <button id="back-btn" class="back-btn">⬅ Quay lại</button>
    <div class="actor-header">
      <img src="${actor.profile_url || '../assets/images/default-actor.jpg'}" alt="${actor.name}" />
      <h2>${actor.name}</h2>
    </div>
    <p>${actor.bio || 'Không có mô tả.'}</p>
    <h3>Phim đã tham gia:</h3>
    <div id="actor-movies" class="movie-list"></div>
  `;

  document.getElementById('back-btn').addEventListener('click', () => {
    window.history.back();
  });
}

async function renderActorMoviesWithVideos(movies, actor) {
  const container = document.getElementById('actor-movies');
  container.innerHTML = '<p>Đang tải danh sách phim...</p>';

  const movieElements = await Promise.all(movies.map(async (movie) => {
    try {
      const res = await fetch(`http://localhost/movie_project/src/backend/server.php?controller=movie&method=detail&id=${movie.id}`);
      const detail = await res.json();

      if (detail.status === 'success') {
        const m = detail.data;
        return `
          <div class="movie-card">
            <img src="${m.poster_url || '../assets/images/default-poster.jpg'}" alt="${m.title}" class="movie-poster"/>
            <h4 class="movie-title">${m.title || 'Không có tiêu đề'}</h4>
            <button class="watch-button" data-movie-id="${m.id}">Xem ngay</button>
          </div>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phim:', err);
    }
    return '';
  }));

  container.innerHTML = movieElements.join('');
  integrateWatchHistory('actor-movies'); // Tích hợp logic lịch sử xem sau khi render
}

// Hàm tích hợp logic lịch sử xem cho các nút "Xem ngay"
function integrateWatchHistory(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.watch-button').forEach(button => {
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