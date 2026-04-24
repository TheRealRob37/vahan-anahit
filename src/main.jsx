import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import InvitationPage from './pages/InvitationPage'
import AdminPage from './pages/AdminPage'
import GamePage from './pages/GamePage'
import SeatingPage from './pages/SeatingPage'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InvitationPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/seating" element={<SeatingPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
