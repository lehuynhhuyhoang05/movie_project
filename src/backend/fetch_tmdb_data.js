const axios = require('axios');
  const mysql = require('mysql2/promise');

  // Cấu hình kết nối database
  const dbConfig = {
      host: 'localhost',
      user: 'root', // Thay bằng username MySQL của bạn
      password: 'Hoang24042005@', // Thay bằng password MySQL của bạn
      database: 'movie_db',
      charset: 'utf8mb4'
  };

  // API key TMDB
  const apiKey = '28e70ff91eaaf028f03e4be2bdfd7494'; // Thay bằng API key của bạn

  class TMDBFetcher {
      constructor() {
          this.insertedMovies = new Set(); // Tránh trùng lặp phim
      }

      // Tạo kết nối database
      async init() {
          this.connection = await mysql.createConnection(dbConfig);
          console.log('Connected to database.');
      }

      // Lấy 10 thể loại
      async fetchGenres() {
          const response = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
          const genres = response.data.genres.slice(0, 10); // Lấy 10 thể loại đầu tiên

          for (const genre of genres) {
              await this.connection.execute(
                  'INSERT INTO genres (id, name) VALUES (?, ?) ON DUPLICATE KEY UPDATE name = ?',
                  [genre.id, genre.name, genre.name]
              );
          }
          console.log('Imported 10 genres successfully.');
          return genres.map(genre => genre.id);
      }

      // Lấy phim theo thể loại
      async fetchMoviesByGenre(genreIds) {
          const moviesPerGenre = 15;

          for (const genreId of genreIds) {
              let page = 1;
              let fetchedMovies = 0;

              while (fetchedMovies < moviesPerGenre) {
                  const response = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=en-US&with_genres=${genreId}&page=${page}`);
                  const movies = response.data.results;

                  if (!movies || movies.length === 0) break;

                  for (const movie of movies) {
                      if (fetchedMovies >= moviesPerGenre) break;
                      if (this.insertedMovies.has(movie.id)) continue; // Bỏ qua phim đã lấy

                      // Lấy chi tiết phim
                      const movieDetails = await this.fetchMovieDetails(movie.id);
                      const credits = await this.fetchCredits(movie.id);
                      const trailerUrl = await this.fetchTrailerUrl(movie.id);

                      const director = credits.crew.find(crew => crew.job === 'Director')?.name || null;
                      const actors = credits.cast.slice(0, 5); // Lấy tối đa 5 diễn viên

                      // Lưu phim
                      const [result] = await this.connection.execute(
                          'INSERT INTO movies (title, description, release_date, poster_url, trailer_url, duration, imdb_rating, director, genre_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                          [
                              movieDetails.title,
                              movieDetails.overview || null,
                              movieDetails.release_date || null,
                              movieDetails.poster_path ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}` : null,
                              trailerUrl,
                              movieDetails.runtime || null,
                              movieDetails.vote_average || null,
                              director,
                              genreId
                          ]
                      );
                      const movieInsertId = result.insertId;

                      // Lưu diễn viên và liên kết
                      for (const actor of actors) {
                          if (!actor.name) continue;

                          await this.connection.execute(
                              'INSERT INTO actors (id, name, profile_url) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = ?, profile_url = ?',
                              [
                                  actor.id,
                                  actor.name,
                                  actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null,
                                  actor.name,
                                  actor.profile_path ? `https://image.tmdb.org/t/p/w500${actor.profile_path}` : null
                              ]
                          );

                          const role = actor.character || 'Actor';
                          await this.connection.execute(
                              'INSERT IGNORE INTO movie_actors (movie_id, actor_id, role) VALUES (?, ?, ?)',
                              [movieInsertId, actor.id, role]
                          );
                      }

                      this.insertedMovies.add(movie.id);
                      fetchedMovies++;
                      console.log(`Imported movie: ${movieDetails.title} (Genre ID: ${genreId})`);
                  }
                  page++;
              }
          }
      }

      // Lấy chi tiết phim
      async fetchMovieDetails(movieId) {
          const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`);
          return response.data;
      }

      // Lấy thông tin đạo diễn và diễn viên
      async fetchCredits(movieId) {
          const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`);
          return response.data;
      }

      // Lấy URL trailer
      async fetchTrailerUrl(movieId) {
          const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/videos?api_key=${apiKey}&language=en-US`);
          const videos = response.data.results;
          const trailer = videos.find(video => video.type === 'Trailer' && video.site === 'YouTube');
          return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
      }

      // Đóng kết nối
      async close() {
          await this.connection.end();
          console.log('Database connection closed.');
      }
  }

  // Chạy script
  (async () => {
      const fetcher = new TMDBFetcher();
      try {
          await fetcher.init();
          const genreIds = await fetcher.fetchGenres();
          await fetcher.fetchMoviesByGenre(genreIds);
          console.log('Data import completed.');
      } catch (error) {
          console.error('Error:', error.message);
      } finally {
          await fetcher.close();
      }
  })();