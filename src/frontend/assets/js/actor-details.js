document.addEventListener('DOMContentLoaded', async () => {
  const actorId = getActorIdFromURL();
  if (!actorId) {
    document.getElementById('actor-detail').innerHTML = '<p>Không tìm thấy diễn viên.</p>';
    return;
  }

  try {
    const res = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=actor&method=show&actor_id=${actorId}`);
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
      const res = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=detail&id=${movie.id}`);
      const detail = await res.json();

      if (detail.status === 'success') {
        const m = detail.data;
        return `
          <div class="movie-card">
            <img src="${m.poster_url || '../assets/images/default-poster.jpg'}" alt="${m.title}" class="movie-poster"/>
            <h4 class="movie-title">${m.title || 'Không có tiêu đề'}</h4>
            <button class="watch-button" onclick="window.location.href='details.html?id=${m.id}'">Xem ngay</button>
          </div>
        `;
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phim:', err);
    }
    return '';
  }));

  container.innerHTML = movieElements.join('');
}
