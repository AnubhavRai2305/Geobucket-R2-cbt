import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestList from './components/tests/TestList';
import ExamWindow from './components/exam/ExamWindow';
import ResultSheet from './components/results/ResultSheet';
import './App.css';

function App() {
  React.useEffect(() => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhOTUxNWEyYmJlNDIxMzQyOGJkYjcwYSIsInVzZXJUeXBlIjoic3R1ZGVudCIsImlhdCI6MTc4ODE1Njk1OSwiZXhwIjoxNzkwNzQ4OTU5fQ.InjYecK0YhTV6HnS7rcvhjgukyNYwzoJviQJ-HKtli4');
  }, []);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <main className="content-area">
          <Routes>
            <Route path="/" element={<TestList />} />
            <Route path="/exam/:testId" element={<ExamWindow />} />
            <Route path="/results" element={<ResultSheet />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
