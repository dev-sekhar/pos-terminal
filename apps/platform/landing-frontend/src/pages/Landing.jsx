import React from 'react';

const Landing = () => {
  const handleNavigation = (path) => {
    // Navigate to customer app
    window.location.href = `http://lvh.me:3000${path}`;
  };

  const pricingTiers = [
    {
      name: 'Basic',
      price: '$29/month',
      users: '5 Users',
      branches: '5 Branches',
      products: '50 Products',
      features: ['Basic Dashboard', 'Sales Management', 'Inventory Tracking', 'Email Support']
    },
    {
      name: 'Premium',
      price: '$79/month',
      users: '15 Users',
      branches: '20 Branches',
      products: '200 Products',
      features: ['Advanced Dashboard', 'Multi-branch Management', 'Advanced Reports', 'Priority Support']
    },
    {
      name: 'Enterprise',
      price: 'Contact Us',
      users: 'Unlimited',
      branches: 'Unlimited',
      products: 'Unlimited',
      features: ['Custom Features', 'Dedicated Support', 'API Access', 'Custom Integrations']
    }
  ];

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