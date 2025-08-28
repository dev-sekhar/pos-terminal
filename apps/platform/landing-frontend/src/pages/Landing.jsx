import React from 'react';

const Landing = () => {
  const handleNavigation = (path) => {
    // Navigate to customer app
    window.location.href = `http://lvh.me:3000${path}`;
  };

  const handleEmployeeClick = () => {
    // Placeholder for employee portal
    alert('Employee portal coming soon!');
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
      <nav style={{ background: '#1976d2', color: 'white', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>POS Terminal</h2>
        <div>
          <button onClick={handleEmployeeClick} style={{ background: 'white', color: '#1976d2', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', marginRight: '1rem', cursor: 'pointer' }}>Employee</button>
          <button onClick={() => handleNavigation('/login')} style={{ background: 'white', color: '#1976d2', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', marginRight: '1rem', cursor: 'pointer' }}>Login</button>
          <button onClick={() => handleNavigation('/register')} style={{ background: 'white', color: '#1976d2', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Register</button>
        </div>
      </nav>
      
      <section style={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white', padding: '6rem 2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Modern POS Terminal Solution</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Streamline your business operations with our comprehensive point-of-sale system</p>
        <button onClick={() => handleNavigation('/register')} style={{ background: 'white', color: '#1976d2', padding: '1rem 2rem', border: 'none', borderRadius: '4px', fontSize: '1.1rem', cursor: 'pointer' }}>Get Started Today</button>
      </section>
    </div>
  );
};

export default Landing;