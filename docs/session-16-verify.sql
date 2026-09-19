-- Run in DBeaver SQL Editor connected to campus_crew / public.
SELECT current_database(), current_user, version();

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- PK, FK and ON DELETE rules (unique constraints appear as indexes below).
SELECT conrelid::regclass AS table_name, conname,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY table_name, conname;

SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

SELECT t.typname, e.enumlabel
FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typnamespace = 'public'::regnamespace
ORDER BY t.typname, e.enumsortorder;

-- Before seed: 0 / 0 / 0 in a fresh DB; after seed: 3 / 6 / 3.
SELECT 'users' AS table_name, count(*) AS rows FROM users
UNION ALL SELECT 'recruitments', count(*) FROM recruitments
UNION ALL SELECT 'applications', count(*) FROM applications;

SELECT id, email, name, "createdAt", "updatedAt" FROM users ORDER BY id;
SELECT r.id, r.title, r.category, r.status, u.email AS author
FROM recruitments r JOIN users u ON u.id = r."authorId" ORDER BY r.id;
SELECT a.id, u.email AS applicant, r.title, a.message, a.status
FROM applications a
JOIN users u ON u.id = a."applicantId"
JOIN recruitments r ON r.id = a."recruitmentId"
ORDER BY a.id;

SELECT migration_name, finished_at, rolled_back_at
FROM _prisma_migrations ORDER BY started_at;
