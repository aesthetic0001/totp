import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OTPMenu from './pages/OTPMenu';
import PasswordStartup from "./pages/PasswordStartup";

function App() {
    return (
        <Router>
        <Routes>
            <Route path="/" element={<OTPMenu />} />
            <Route path="/password" element={<PasswordStartup />} />
        </Routes>
        </Router>
    );
}

export default App;
