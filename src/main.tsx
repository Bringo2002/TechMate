import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { FormspreeProvider } from '@formspree/react'
import { HelmetProvider } from "react-helmet-async";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <FormspreeProvider project="xkgzrwnz">
          <App />
        </FormspreeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);