import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('main.tsx is loading...');

try {
  const container = document.getElementById('root');
  console.log('Root container found:', container);
  
  if (!container) {
    throw new Error('Root container not found!');
  }
  
  const root = createRoot(container);
  console.log('React root created');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error in main.tsx:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: Arial, sans-serif;">
      <h1>Error in main.tsx</h1>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <pre>${error instanceof Error ? error.stack : 'No stack trace'}</pre>
    </div>
  `;
}
