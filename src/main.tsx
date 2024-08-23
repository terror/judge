import 'katex/dist/katex.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { ThemeProvider } from './components/theme-provider.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme='system' storageKey='vite-ui-theme'>
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
