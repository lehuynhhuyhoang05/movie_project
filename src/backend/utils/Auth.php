<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/JWTExceptionWithPayloadInterface.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/BeforeValidException.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/ExpiredException.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/SignatureInvalidException.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/JWK.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/JWT.php';
require_once __DIR__ . '/../vendor/firebase-php-jwt/src/Key.php';



use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Auth {
    private static $userModel;
    private static $secretKey = 'Hoang24042005';

    public static function init() {
        if (!self::$userModel) {
            self::$userModel = new User();
        }
    }

    public static function generateToken($userId, $role) {
        error_log("generateToken called with userId: $userId, role: $role");

        $payload = [
            'iss' => 'http://movieon.atwebpages.com',
            'aud' => 'http://movieonfe.atwebpages.com',
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60),
            'user_id' => $userId,
            'role' => $role
        ];

        try {
            $token = JWT::encode($payload, self::$secretKey, 'HS256');
            error_log("Generated Token in generateToken: " . $token);
            return $token;
        } catch (Exception $e) {
            error_log("JWT Encode Error: " . $e->getMessage());
            return false;
        }
    }

    public static function verifyToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(self::$secretKey, 'HS256'));
            return [
                'user_id' => $decoded->user_id,
                'role' => $decoded->role
            ];
        } catch (Exception $e) {
            error_log("JWT Decode Error: " . $e->getMessage());
            return false;
        }
    }

    private static function getAuthHeader() {
        if (function_exists('getallheaders')) {
            $headers = array_change_key_case(getallheaders(), CASE_LOWER);
        } else {
            $headers = [];
            foreach ($_SERVER as $key => $value) {
                if (str_starts_with($key, 'HTTP_')) {
                    $name = strtolower(str_replace('_', '-', substr($key, 5)));
                    $headers[$name] = $value;
                }
            }
        }
        // Fallback: Lấy token từ query parameter nếu header không có
        return $headers['authorization'] ?? ($_GET['token'] ?? '');
    }

    public static function isAdmin() {
        $authHeader = self::getAuthHeader();
        error_log("AUTH HEADER: $authHeader");

        if (empty($authHeader)) {
            return false;
        }

        // Xóa tiền tố 'Bearer ' nếu có, nếu không thì giữ nguyên token
        $token = trim(str_starts_with($authHeader, 'Bearer ') ? str_replace('Bearer ', '', $authHeader) : $authHeader);
        if (substr_count($token, '.') !== 2) {
            return false;
        }

        $payload = self::verifyToken($token);
        error_log("TOKEN PAYLOAD: " . print_r($payload, true));

        return $payload && ($payload['role'] ?? null) === 'admin';
    }

    public static function check() {
        $authHeader = self::getAuthHeader();
        if (empty($authHeader)) return false;

        // Xóa tiền tố 'Bearer ' nếu có, nếu không thì giữ nguyên token
        $token = trim(str_starts_with($authHeader, 'Bearer ') ? str_replace('Bearer ', '', $authHeader) : $authHeader);
        return self::verifyToken($token) !== false;
    }

    public static function getUserId() {
        $authHeader = self::getAuthHeader();
        if (empty($authHeader)) return null;

        // Xóa tiền tố 'Bearer ' nếu có, nếu không thì giữ nguyên token
        $token = trim(str_starts_with($authHeader, 'Bearer ') ? str_replace('Bearer ', '', $authHeader) : $authHeader);
        $tokenData = self::verifyToken($token);
        return $tokenData ? $tokenData['user_id'] : null;
    }

    public static function login($username, $password) {
        self::init();
        error_log("Attempting login for username: " . $username);

        $user = self::$userModel->findByUsername($username);
        error_log("User found: " . print_r($user, true));

        if ($user && $user['password'] === $password && $user['is_verified'] == 1) {
            $token = self::generateToken($user['id'], $user['role']);
            error_log("Token generated successfully: " . $token);
            return $token;
        }

        error_log("Login failed for user: " . $username);
        return false;
    }

    public static function logout() {
        return true;
    }
}