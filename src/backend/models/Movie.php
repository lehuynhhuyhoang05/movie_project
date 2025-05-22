<?php
  require_once __DIR__ . '/../config/database.php';

  class Movie {
      private $conn;
      private $table = 'movies';

      public function __construct() {
          $database = new Database();
          $this->conn = $database->getConnection();
      }

      public function getAll($page = 1, $perPage = 0) {
          $query = "SELECT m.*, g.name as genre_name 
                    FROM $this->table m 
                    LEFT JOIN genres g ON m.genre_id = g.id";
          
          if ($perPage > 0) {
              $offset = ($page - 1) * $perPage;
              $query .= " LIMIT ? OFFSET ?";
              $stmt = $this->conn->prepare($query);
              $stmt->bind_param("ii", $perPage, $offset);
          } else {
              $stmt = $this->conn->prepare($query);
          }
          
          $stmt->execute();
          return $stmt->get_result();
      }

      public function getById($id) {
          $query = "SELECT m.*, g.name as genre_name 
                    FROM $this->table m 
                    LEFT JOIN genres g ON m.genre_id = g.id 
                    WHERE m.id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $id);
          $stmt->execute();
          $movie = $stmt->get_result()->fetch_assoc();

          if ($movie) {
              $queryActors = "SELECT a.id, a.name, a.profile_url, ma.role 
                              FROM actors a 
                              JOIN movie_actors ma ON a.id = ma.actor_id 
                              WHERE ma.movie_id = ?";
              $stmtActors = $this->conn->prepare($queryActors);
              $stmtActors->bind_param("i", $id);
              $stmtActors->execute();
              $actorsResult = $stmtActors->get_result();
              $actors = [];
              while ($actor = $actorsResult->fetch_assoc()) {
                  $actors[] = $actor;
              }
              $movie['actors'] = $actors;
          }

          return $movie;
      }

      public function create($title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id) {
          $query = "INSERT INTO $this->table (title, description, release_date, poster_url, trailer_url, duration, imdb_rating, director, genre_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("sssssidss", $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id);
          return $stmt->execute() ? $this->conn->insert_id : false;
      }

      public function update($id, $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id) {
          $query = "UPDATE $this->table 
                    SET title = ?, description = ?, release_date = ?, poster_url = ?, trailer_url = ?, duration = ?, imdb_rating = ?, director = ?, genre_id = ? 
                    WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("sssssidssi", $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id, $id);
          return $stmt->execute();
      }

      public function delete($id) {
          $query = "DELETE FROM $this->table WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $id);
          return $stmt->execute();
      }

      public function search($keyword, $page = 1, $perPage = 0) {
          $keyword = "%$keyword%";
          $query = "SELECT m.*, g.name as genre_name 
                    FROM $this->table m 
                    LEFT JOIN genres g ON m.genre_id = g.id 
                    WHERE m.title LIKE ? OR m.description LIKE ? OR m.director LIKE ?";
          
          if ($perPage > 0) {
              $offset = ($page - 1) * $perPage;
              $query .= " LIMIT ? OFFSET ?";
              $stmt = $this->conn->prepare($query);
              $stmt->bind_param("sssii", $keyword, $keyword, $keyword, $perPage, $offset);
          } else {
              $stmt = $this->conn->prepare($query);
              $stmt->bind_param("sss", $keyword, $keyword, $keyword);
          }
          
          $stmt->execute();
          return $stmt->get_result();
      }

      public function getByGenre($genre_name, $page = 1, $perPage = 0) {
          $query = "SELECT m.*, g.name as genre_name 
                    FROM $this->table m 
                    LEFT JOIN genres g ON m.genre_id = g.id 
                    WHERE g.name = ?";
          
          if ($perPage > 0) {
              $offset = ($page - 1) * $perPage;
              $query .= " LIMIT ? OFFSET ?";
              $stmt = $this->conn->prepare($query);
              $stmt->bind_param("sii", $genre_name, $perPage, $offset);
          } else {
              $stmt = $this->conn->prepare($query);
              $stmt->bind_param("s", $genre_name);
          }
          
          $stmt->execute();
          return $stmt->get_result();
      }
  }
  ?>