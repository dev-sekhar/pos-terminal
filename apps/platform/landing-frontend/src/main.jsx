import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx is loading');
console.log('Root element:', document.getElementById('root'));

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
console.log('React app rendered');