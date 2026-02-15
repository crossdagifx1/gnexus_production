<?php
/**
 * Super Admin Account Creator
 * 
 * This script creates a super admin account with:
 * - Username: crossdagi
 * - Email: crossdagi@gmail.com
 * - Password: dAgi1431
 * - Role: admin
 * 
 * Run this script once to set up the account.
 */

require_once __DIR__ . '/db.php';

// Account details
$username = 'crossdagi';
$email = 'crossdagi@gmail.com';
$password = 'dAgi1431';
$fullName = 'Cross Dagi';
$role = 'admin';

// Company details for client account
$companyName = 'G-Nexus Agency';
$contactPhone = '+251 912 345 678';

try {
    // Start transaction
    $pdo->beginTransaction();
    
    // 1. Hash the password
    $passwordHash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    
    // 2. Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM cms_users WHERE username = ? OR email = ?");
    $stmt->execute([$username, $email]);
    
    if ($stmt->fetch()) {
        throw new Exception("User with username '$username' or email '$email' already exists!");
    }
    
    // 3. Create the super admin user
    $stmt = $pdo->prepare("
        INSERT INTO cms_users (
            username,
            email,
            password_hash,
            full_name,
            role,
            is_verified,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
    ");
    
    $stmt->execute([
        $username,
        $email,
        $passwordHash,
        $fullName,
        $role
    ]);
    
    $userId = $pdo->lastInsertId();
    
    // 4. Create client account linked to this admin user
    $stmt = $pdo->prepare("
        INSERT INTO clients (
            user_id,
            company_name,
            contact_person,
            contact_email,
            contact_phone,
            account_status,
            onboarding_date,
            created_at,
            updated_at
        ) VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW(), NOW())
    ");
    
    $stmt->execute([
        $userId,
        $companyName,
        $fullName,
        $email,
        $contactPhone
    ]);
    
    $clientId = $pdo->lastInsertId();
    
    // Commit transaction
    $pdo->commit();
    
    // Success message
    echo "✅ Super Admin Account Created Successfully!\n\n";
    echo "═══════════════════════════════════════════\n";
    echo "Username:      $username\n";
    echo "Email:         $email\n";
    echo "Password:      $password\n";
    echo "Role:          $role\n";
    echo "User ID:       $userId\n";
    echo "Client ID:     $clientId\n";
    echo "═══════════════════════════════════════════\n\n";
    echo "You can now login with:\n";
    echo "→ Username: $username (or email: $email)\n";
    echo "→ Password: $password\n\n";
    echo "⚠️  IMPORTANT: Change the password after first login!\n\n";
    
} catch (Exception $e) {
    // Rollback on error
    $pdo->rollBack();
    echo "❌ Error creating super admin account:\n";
    echo $e->getMessage() . "\n";
    exit(1);
}
