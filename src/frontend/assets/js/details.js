// Gọi API lấy chi tiết phim theo ID
async function getMovieDetail(id) {
  try {
    const response = await fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=movie&method=detail&id=${id}`);
    if (!response.ok) throw new Error('Lỗi HTTP: ' + response.status);
    return await response.json();
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phim:', error);
    return { status: 'error', data: null };
  }
}

// Hiển thị thông tin chi tiết phim ra HTML
function renderMovieDetail(movie) {
  const container = document.getElementById('movie-details');
  if (!container) return;

 const defaultTrailers = [
  'https://www.youtube.com/embed/yQCpGW7bZyo', 
  'https://www.youtube.com/embed/xY-qRGC6Yu0', 
  'https://www.youtube.com/embed/6txjTWLoSc8'  
];

function getEmbedUrl(url) {
  if (!url) return null;
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }
  return url;
}

function getRandomDefaultTrailer() {
  const randomIndex = Math.floor(Math.random() * defaultTrailers.length);
  return defaultTrailers[randomIndex];
}

const trailerEmbedUrl = getEmbedUrl(movie.trailer_url) || getRandomDefaultTrailer();


container.innerHTML = `
  <button onclick="history.back()" style="
    padding: 5px 10px;
    background-color: #e50914;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 16px;
    transition: background-color 0.3s ease;
    user-select: none;
    display: inline-block;
  " onmouseover="this.style.backgroundColor='#cc0000'" onmouseout="this.style.backgroundColor='#e50914'">
    ← Quay lại
  </button>

  <div class="movie-detail-content" style="display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap;">
    <div class="video-container" style="width: 100%; margin-bottom: 20px;">
      <iframe width="100%" height="400" src="${trailerEmbedUrl}" frameborder="0" allowfullscreen></iframe>
    </div>

    <div class="poster-container" style="max-width: 200px;">
      <img src="${movie.poster_url || movie.poster || '../assets/images/default-poster.jpg'}" alt="${movie.title}" class="movie-poster" style="width: 100%; height: auto;" />
    </div>

    <div class="info-container" style="flex: 1; min-width: 300px;">
      <h1 class="movie-title">${movie.title || 'Không có tiêu đề'}</h1>
      <p><strong>Thể loại:</strong> ${movie.genre_name || 'Không rõ'}</p>
      <p class="rating"><strong>IMDb: </strong>${movie.imdb_rating || 'N/A'}</p>
      <p><strong>Ngày phát hành:</strong> ${movie.release_date || 'Không rõ'}</p>
      <p><strong>Mô tả:</strong></p>
      <p class="movie-description">${movie.description || 'Không có mô tả'}</p>

      <h3>Diễn viên:</h3>
      <div class="actors-list" style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 16px">
        ${movie.actors && movie.actors.length > 0 ? movie.actors.map(actor => `
          <div class="actor-card" style="width: 120px; text-align: center;">
            <img src="${actor.profile_url}" alt="${actor.name}" style="width: 100%; border-radius: 8px;" />
            <p><strong>${actor.name}</strong></p>
            <p style="font-size: 0.9em; color: #999;">${actor.role}</p>
          </div>
        `).join('') : '<p>Không có thông tin diễn viên.</p>'}
      </div>

      <h3 style="margin-top: 25px;">Bình luận:</h3>
      <div id="comment-list" style="margin-bottom: 10px;">
        <!-- Danh sách bình luận sẽ được hiển thị ở đây -->
      </div>

      <div id="comment-form" style="margin-top: 10px;">
        <textarea id="comment-text" rows="4" placeholder="Nhập bình luận..." style="width: 90%; padding: 5px; border-radius: 6px; border: 1px solid #ccc; "></textarea>
        <button onclick="submitComment()" style="margin-top: 10px; background-color: #e50914; color: white; padding: 8px 10px; border: none; border-radius: 6px; cursor: pointer;">Gửi bình luận</button>
      </div>
    </div>
  </div>
`;

}

// Lấy ID từ URL và gọi API
window.onload = async function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('movie-details').innerHTML = '<p>Không có ID phim trong URL.</p>';
    return;
  }

  const result = await getMovieDetail(id);

  if (result.status === 'success' && result.data) {
    renderMovieDetail(result.data);
    loadComments(result.data.id);
  } else {
    document.getElementById('movie-details').innerHTML = '<p>Không tìm thấy thông tin phim.</p>';
  }
};


// Gọi API để lấy bình luận theo phim
function loadComments(movieId) {
  console.log("Movie ID để tải bình luận:", movieId);

  fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=review&method=getByMovie&movie_id=${movieId}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(result => {
      console.log('Dữ liệu bình luận từ API:', result);

      const commentList = document.getElementById('comment-list');
      if (!commentList) {
        console.error('Không tìm thấy phần tử comment-list');
        return;
      }

      const comments = result.data;

      if (!Array.isArray(comments) || comments.length === 0) {
        commentList.innerHTML = '<p>Chưa có bình luận.</p>';
      } else {
        commentList.innerHTML = comments.map(c => `
          <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
            <p>${c.comment}</p>
          </div>
        `).join('');
      }
    })
    .catch(error => {
      console.error('Lỗi khi tải bình luận:', error);
      const commentList = document.getElementById('comment-list');
      if (commentList) commentList.innerHTML = '<p>Không thể tải bình luận.</p>';
    });
}


// Hàm lấy dữ liệu từ textarea rồi gọi API tạo bình luận
function submitComment() {
  const commentText = document.getElementById('comment-text').value.trim();
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get('id'); // lấy ID phim từ URL

  if (!commentText) {
    alert('Vui lòng nhập bình luận!');
    return;
  }
  if (!movieId) {
    alert('Không tìm thấy ID phim!');
    return;
  }

  // Gọi hàm tạo đánh giá mới (POST)
  createReview(movieId, 5, commentText); // ví dụ rating là 5 luôn

  // Sau khi gửi xong, bạn có thể xóa textarea hoặc disable nút...
  document.getElementById('comment-text').value = '';
}

// Tạo đánh giá mới (POST) – yêu cầu đã đăng nhập
function createReview(movieId, rating, comment) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Bạn cần đăng nhập để gửi đánh giá.');
    return;
  }

  fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=review&method=create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token  // Gửi token trong header
    },
    body: JSON.stringify({ movie_id: movieId, rating, comment })
  })
  .then(res => res.json())
  .then(data => {
    console.log('Đánh giá mới:', data);
    if (data.status === 'success') {
      const commentList = document.getElementById('comment-list');
      const newCommentHtml = `
        <div style="border-bottom: 1px solid #ddd; padding: 10px 0;">
          <p>${comment}</p>
        </div>
      `;
      if (commentList.innerHTML.includes('Chưa có bình luận')) {
        commentList.innerHTML = newCommentHtml;
      } else {
        commentList.insertAdjacentHTML('beforeend', newCommentHtml);
      }
    } else {
      alert('Gửi bình luận thất bại: ' + (data.message || 'Lỗi server'));
    }
  })
  .catch(err => {
    console.error('Lỗi gửi bình luận:', err);
    alert('Không thể gửi bình luận, vui lòng thử lại sau.');
  });
}

// Hàm cập nhật đánh giá
function updateReview(reviewId, rating, comment) {
  fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=review&method=update&id=${reviewId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + token, nếu có
    },
    body: JSON.stringify({ rating, comment })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Đã cập nhật đánh giá:', data);
    // Có thể gọi lại loadComments để load lại bình luận
  })
  .catch(error => console.error('Lỗi cập nhật đánh giá:', error));
}

// Hàm xóa đánh giá
function deleteReview(reviewId) {
  fetch(`http://movieon.atwebpages.com/src/backend/server.php?controller=review&method=delete&id=${reviewId}`, {
    method: 'DELETE',
    headers: {
      // 'Authorization': 'Bearer ' + token, nếu có
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Đã xóa đánh giá:', data);
    // Có thể gọi lại loadComments để load lại bình luận
  })
  .catch(error => console.error('Lỗi xóa đánh giá:', error));
}
