import {invoke} from "@tauri-apps/api/tauri";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";

function Homepage() {
    const navigate = useNavigate()
    invoke('is_encrypted').then((res) => {
        navigate(res ? "/password" : "/accounts")
    })
    
    return (
        <div className="flex items-center justify-center">
            <p>
                Loading
            </p>
        </div>
    );
}

export default Homepage;
