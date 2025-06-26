<?php
class Database {
    private $host;
    private $username;
    private $password;
    private $database;
    public $connection;

    public function __construct() {
        $isLocalhost = (isset($_SERVER['HTTP_HOST']) && in_array(strtolower($_SERVER['HTTP_HOST']), ['localhost', '127.0.0.1']))
            || (php_sapi_name() === 'cli');

        if ($isLocalhost || (isset($_SERVER['ENV']) && $_SERVER['ENV'] === 'local')) {
            $this->host = 'localhost';
            $this->username = 'root';
            $this->password = 'Hoang24042005@';
            $this->database = 'movie_db';
        } else {
            $this->host = 'fdb1028.awardspace.net';
            $this->username = '4640158_moviedb';
            $this->password = 'Hoang24042005';
            $this->database = '4640158_moviedb';
        }

        $this->connection = new mysqli(
            $this->host,
            $this->username,
            $this->password,
            $this->database
        );

        if ($this->connection->connect_error) {
            error_log("Connection failed: " . $this->connection->connect_error);
            throw new Exception("Connection failed: " . $this->connection->connect_error);
        }

        $this->connection->set_charset("utf8mb4");
    }

    public function getConnection() {
        return $this->connection;
    }

    public function closeConnection() {
        $this->connection->close();
    }
}
?>