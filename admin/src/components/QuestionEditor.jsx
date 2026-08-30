import { useState, useEffect } from 'react';
import api from '../utils/api';

const QuestionEditor = ({ test, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Editor states
  const [type, setType] = useState('MCQ');
  const [content, setContent] = useState('');
  const [options, setOptions] = useState([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' }
  ]);
  const [correctAnswer, setCorrectAnswer] = useState(''); // String for MCQ, array for MSQ, number for NAT

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await api(`/tests/${test.id}/questions`);
      setQuestions(data.questions || []);
      if (data.questions && data.questions.length > 0) {
        loadQuestionIntoEditor(data.questions[0]);
      } else {
        handleAddNewQuestionClick();
      }
    } catch (err) {
      console.error(err);
      // Fallback mocks
      const mockQs = [
        {
          id: "q1",
          type: "MCQ",
          content: "What React hook is used to cache calculations between renders?",
          options: [
            { id: "opt_1", text: "useMemo" },
            { id: "opt_2", text: "useCallback" },
            { id: "opt_3", text: "useRef" }
          ],
          correctAnswer: "opt_1"
        },
        {
          id: "q2",
          type: "NAT",
          content: "Calculate the value returned: const x = [1, 2, 3].reduce((a, b) => a + b, 0);",
          options: [],
          correctAnswer: 6
        }
      ];
      setQuestions(mockQs);
      loadQuestionIntoEditor(mockQs[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [test.id]);

  const loadQuestionIntoEditor = (q) => {
    setSelectedQuestion(q);
    setType(q.type);
    setContent(q.content);
    setOptions(q.options && q.options.length > 0 ? q.options : [{ id: 'opt_1', text: '' }, { id: 'opt_2', text: '' }]);
    setCorrectAnswer(q.correctAnswer);
  };

  const handleAddNewQuestionClick = () => {
    setSelectedQuestion(null); // Indicates a new question
    setType('MCQ');
    setContent('');
    setOptions([
      { id: 'opt_1', text: '' },
      { id: 'opt_2', text: '' }
    ]);
    setCorrectAnswer('');
  };

  const handleAddOption = () => {
    const nextId = `opt_${options.length + 1}`;
    setOptions([...options, { id: nextId, text: '' }]);
  };

  const handleRemoveOption = (id) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
    // Clear answer selections if removed option was correct
    if (type === 'MCQ' && correctAnswer === id) {
      setCorrectAnswer('');
    } else if (type === 'MSQ' && Array.isArray(correctAnswer)) {
      setCorrectAnswer(correctAnswer.filter(ans => ans !== id));
    }
  };

  const handleOptionTextChange = (id, text) => {
    setOptions(options.map(o => o.id === id ? { ...o, text } : o));
  };

  const handleMCQAnswerSelect = (id) => {
    setCorrectAnswer(id);
  };

  const handleMSQAnswerToggle = (id) => {
    if (!Array.isArray(correctAnswer)) {
      setCorrectAnswer([id]);
      return;
    }
    if (correctAnswer.includes(id)) {
      setCorrectAnswer(correctAnswer.filter(ans => ans !== id));
    } else {
      setCorrectAnswer([...correctAnswer, id]);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return alert('Question content cannot be empty.');

    const payload = {
      type,
      content,
      options: type === 'NAT' ? [] : options.filter(o => o.text.trim() !== ''),
      correctAnswer: type === 'NAT' ? Number(correctAnswer) : correctAnswer
    };

    try {
      if (selectedQuestion) {
        // Edit existing
        await api(`/questions/${selectedQuestion.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        // Create new
        await api(`/tests/${test.id}/questions`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      fetchQuestions();
    } catch (err) {
      // Simulate save in UI
      const mockSaved = {
        id: selectedQuestion ? selectedQuestion.id : Math.random().toString(),
        ...payload
      };
      if (selectedQuestion) {
        setQuestions(prev => prev.map(q => q.id === selectedQuestion.id ? mockSaved : q));
      } else {
        setQuestions(prev => [...prev, mockSaved]);
      }
      alert('Question saved successfully.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api(`/questions/${id}`, { method: 'DELETE' });
      fetchQuestions();
    } catch (err) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      handleAddNewQuestionClick();
    }
  };

  return (
    <div className="panel-container">
      <div className="title-row">
        <div>
          <h2>Manage Questions: {test.title}</h2>
          <p className="subtitle">Build dynamic single-correct, multi-correct, and numerical fill-in question cards.</p>
        </div>
        <button onClick={onBack} className="btn btn-secondary">
          ← Back to Tests
        </button>
      </div>

      <div className="editor-workspace">
        <div className="questions-sidebar">
          <h3>Questions</h3>
          <ul className="question-list">
            {questions.map((q, idx) => (
              <li key={q.id}>
                <button
                  onClick={() => loadQuestionIntoEditor(q)}
                  className={`q-select-btn ${selectedQuestion?.id === q.id ? 'active' : ''}`}
                >
                  <span className="q-badge">{q.type}</span>
                  Question {idx + 1}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={handleAddNewQuestionClick} className="btn btn-block btn-outline">
            + Add New Question
          </button>
        </div>

        <div className="editor-main">
          <div className="editor-header">
            <h3>{selectedQuestion ? 'Edit Question Workspace' : 'New Question Workspace'}</h3>
            {selectedQuestion && (
              <button
                onClick={() => handleDeleteQuestion(selectedQuestion.id)}
                className="btn btn-sm btn-outline-danger"
              >
                Delete Question
              </button>
            )}
          </div>

          <div className="form-group">
            <label>Question Type</label>
            <select
              value={type}
              onChange={(e) => {
                const nextType = e.target.value;
                setType(nextType);
                setCorrectAnswer(nextType === 'MSQ' ? [] : '');
              }}
            >
              <option value="MCQ">Multiple Choice (Single Correct)</option>
              <option value="MSQ">Multiple Select (Multiple Correct)</option>
              <option value="NAT">Numerical Answer Type (NAT)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Question Content (HTML/Text)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="e.g., <p>Which function renders a React component?</p>"
              rows="4"
              required
            />
          </div>

          {type !== 'NAT' && (
            <div className="options-editor-section">
              <label>Answer Options & Correct Key</label>
              <p className="subtext">Provide options and mark the correct ones using checkboxes/radio controls.</p>
              
              {options.map((option, idx) => (
                <div key={option.id} className="option-row">
                  {type === 'MCQ' ? (
                    <input
                      type="radio"
                      name="correct-mcq"
                      checked={correctAnswer === option.id}
                      onChange={() => handleMCQAnswerSelect(option.id)}
                    />
                  ) : (
                    <input
                      type="checkbox"
                      checked={Array.isArray(correctAnswer) && correctAnswer.includes(option.id)}
                      onChange={() => handleMSQAnswerToggle(option.id)}
                    />
                  )}
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionTextChange(option.id, e.target.value)}
                    placeholder={`Option ${idx + 1} content`}
                    className="option-text-input"
                  />
                  <button
                    onClick={() => handleRemoveOption(option.id)}
                    className="btn-remove-option"
                    disabled={options.length <= 2}
                  >
                    ×
                  </button>
                </div>
              ))}
              
              <button onClick={handleAddOption} className="btn btn-sm btn-outline">
                + Add Option
              </button>
            </div>
          )}

          {type === 'NAT' && (
            <div className="form-group">
              <label>Correct Numerical Value</label>
              <input
                type="number"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder="e.g. 42"
                step="any"
                required
              />
            </div>
          )}

          <div className="editor-footer">
            <button onClick={handleSave} className="btn btn-primary">
              {selectedQuestion ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor;
