<?php
class Database {
    private $host = "localhost:3306"; // Sử dụng cổng 3308 như đã cấu hình
    private $username = "root";
    private $password = "Hoang24042005@";
    private $database = "movie_db";
    public $connection;

    public function __construct() {
        $this->connection = new mysqli(
            $this->host, $this->username,
            $this->password, $this->database
        );

        if ($this->connection->connect_error) {
            die("Connection failed: " . $this->connection->connect_error);
        }
        // echo "Connected successfully!"; // Bỏ comment nếu cần test
    }

    public function getConnection() {
        return $this->connection;
    }

    public function closeConnection() {
        $this->connection->close();
    }
}

$db = new Database();
?>