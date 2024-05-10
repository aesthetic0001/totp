import {useState} from "react";
import EcholessInput from "../components/EcholessInput.jsx";
import {invoke} from "@tauri-apps/api/tauri";
import {useNavigate} from "react-router-dom";

function PasswordStartup() {
    const navigate = useNavigate()
    const [password, setPassword] = useState('');
    
    return (
        <div className="flex flex-col justify-center items-center text-center space-y-10">
            <h1 className="text-2xl my-8">Master Password</h1>
            <EcholessInput currentText={password} placeholder="Master Password" onInput={async (event) => {
                if (event.target.value.length >= 32) return
                setPassword(event.target.value);
                const ok = await invoke('check_password', {key: event.target.value})
                if (ok) {
                    navigate("/accounts")
                }
            }}></EcholessInput>
        </div>
    );
}

export default PasswordStartup;
