document.addEventListener('DOMContentLoaded', () => {
  loadAllActors();
});

async function loadAllActors() {
  const url = `http://localhost/movie_project/src/backend/server.php?controller=actor&method=index`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Lỗi khi gọi API');

    const data = await response.json();

    if (data.status === 'success') {
      renderActorList(data.data); // danh sách diễn viên
    } else {
      console.error('Lỗi từ server:', data.message);
    }
  } catch (error) {
    console.error('Lỗi khi fetch danh sách diễn viên:', error.message);
  }
}

function renderActorList(actors) {
  const container = document.getElementById('movie-list');
  if (!container) return;

  // Lọc ra những diễn viên có ảnh
  const filteredActors = actors.filter(actor => actor.profile_url && actor.profile_url.trim() !== '');

  if (filteredActors.length === 0) {
    container.innerHTML = `<p>Không có diễn viên nào có ảnh để hiển thị.</p>`;
    return;
  }

  container.innerHTML = filteredActors.map(actor => `
    <div class="actor-card">
      <img src="${actor.profile_url}" alt="${actor.name}" />
      <h3>${actor.name}</h3>
      <button onclick="location.href='actor-details.html?actor_id=${actor.id}'">Xem chi tiết</button>
    </div>
  `).join('');
}
