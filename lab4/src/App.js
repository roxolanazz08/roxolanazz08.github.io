import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Home from './pages/Home';
import Bookings from './pages/Bookings';
import Contacts from './pages/Contacts';
import Details from './pages/Details';
import Auth from './pages/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    alert("Ви вийшли з системи");
  };

  return (
    <Router>
      <header>
        <h1>ComfortStay</h1>
        <nav>
          <ul style={{ alignItems: 'center' }}>
            <li><Link to="/">Головна</Link></li>
            {user && <li><Link to="/bookings">Бронювання</Link></li>}
            <li><Link to="/contacts">Контакти</Link></li>
            {!user ? (
              <li><Link to="/auth" style={{ background: 'white', color: '#ff85a2', padding: '5px 10px', borderRadius: '5px' }}>Увійти</Link></li>
            ) : (
              <li><button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Вийти ({user.email})</button></li>
            )}
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bookings" element={user ? <Bookings /> : <Auth />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/details/:id" element={<Details user={user} />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;