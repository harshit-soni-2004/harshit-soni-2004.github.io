import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted font (bundled by Vite, no external requests). Latin subset only to keep CSS small;
// switch to '@fontsource/jetbrains-mono/400.css' etc. if you need other scripts.
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
