<?php
  require_once __DIR__ . '/../config/database.php';

  class Review {
      private $conn;
      private $table = 'reviews';

      public function __construct() {
          $database = new Database();
          $this->conn = $database->getConnection();
      }

      public function getByMovieId($movie_id) {
          $query = "SELECT r.*, u.username 
                    FROM $this->table r 
                    JOIN users u ON r.user_id = u.id 
                    WHERE r.movie_id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $movie_id);
          $stmt->execute();
          return $stmt->get_result();
      }

      public function create($movie_id, $user_id, $rating, $comment) {
          $query = "INSERT INTO $this->table (movie_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("iiis", $movie_id, $user_id, $rating, $comment);
          return $stmt->execute() ? $this->conn->insert_id : false;
      }

      public function update($id, $rating, $comment) {
          $query = "UPDATE $this->table SET rating = ?, comment = ? WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("isi", $rating, $comment, $id);
          return $stmt->execute();
      }

      public function delete($id) {
          $query = "DELETE FROM $this->table WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $id);
          return $stmt->execute();
      }

      public function getById($id) {
          $query = "SELECT * FROM $this->table WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $id);
          $stmt->execute();
          return $stmt->get_result()->fetch_assoc();
      }
  }
  ?>