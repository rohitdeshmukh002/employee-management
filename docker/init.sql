CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary NUMERIC(10, 2),
    hire_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (first_name, last_name, email, department, position, salary, hire_date)
VALUES
    ('Alice', 'Johnson', 'alice.johnson@company.com', 'Engineering', 'Software Engineer', 85000.00, '2022-03-15'),
    ('Bob', 'Smith', 'bob.smith@company.com', 'Human Resources', 'HR Manager', 72000.00, '2021-07-01'),
    ('Carol', 'Williams', 'carol.williams@company.com', 'Finance', 'Accountant', 68000.00, '2023-01-10'),
    ('David', 'Brown', 'david.brown@company.com', 'Engineering', 'DevOps Engineer', 90000.00, '2020-11-20'),
    ('Eva', 'Davis', 'eva.davis@company.com', 'Marketing', 'Marketing Lead', 75000.00, '2022-09-05')
ON CONFLICT (email) DO NOTHING;
