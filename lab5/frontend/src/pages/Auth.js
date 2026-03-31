import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Ви успішно увійшли!");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Реєстрація успішна!");
      }
      navigate('/');
    } catch (error) {
      alert("Помилка: " + error.message);
    }
  };

  return (
    <section style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>{isLogin ? 'Вхід' : 'Реєстрація'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <button type="submit" className="book-btn">{isLogin ? 'Увійти' : 'Зареєструватися'}</button>
      </form>
      <p style={{ marginTop: '20px', cursor: 'pointer', color: '#d81b60' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Немає акаунту? Зареєструйтесь' : 'Вже є акаунт? Увійдіть'}
      </p>
    </section>
  );
}

export default Auth;