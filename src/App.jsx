import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import OTPMenu from './pages/OTPMenu';
import PasswordStartup from "./pages/PasswordStartup";
import {appWindow} from '@tauri-apps/api/window'
import {open} from '@tauri-apps/api/shell'
import {Minimize2, CircleX} from 'lucide-react';
import AddOTP from "./pages/AddOTP.jsx";
import Homepage from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
    return (
        <div className="relative">
            <div data-tauri-drag-region
                 className="fixed z-50 bg-white flex flex-row justify-between select-none top-0 left-0 right-0">
                <div data-tauri-drag-region className="flex items-center justify-center mx-2 text-2xl hover:text-emerald-400 transition-all ease-in-out cursor-pointer" onClick={() => {
                    open('https://github.com/aesthetic0001/totp')
                }}>
                    simple totp
                </div>
                <div className="flex justify-end">
                    <div
                        className="inline-flex items-center justify-center w-9 h-9 m-1 rounded-3xl hover:scale-105 hover:bg-cyan-200 transition-all ease-in-out"
                        onClick={() => {
                            appWindow.minimize()
                        }}>
                        <Minimize2/>
                    </div>
                    <div
                        className="inline-flex items-center justify-center w-9 h-9 m-1 rounded-3xl hover:scale-105 hover:bg-red-300 transition-all ease-in-out"
                        onClick={() => {
                            appWindow.close()
                        }}>
                        <CircleX/>
                    </div>
                </div>
            </div>
            <div className="my-10">
                <Router>
                    <Routes>
                        <Route path="/" element={<Homepage/>}/>
                        <Route path="/accounts" element={<OTPMenu/>}/>
                        <Route path="/password" element={<PasswordStartup/>}/>
                        <Route path="/add" element={<AddOTP/>}/>
                        <Route path="/settings" element={<Settings/>}/>
                    </Routes>
                </Router>
            </div>
        </div>);
}

export default App;
