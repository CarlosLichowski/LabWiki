// src/main.tsx (CORREGIDO)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "bootstrap/dist/css/bootstrap.css"
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


createRoot(document.getElementById('root')!).render(
 <BrowserRouter>
 <StrictMode>
   <App />
 </StrictMode>
 </BrowserRouter>
);

