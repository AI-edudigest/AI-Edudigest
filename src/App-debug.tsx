import React from 'react';

function App() {
  console.log('App component is loading...');
  
  try {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>AI-EduDigest App Debug</h1>
        <p>If you can see this, React is working!</p>
        <p>Time: {new Date().toLocaleString()}</p>
        
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <h3>Debug Information:</h3>
          <ul>
            <li>React version: {React.version}</li>
            <li>User Agent: {navigator.userAgent}</li>
            <li>URL: {window.location.href}</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Error in App Component</h1>
        <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <pre>{error instanceof Error ? error.stack : 'No stack trace'}</pre>
      </div>
    );
  }
}

export default App;
