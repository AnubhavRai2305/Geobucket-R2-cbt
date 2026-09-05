import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

function StudentManager() {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsData, testsData] = await Promise.all([
        api('/students'),
        api('/tests')
      ]);
      setStudents(studentsData.students || []);
      setTests(testsData.tests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleEligibility = async (studentId, testId) => {
    try {
      const student = students.find(s => s._id === studentId);
      const isEligible = student.eligibleTests.some(t => t._id === testId);
      
      let newEligibleTests;
      if (isEligible) {
        newEligibleTests = student.eligibleTests.filter(t => t._id !== testId).map(t => t._id);
      } else {
        newEligibleTests = [...student.eligibleTests.map(t => t._id), testId];
      }

      const res = await api(`/students/${studentId}/eligibility`, {
        method: 'PATCH',
        body: JSON.stringify({ eligibleTests: newEligibleTests })
      });

      if (res.success) {
        // Update local state
        setStudents(prev => prev.map(s => {
          if (s._id === studentId) {
            return { ...s, eligibleTests: res.student.eligibleTests };
          }
          return s;
        }));
      }
    } catch (err) {
      alert("Failed to update eligibility: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="view-loader-container">
        <div className="spinner"></div>
        <p>Loading students...</p>
      </div>
    );
  }

  return (
    <div className="panel-container">
      <div className="title-row">
        <div>
          <h2>Student Management</h2>
          <p className="subtitle">Assign students to tests and manage their eligibility.</p>
        </div>
        <button className="btn btn-primary" onClick={fetchData}>Refresh</button>
      </div>

      {error && <div className="error-message">Error: {error}</div>}

      <div className="attempts-table-container">
        <table className="attempts-table">
          <thead>
            <tr>
              <th>Roll Number</th>
              <th>Name</th>
              <th>Email</th>
              <th>Eligible Tests</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student._id}>
                <td>{student.rollNumber}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {tests.map(test => {
                      const isEligible = student.eligibleTests.some(t => t._id === test._id);
                      return (
                        <label key={test._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          <input 
                            type="checkbox" 
                            checked={isEligible}
                            onChange={() => toggleEligibility(student._id, test._id)}
                            style={{ cursor: 'pointer' }}
                          />
                          {test.title} {test.isActive ? '' : '(Inactive)'}
                        </label>
                      );
                    })}
                    {tests.length === 0 && <span style={{ color: 'var(--text-muted)' }}>No tests available</span>}
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No students registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentManager;
