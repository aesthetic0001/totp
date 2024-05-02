import React, {useState} from "react";
import TextInput from "../components/TextInput.jsx";
import {ArrowLeft} from "lucide-react";
import {Link} from "react-router-dom";

function AddOTP() {
    return (
        <div>
            <div className="flex flex-col space-y-10 justify-center items-center">
                <Link className="flex items-center cursor-pointer hover:text-emerald-400 transition-all ease-in-out" to="/">
                    <ArrowLeft className="h-8 w-8"/>
                    <div className="text-4xl font-bold">Add OTP Account</div>
                </Link>
                <TextInput placeholder="Account Name" onInput={(event) => {
                    console.log(event.target.value)
                }}/>
                <TextInput placeholder="Secret Key" onInput={(event) => {
                    console.log(event.target.value)
                }}/>
            </div>
        </div>
    );
}

export default AddOTP;
