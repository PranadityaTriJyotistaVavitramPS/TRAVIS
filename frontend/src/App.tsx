import { BrowserRouter, Route, Routes } from 'react-router-dom'; // Import BrowserRouter and Routes
import Navbar from "./components/navbar"; // Import your Navbar component
import Home from './pages/home';
import Dashboard from './pages/dashboard'
import Profile from './pages/profile';

function App() {
  return (
    <BrowserRouter> {/* Wrap the entire application inside BrowserRouter */}
      <Navbar />
      <Routes> 
        <Route path="/" element={<Home />} /> 
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='/profile' element={<Profile/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
