import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import OTPMenu from './pages/OTPMenu';
import PasswordStartup from "./pages/PasswordStartup";
import {appWindow} from '@tauri-apps/api/window'
import {Minimize2, CircleX} from 'lucide-react';

function App() {
    return (
        <div className="relative">
            <div data-tauri-drag-region
                 className="fixed z-50 bg-white flex justify-end select-none top-0 left-0 right-0">
                <div
                    className="inline-flex w-9 h-9 m-1 hover:scale-105 hover:bg-cyan-200 rounded-3xl transition-all ease-in-out items-center justify-center"
                    onClick={() => {
                        appWindow.minimize()
                    }}>
                    <Minimize2/>
                </div>
                <div
                    className="inline-flex w-9 h-9 m-1 hover:scale-105 hover:bg-red-300 rounded-3xl transition-all ease-in-out items-center justify-center"
                    onClick={() => {
                        appWindow.close()
                    }}>
                    <CircleX/>
                </div>
            </div>
            <div className="my-6">
                <Router>
                    <Routes>
                        <Route path="/" element={<OTPMenu/>}/>
                        <Route path="/password" element={<PasswordStartup/>}/>
                    </Routes>
                </Router>
            </div>
        </div>);
}

export default App;
