<?php
  require_once __DIR__ . '/../config/database.php';

  class Genre {
      private $conn;
      private $table = 'genres';

      public function __construct() {
          $database = new Database();
          $this->conn = $database->getConnection();
      }

      public function getAll() {
          $query = "SELECT * FROM $this->table";
          $stmt = $this->conn->prepare($query);
          $stmt->execute();
          return $stmt->get_result();
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