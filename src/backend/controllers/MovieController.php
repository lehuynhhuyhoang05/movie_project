<?php
  require_once __DIR__ . '/../models/Movie.php';
  require_once __DIR__ . '/../utils/Auth.php';

  class MovieController {
      private $movieModel;

      public function __construct() {
          $this->movieModel = new Movie();
      }

      public function index() {
          $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
          $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;
          $movies = $this->movieModel->getAll($page, $perPage);
          $data = [];
          while ($row = $movies->fetch_assoc()) {
              $data[] = $row;
          }
          header('Content-Type: application/json');
          echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
      }

      public function detail($id) {
          $movie = $this->movieModel->getById($id);
          header('Content-Type: application/json');
          echo json_encode(["status" => "success", "data" => $movie ?: ["message" => "Movie not found"]]);
      }

      public function create() {
          if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
              echo json_encode(["status" => "error", "message" => "Method not allowed"]);
              return;
          }

          if (!Auth::isAdmin()) {
              echo json_encode(["status" => "error", "message" => "Admin access required"]);
              return;
          }

          $data = json_decode(file_get_contents('php://input'), true);
          $title = $data['title'] ?? '';
          $description = $data['description'] ?? '';
          $release_date = $data['release_date'] ?? '';
          $poster_url = $data['poster_url'] ?? '';
          $trailer_url = $data['trailer_url'] ?? '';
          $duration = $data['duration'] ?? 0;
          $imdb_rating = $data['imdb_rating'] ?? 0.0;
          $director = $data['director'] ?? '';
          $genre_id = $data['genre_id'] ?? 0;

          if (empty($title) || empty($genre_id)) {
              echo json_encode(["status" => "error", "message" => "Title and genre_id are required"]);
              return;
          }

          $movieId = $this->movieModel->create($title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id);
          if ($movieId) {
              echo json_encode(["status" => "success", "message" => "Movie created", "movie_id" => $movieId]);
          } else {
              echo json_encode(["status" => "error", "message" => "Failed to create movie"]);
          }
      }

      public function update($id) {
          if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
              echo json_encode(["status" => "error", "message" => "Method not allowed"]);
              return;
          }

          if (!Auth::isAdmin()) {
              echo json_encode(["status" => "error", "message" => "Admin access required"]);
              return;
          }

          $data = json_decode(file_get_contents('php://input'), true);
          $title = $data['title'] ?? '';
          $description = $data['description'] ?? '';
          $release_date = $data['release_date'] ?? '';
          $poster_url = $data['poster_url'] ?? '';
          $trailer_url = $data['trailer_url'] ?? '';
          $duration = $data['duration'] ?? 0;
          $imdb_rating = $data['imdb_rating'] ?? 0.0;
          $director = $data['director'] ?? '';
          $genre_id = $data['genre_id'] ?? 0;

          if (empty($title) || empty($genre_id)) {
              echo json_encode(["status" => "error", "message" => "Title and genre_id are required"]);
              return;
          }

          if ($this->movieModel->update($id, $title, $description, $release_date, $poster_url, $trailer_url, $duration, $imdb_rating, $director, $genre_id)) {
              echo json_encode(["status" => "success", "message" => "Movie updated"]);
          } else {
              echo json_encode(["status" => "error", "message" => "Failed to update movie"]);
          }
      }

      public function delete($id) {
          if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
              echo json_encode(["status" => "error", "message" => "Method not allowed"]);
              return;
          }

          if (!Auth::isAdmin()) {
              echo json_encode(["status" => "error", "message" => "Admin access required"]);
              return;
          }

          if ($this->movieModel->delete($id)) {
              echo json_encode(["status" => "success", "message" => "Movie deleted"]);
          } else {
              echo json_encode(["status" => "error", "message" => "Failed to delete movie"]);
          }
      }

      public function search() {
          $keyword = isset($_GET['keyword']) ? $_GET['keyword'] : '';
          $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
          $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;

          if (empty($keyword)) {
              echo json_encode(["status" => "error", "message" => "Keyword is required"]);
              return;
          }

          $movies = $this->movieModel->search($keyword, $page, $perPage);
          $data = [];
          while ($row = $movies->fetch_assoc()) {
              $data[] = $row;
          }
          header('Content-Type: application/json');
          echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
      }

      public function getByGenre($genre_name) {
          $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
          $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 0;

          if (empty($genre_name)) {
              echo json_encode(["status" => "error", "message" => "Genre name is required"]);
              return;
          }

          $movies = $this->movieModel->getByGenre($genre_name, $page, $perPage);
          $data = [];
          while ($row = $movies->fetch_assoc()) {
              $data[] = $row;
          }
          header('Content-Type: application/json');
          echo json_encode(["status" => "success", "data" => $data, "total" => count($data)]);
      }
  }
  ?>