import {useEffect, useState} from "react";
import EcholessInput from "../components/EcholessInput.jsx";

function PasswordStartup() {
    const [password, setPassword] = useState('');

    return (
        <div className="flex flex-col justify-center items-center text-center space-y-10">
            <h1 className="text-2xl my-8">Master Password</h1>
            <EcholessInput currentText={"*".repeat(password.length)} placeholder="Master Password" onInput={(event) => {
                if (event.target.value.length >= 32) return
                setPassword(event.target.value);
            }}></EcholessInput>
        </div>
    );
}

export default PasswordStartup;
