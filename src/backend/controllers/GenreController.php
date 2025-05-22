<?php
  require_once __DIR__ . '/../models/Genre.php';

  class GenreController {
      private $genreModel;

      public function __construct() {
          $this->genreModel = new Genre();
      }

      public function index() {
          $genres = $this->genreModel->getAll();
          $data = [];
          while ($row = $genres->fetch_assoc()) {
              $data[] = $row;
          }
          header('Content-Type: application/json');
          echo json_encode(["status" => "success", "data" => $data]);
      }
  }
  ?>