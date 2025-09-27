-- Update existing SUPER_ADMIN and SUPPORT roles to ADMIN
UPDATE admin_users SET role = 'ADMIN' WHERE role IN ('SUPER_ADMIN', 'SUPPORT');
