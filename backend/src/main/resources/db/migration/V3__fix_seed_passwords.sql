UPDATE users
SET password_hash = '$2a$10$CD7AW33Zidgh5DDdAmOP7uG4YF.U5OZ/WXUlNM3/9En.OyrA1WMB2',
    updated_at = now()
WHERE email IN (
    'admin@arogyasetu.local',
    'patient@arogyasetu.local',
    'doctor@arogyasetu.local',
    'cardio.demo@arogyasetu.local'
);
