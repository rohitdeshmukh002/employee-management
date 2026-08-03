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

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'employee',
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status VARCHAR(20) NOT NULL DEFAULT 'present',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (employee_id, date)
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
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
