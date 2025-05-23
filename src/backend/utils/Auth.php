<?php
require_once __DIR__ . '/../models/User.php';

class Auth {
    private static $userModel;

    public static function init() {
        self::$userModel = new User();
    }

    public static function check() {
        session_start();
        return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
    }

    public static function getUserId() {
        session_start();
        return $_SESSION['user_id'] ?? null;
    }

    public static function isAdmin() {
        if (!self::check()) return false;
        $user = self::$userModel->getById(self::getUserId());
        return $user && $user['role'] === 'admin';
    }

    public static function login($username, $password) {
        session_start();
        self::init();
        $user = self::$userModel->findByUsername($username);
        if ($user && $user['password'] === $password) {
            $_SESSION['user_id'] = $user['id'];
            return true;
        }
        return false;
    }

    public static function logout() {
        session_start();
        unset($_SESSION['user_id']);
        session_destroy();
    }
}
?>