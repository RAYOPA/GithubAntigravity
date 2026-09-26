-- 01_extensions.sql
-- Enable pgcrypto for UUID generation and cryptographic functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable btree_gist for GiST exclusion constraints on scalar + range types
CREATE EXTENSION IF NOT EXISTS btree_gist;
