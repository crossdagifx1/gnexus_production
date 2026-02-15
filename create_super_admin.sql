-- Super Admin Account Setup
-- Username: crossdagi
-- Email: crossdagi@gmail.com
-- Password: dAgi1431
-- Role: admin (super admin)

-- Step 1: Insert the super admin user
-- Note: Password hash for 'dAgi1431' using bcrypt cost 12
-- You'll need to generate this hash using PHP or run the helper script below

-- First, let's insert the user with a placeholder password
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
    '$2y$12$PLACEHOLDER', -- Will be updated via PHP script
    'Cross Dagi',
    'admin',
    1, -- Email verified
    NOW(),
    NOW()
);

-- Get the user ID (will be used for client creation)
SET @user_id = LAST_INSERT_ID();

-- Step 2: Create a client account linked to this admin user
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
    'G-Nexus Agency', -- You can change this
    'Cross Dagi',
    'crossdagi@gmail.com',
    '+251 912 345 678', -- Update with actual phone
    'active',
    NOW(),
    NOW(),
    NOW()
);

-- Verify the account was created
SELECT * FROM cms_users WHERE username = 'crossdagi';
SELECT * FROM clients WHERE contact_email = 'crossdagi@gmail.com';
