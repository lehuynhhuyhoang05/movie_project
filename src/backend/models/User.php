<?php
  require_once __DIR__ . '/../config/database.php';

  class User {
      private $conn;
      private $table = 'users';

      public function __construct() {
          $database = new Database();
          $this->conn = $database->getConnection();
      }

      public function findByUsername($username) {
          $query = "SELECT * FROM $this->table WHERE username = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("s", $username);
          $stmt->execute();
          return $stmt->get_result()->fetch_assoc();
      }

      public function getById($id) {
          $query = "SELECT * FROM $this->table WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $id);
          $stmt->execute();
          return $stmt->get_result()->fetch_assoc();
      }

      public function getAll() {
          $query = "SELECT id, username, email, role, created_at, updated_at FROM $this->table";
          $stmt = $this->conn->prepare($query);
          $stmt->execute();
          return $stmt->get_result();
      }

      public function create($username, $password, $email, $role = 'user') {
          $query = "INSERT INTO $this->table (username, password, email, role) VALUES (?, ?, ?, ?)";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("ssss", $username, $password, $email, $role);
          return $stmt->execute() ? $this->conn->insert_id : false;
      }

      public function delete($id) {
          $query = "DELETE FROM $this->table WHERE id = ?";
          $stmt = $this->conn->prepare($query);
          $stmt->bind_param("i", $id);
          return $stmt->execute();
      }
  }
  ?>