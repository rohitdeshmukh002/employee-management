import { useEffect, useState } from "react";
import "./App.css";

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  salary: number | null;
  hire_date: string;
};

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/employees")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        return response.json();
      })
      .then((data: Employee[]) => {
        setEmployees(data);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="app">
      <header>
        <h1>Employee Management</h1>
        <p>Data loaded from PostgreSQL via the FastAPI backend.</p>
      </header>

      {loading && <p>Loading employees...</p>}
      {error && <p className="error">Failed to load employees: {error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Hire Date</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  {employee.first_name} {employee.last_name}
                </td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td>{employee.salary != null ? `$${employee.salary.toLocaleString()}` : "—"}</td>
                <td>{employee.hire_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

export default App;
