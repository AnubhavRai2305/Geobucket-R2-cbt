import { useState, useEffect } from 'react';
import api from '../utils/api';

const TestBuilder = ({ onEditQuestions }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  
  // New test state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [language, setLanguage] = useState('English');
  const [durationMinutes, setDurationMinutes] = useState(15);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await api('/tests');
      setTests(data.tests || []);
    } catch (err) {
      console.error(err);
      // Fallback presentation templates if empty
      setTests([
        { id: "1", title: "React Core Concepts", subject: "Javascript", topic: "React", language: "English", durationMinutes: 15, isActive: true },
        { id: "2", title: "Node Server Architecture", subject: "Backend Development", topic: "Node.js", language: "English", durationMinutes: 15, isActive: false }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      await api(`/tests/${id}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchTests();
    } catch {
      // Simulate toggle in UI
      setTests(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, isActive: !currentStatus } : t));
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await api(`/tests/${id}/publish`, {
        method: 'PATCH',
      });
      fetchTests();
    } catch {
      // Simulate toggle in UI
      setTests(prev => prev.map(t => (t._id === id || t.id === id) ? { ...t, resultsPublished: !currentStatus } : t));
    }
  };

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setError('');

    const payload = {
      title,
      description,
      subject,
      topic,
      language,
      durationMinutes,
      markingScheme: {
        MCQ: { correct: 4, incorrect: -1, unattempted: 0 },
        MSQ: { correct: 4, incorrect: 0, unattempted: 0 },
        NAT: { correct: 4, incorrect: 0, unattempted: 0 }
      }
    };

    try {
      await api('/tests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setShowModal(false);
      // Clear forms
      setTitle('');
      setDescription('');
      setSubject('');
      setTopic('');
      fetchTests();
    } catch {
      // Mock insert on UI for demo if no backend running
      const newTest = {
        id: Math.random().toString(),
        title,
        description,
        subject,
        topic,
        language,
        durationMinutes,
        isActive: false
      };
      setTests(prev => [...prev, newTest]);
      setShowModal(false);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test? This will remove all questions.')) return;
    try {
      await api(`/tests/${id}`, { method: 'DELETE' });
      fetchTests();
    } catch {
      setTests(prev => prev.filter(t => (t._id || t.id) !== id));
    }
  };

  return (
    <div className="panel-container">
      <div className="title-row">
        <div>
          <h2>Mock Test Builder</h2>
          <p className="subtitle">Configure exam parameters, marking formats, and activate test scopes.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Create Mock Test
        </button>
      </div>

      {loading ? (
        <div className="text-center">Loading tests...</div>
      ) : (
        <div className="attempts-table-container">
          <table className="attempts-table">
            <thead>
              <tr>
                <th>Test Title</th>
                <th>Subject / Topic</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(test => {
                const testId = test._id || test.id;
                return (
                  <tr key={testId}>
                    <td><strong>{test.title}</strong></td>
                    <td>{test.subject} / <span className="text-muted">{test.topic}</span></td>
                    <td>{test.durationMinutes} minutes</td>
                    <td>
                      <button
                        onClick={() => handleToggleActive(testId, test.isActive)}
                        className={`status-btn status-${test.isActive ? 'active' : 'inactive'}`}
                      >
                        {test.isActive ? 'Active (Published)' : 'Inactive (Draft)'}
                      </button>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          onClick={() => onEditQuestions(test)}
                          className="btn btn-sm btn-outline"
                        >
                          Edit Questions
                        </button>
                        <button
                          onClick={() => handleTogglePublish(testId, test.resultsPublished)}
                          className={`btn btn-sm ${test.resultsPublished ? 'btn-outline-danger' : 'btn-primary'}`}
                        >
                          {test.resultsPublished ? 'Hide Results' : 'Publish Results'}
                        </button>
                        <button
                          onClick={() => handleDeleteTest(testId)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {tests.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center">No test modules created. Click Create Mock Test to add one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Mock Test Module</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateTest}>
              {error && <div className="error-message">{error}</div>}
              <div className="form-group">
                <label>Test Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. React Intermediate Mock" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide short guidelines for candidates..." />
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Subject</label>
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="e.g., Computer Science" />
                </div>
                <div className="form-group col">
                  <label>Topic</label>
                  <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} required placeholder="e.g., Hooks" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col">
                  <label>Language</label>
                  <input type="text" value={language} onChange={(e) => setLanguage(e.target.value)} required />
                </div>
                <div className="form-group col">
                  <label>Duration (Minutes)</label>
                  <input type="number" value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} required min="1" />
                </div>
              </div>
              
              <div className="marking-preview">
                <strong>Marking Configurations:</strong>
                <ul>
                  <li>MCQ: +4 for Correct, -1 for Incorrect</li>
                  <li>MSQ: +4 for Correct, 0 for Incorrect (Full correct match required)</li>
                  <li>NAT: +4 for Correct, 0 for Incorrect</li>
                </ul>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Save Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestBuilder;
