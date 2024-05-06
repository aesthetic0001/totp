import PasswordStartup from "./PasswordStartup.jsx";
import OTPMenu from "./OTPMenu.jsx";
import {invoke} from "@tauri-apps/api/tauri";
import React, {useState} from "react";

function Homepage() {
    const [ready, setReady] = useState(false)
    let passwordProtected = false
    
    invoke('is_encrypted').then((res) => {
        passwordProtected = res
        setReady(true)
    })
    
    return (
        <div>
            {
                ready ? (passwordProtected ? <PasswordStartup/> : <OTPMenu/>) : <p>
                    Loading
                </p>
            }
        </div>
    );
}

export default Homepage;
