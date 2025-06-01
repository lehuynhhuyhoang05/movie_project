async function getMoviesByActor(actorId) {
  const res = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=getByActor&actor_id=${actorId}`);
  if (!res.ok) return [];
  const result = await res.json();
  return result.data || [];
}

async function getActorsWithMovies() {
  try {
    const res = await fetch('http://movieon.atwebpages.com/src/backend/server.php?controller=actor&method=index');
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    const data = await res.json();
    const actors = data.data || [];

    for (const actor of actors) {
      actor.movies = await getMoviesByActor(actor.id);
    }

    return actors;
  } catch (e) {
    console.error(e);
    return [];
  }
}

// Hiển thị danh sách diễn viên và phim
function renderActors(actors) {
  const container = document.getElementById('actors-list');
  if (!container) return;

  container.innerHTML = actors.map(actor => `
    <div class="actor-card" style="border: 1px solid #ddd; padding: 10px; border-radius: 8px; width: 200px; margin: 10px;">
      <img src="${actor.profile_url || '../assets/images/default-actor.jpg'}" alt="${actor.name}" style="width: 100%; height: auto; border-radius: 8px;">
      <h3 style="margin: 10px 0 5px;">${actor.name}</h3>
      <p><strong>Phim đã đóng:</strong></p>
      <ul style="padding-left: 20px; font-size: 14px;">
        ${actor.movies && actor.movies.length > 0
          ? actor.movies.map(m => `<li><a href="movie-detail.html?id=${m.id}" style="color: #e50914;">${m.title}</a></li>`).join('')
          : '<li>Chưa có phim</li>'}
      </ul>
    </div>
  `).join('');
}

// Khi load trang
window.onload = async function () {
  const actors = await getActorsWithMovies();
  renderActors(actors);
};
