<?php
  require_once __DIR__ . '/../models/Review.php';
  require_once __DIR__ . '/../utils/Auth.php';

  class ReviewController {
      private $reviewModel;

      public function __construct() {
          $this->reviewModel = new Review();
      }

      public function getByMovie($movie_id) {
          $reviews = $this->reviewModel->getByMovieId($movie_id);
          $data = [];
          while ($row = $reviews->fetch_assoc()) {
              $data[] = $row;
          }
          header('Content-Type: application/json');
          echo json_encode(["status" => "success", "data" => $data]);
      }

      public function create() {
          if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
              echo json_encode(["status" => "error", "message" => "Method not allowed"]);
              return;
          }

          if (!Auth::check()) {
              echo json_encode(["status" => "error", "message" => "Login required"]);
              return;
          }

          $data = json_decode(file_get_contents('php://input'), true);
          $movie_id = $data['movie_id'] ?? 0;
          $rating = $data['rating'] ?? 0;
          $comment = $data['comment'] ?? '';
          $user_id = Auth::getUserId();

          if ($rating < 1 || $rating > 10 || $movie_id <= 0) {
              echo json_encode(["status" => "error", "message" => "Invalid movie_id or rating"]);
              return;
          }

          $reviewId = $this->reviewModel->create($movie_id, $user_id, $rating, $comment);
          if ($reviewId) {
              echo json_encode(["status" => "success", "message" => "Review added", "review_id" => $reviewId]);
          } else {
              echo json_encode(["status" => "error", "message" => "Failed to add review"]);
          }
      }

      public function update($id) {
          if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
              echo json_encode(["status" => "error", "message" => "Method not allowed"]);
              return;
          }

          if (!Auth::check()) {
              echo json_encode(["status" => "error", "message" => "Login required"]);
              return;
          }

          $review = $this->reviewModel->getById($id);
          if (!$review) {
              echo json_encode(["status" => "error", "message" => "Review not found"]);
              return;
          }

          $user_id = Auth::getUserId();
          if ($review['user_id'] !== $user_id && !Auth::isAdmin()) {
              echo json_encode(["status" => "error", "message" => "Permission denied"]);
              return;
          }

          $data = json_decode(file_get_contents('php://input'), true);
          $rating = $data['rating'] ?? 0;
          $comment = $data['comment'] ?? '';

          if ($rating < 1 || $rating > 10) {
              echo json_encode(["status" => "error", "message" => "Invalid rating"]);
              return;
          }

          if ($this->reviewModel->update($id, $rating, $comment)) {
              echo json_encode(["status" => "success", "message" => "Review updated"]);
          } else {
              echo json_encode(["status" => "error", "message" => "Failed to update review"]);
          }
      }

      public function delete($id) {
          if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
              echo json_encode(["status" => "error", "message" => "Method not allowed"]);
              return;
          }

          if (!Auth::check()) {
              echo json_encode(["status" => "error", "message" => "Login required"]);
              return;
          }

          $review = $this->reviewModel->getById($id);
          if (!$review) {
              echo json_encode(["status" => "error", "message" => "Review not found"]);
              return;
          }

          $user_id = Auth::getUserId();
          if ($review['user_id'] !== $user_id && !Auth::isAdmin()) {
              echo json_encode(["status" => "error", "message" => "Permission denied"]);
              return;
          }

          if ($this->reviewModel->delete($id)) {
              echo json_encode(["status" => "success", "message" => "Review deleted"]);
          } else {
              echo json_encode(["status" => "error", "message" => "Failed to delete review"]);
          }
      }
  }
  ?>