-- Update score column to allow higher precision
ALTER TABLE candidates ALTER COLUMN score TYPE NUMERIC(10, 2);
