import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import { generatePatentDraft } from './services/ai';
import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [apiTestResult, setApiTestResult] = useState(null);
  
  // Run API test on component mount (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      const runApiTest = async () => {
        console.log("Running DeepSeek API test...");
        try {
          const testDescription = "A drone with obstacle avoidance using LiDAR";
          const result = await generatePatentDraft(testDescription);
          
          console.log("API Test Result:", result);
          setApiTestResult(result);
          
          if (result && !result.includes("⚠️")) {
            console.log("✅ API Test Successful");
          } else {
            console.error("❌ API Test Failed", result);
          }
        } catch (error) {
          console.error("API Test Error:", error);
          setApiTestResult(`Test Failed: ${error.message}`);
        }
      };
      
      runApiTest();
    }
  }, []);

  return (
    <div className="App">
      {/* Development-only API test panel */}
      {import.meta.env.DEV && apiTestResult && (
        <div className="api-test-panel">
          <h3>DeepSeek API Test</h3>
          <div className="test-result">
            <pre>{apiTestResult}</pre>
          </div>
          <button onClick={() => setApiTestResult(null)}>Close</button>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;