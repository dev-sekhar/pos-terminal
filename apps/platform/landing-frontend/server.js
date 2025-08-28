const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Landing page route
app.get('/', (req, res) => {
  console.log('GET / request received');
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS Terminal - Modern Point of Sale Solution</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .navbar { background: #1976d2; color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center; }
        .hero { background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%); color: white; padding: 6rem 2rem; text-align: center; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .btn { background: white; color: #1976d2; padding: 1rem 2rem; border: none; border-radius: 4px; font-size: 1.1rem; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn:hover { background: #f5f5f5; }
        .section { padding: 4rem 2rem; max-width: 1200px; margin: 0 auto; }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .feature { background: #f5f5f5; padding: 2rem; border-radius: 8px; text-align: center; }
        .pricing { background: #f9f9f9; }
        .pricing-table { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; margin: 2rem 0; }
        .pricing-card { background: white; padding: 2rem; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .pricing-card h3 { color: #1976d2; margin-bottom: 1rem; }
        .price { font-size: 2rem; font-weight: bold; margin: 1rem 0; }
        .footer { background: #1976d2; color: white; padding: 2rem; text-align: center; }
    </style>
</head>
<body>
    <nav class="navbar">
        <h2>POS Terminal</h2>
        <div>
            <a href="#employee" class="btn" style="margin-right: 1rem;">Employee</a>
            <a href="http://lvh.me:3000/login" class="btn" style="margin-right: 1rem;">Login</a>
            <a href="http://lvh.me:3000/register" class="btn">Register</a>
        </div>
    </nav>

    <section class="hero">
        <h1>Modern POS Terminal Solution</h1>
        <p>Streamline your business operations with our comprehensive point-of-sale system</p>
        <a href="http://lvh.me:3000/register" class="btn">Get Started Today</a>
    </section>

    <section class="section">
        <h2 style="text-align: center; margin-bottom: 3rem;">About Our Company</h2>
        <p style="text-align: center; color: #666; margin-bottom: 3rem;">Empowering businesses with cutting-edge technology</p>
        
        <div class="features">
            <div class="feature">
                <h3>🚀 Innovation</h3>
                <p>We leverage the latest technology to provide you with a modern, efficient POS system that grows with your business.</p>
            </div>
            <div class="feature">
                <h3>🛡️ Reliability</h3>
                <p>Our robust infrastructure ensures your business operations run smoothly 24/7 with minimal downtime.</p>
            </div>
            <div class="feature">
                <h3>📞 Support</h3>
                <p>Get dedicated support from our expert team to help you maximize your business potential.</p>
            </div>
        </div>
    </section>

    <section class="section pricing">
        <h2 style="text-align: center; margin-bottom: 1rem;">Choose Your Plan</h2>
        <p style="text-align: center; color: #666; margin-bottom: 3rem;">Select the perfect plan for your business needs</p>
        
        <div class="pricing-table">
            <div class="pricing-card">
                <h3>Basic</h3>
                <div class="price">$29/month</div>
                <p><strong>5 Users</strong></p>
                <p><strong>5 Branches</strong></p>
                <p><strong>50 Products</strong></p>
                <p>Basic Dashboard</p>
                <p>Sales Management</p>
                <p>Inventory Tracking</p>
                <p>Email Support</p>
                <a href="http://lvh.me:3000/register" class="btn" style="margin-top: 1rem;">Get Started</a>
            </div>
            <div class="pricing-card">
                <h3>Premium</h3>
                <div class="price">$79/month</div>
                <p><strong>15 Users</strong></p>
                <p><strong>20 Branches</strong></p>
                <p><strong>200 Products</strong></p>
                <p>Advanced Dashboard</p>
                <p>Multi-branch Management</p>
                <p>Advanced Reports</p>
                <p>Priority Support</p>
                <a href="http://lvh.me:3000/register" class="btn" style="margin-top: 1rem;">Get Started</a>
            </div>
            <div class="pricing-card">
                <h3>Enterprise</h3>
                <div class="price">Contact Us</div>
                <p><strong>Unlimited Users</strong></p>
                <p><strong>Unlimited Branches</strong></p>
                <p><strong>Unlimited Products</strong></p>
                <p>Custom Features</p>
                <p>Dedicated Support</p>
                <p>API Access</p>
                <p>Custom Integrations</p>
                <a href="http://lvh.me:3000/register" class="btn" style="margin-top: 1rem;">Contact Sales</a>
            </div>
        </div>
    </section>

    <footer class="footer">
        <p>© 2024 POS Terminal. All rights reserved.</p>
    </footer>
</body>
</html>
  `);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Landing page server running on http://localhost:${PORT}`);
  console.log(`Also available at http://127.0.0.1:${PORT}`);
});