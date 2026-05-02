import React, { useState } from 'react';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import LoginPage from './pages/LoginPage';

const App = () => {
  const [page, setPage] = useState('login'); // 'login' | 'upload' | 'result'
  const [token, setToken] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setPage('upload');
  };

  const handleAnalysisComplete = (result) => {
    setAnalysisResult(result);
    setPage('result');
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setPage('upload');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPage('login');
  };

  return (
    <div>
      {page === 'login' && <LoginPage onLogin={handleLogin} />}
      {page === 'upload' && (
        <UploadPage
          token={token}
          user={user}
          onAnalysisComplete={handleAnalysisComplete}
          onLogout={handleLogout}
        />
      )}
      {page === 'result' && (
        <ResultPage
          result={analysisResult}
          onReset={handleReset}
          onLogout={handleLogout}
          user={user}
        />
      )}
    </div>
  );
};

export default App;
