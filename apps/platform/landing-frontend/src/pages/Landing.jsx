import React from 'react';

const Landing = () => {
  const handleNavigation = (path) => {
    // Navigate to customer app
    window.location.href = `http://lvh.me:3000${path}`;
  };

  // Pricing data now comes from API - remove hardcoded data

  return (
    <div>
      <h1>POS Terminal Landing Page</h1>
      <p>Welcome to our POS Terminal solution!</p>
      <button onClick={() => handleNavigation('/login')}>Login</button>
      <button onClick={() => handleNavigation('/register')}>Register</button>
    </div>
  );
};

export default Landing;