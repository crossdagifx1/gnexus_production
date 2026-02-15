-- ============================================
-- Super Admin Account - Direct SQL Setup
-- ============================================
-- Account: crossdagi / crossdagi@gmail.com
-- Password: dAgi1431
-- Role: admin (super admin)
-- ============================================

-- Pre-generated bcrypt hash for password: dAgi1431
-- Cost: 12
-- Hash: $2y$12$QXXhKJ3qYLZdU9Z7F.dWLOvEHvLYzJPqgEqF8YKXmVJZp8QZdHJSu

-- Step 1: Insert Super Admin User
INSERT INTO cms_users (
    username,
    email,
    password_hash,
    full_name,
    role,
    is_verified,
    created_at,
    updated_at
) VALUES (
    'crossdagi',
    'crossdagi@gmail.com',
    '$2y$12$QXXhKJ3qYLZdU9Z7F.dWLOvEHvLYzJPqgEqF8YKXmVJZp8QZdHJSu',
    'Cross Dagi',
    'admin',
    1,
    NOW(),
    NOW()
);

-- Step 2: Get the user ID
SET @user_id = LAST_INSERT_ID();

-- Step 3: Create linked client account
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
) VALUES (
    @user_id,
    'G-Nexus Agency',
    'Cross Dagi',
    'crossdagi@gmail.com',
    '+251 912 345 678',
    'active',
    NOW(),
    NOW(),
    NOW()
);

-- Step 4: Verify account creation
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    is_verified,
    created_at
FROM cms_users 
WHERE username = 'crossdagi';

SELECT 
    id,
    user_id,
    company_name,
    contact_email,
    account_status,
    created_at
FROM clients 
WHERE contact_email = 'crossdagi@gmail.com';

-- ============================================
-- DONE! You can now login with:
-- Username: crossdagi (or crossdagi@gmail.com)
-- Password: dAgi1431
-- ============================================
