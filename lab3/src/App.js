import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Contacts from './pages/Contacts';
import Details from './pages/Details';
import './App.css';

function App() {
  return (
    <Router>
      <header>
        <h1>ComfortStay</h1>
        <nav>
          <ul>
            <li><Link to="/">Головна</Link></li>
            <li><Link to="/bookings">Бронювання</Link></li>
            <li><Link to="/contacts">Контакти</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </main>
    </Router>
  );
}
export default App;