import './App.css';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/home';
import CreateOrder from './pages/createOrder';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-order" element={<CreateOrder />} />
    </Routes>
   
  );
}

export default App;
