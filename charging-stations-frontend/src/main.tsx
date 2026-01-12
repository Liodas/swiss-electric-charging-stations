import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './globals.css';
import './lib/i18n';
import { ThemeProvider } from './lib/theme';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
