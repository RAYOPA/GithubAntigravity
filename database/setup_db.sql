-- setup_db.sql
-- Master setup script to execute all schema, constraints, triggers, seed data, and views in order.

\echo 'Installing extensions...'
\i 01_extensions.sql

\echo 'Creating custom enums...'
\i 02_types.sql

\echo 'Creating database tables...'
\i 03_tables.sql

\echo 'Applying exclusion constraints (GIST)...'
\i 04_constraints.sql

\echo 'Creating indexes...'
\i 05_indexes.sql

\echo 'Creating triggers...'
\i 06_triggers.sql

\echo 'Seeding initial data...'
\i 07_seed_data.sql

\echo 'Creating views...'
\i 08_views.sql

\echo 'Creating report views...'
\i 09_reports.sql

\echo 'Smart Campus Database Setup Successfully Completed!'
