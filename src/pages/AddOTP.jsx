import React, {useState} from "react";
import TextInput from "../components/TextInput.jsx";
import {ArrowLeft} from "lucide-react";
import {Link} from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";
import {invoke} from "@tauri-apps/api/tauri";
import { readText } from '@tauri-apps/api/clipboard';

function AddOTP() {
    const [accountName, setAccountName] = useState("");
    const [secretKey, setSecretKey] = useState("");
    const [digits, setDigits] = useState(6);

    return (
        <div>
            <div className="flex flex-col space-y-10 justify-center items-center text-center">
                <Link className="flex items-center cursor-pointer hover:text-emerald-400 transition-all ease-in-out"
                      to="/accounts">
                    <ArrowLeft className="h-8 w-8"/>
                    <div className="text-4xl font-bold">Add OTP Account</div>
                </Link>
                <TextInput currentText={accountName} placeholder="Account Name" onInput={(event) => {
                    setAccountName(event.target.value)
                }}/>
                <TextInput currentText={secretKey} placeholder="Secret Key" onInput={(event) => {
                    setSecretKey(event.target.value)
                }}/>
                {/*    circle selector */}
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                        <input type="radio" name="digits" checked={digits === 6} onClick={() => {
                            setDigits(6);
                        }}/>
                        <label>6 digits</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="radio" name="digits" checked={digits === 7} onClick={() => {
                            setDigits(7);
                        }}/>
                        <label>7 digits</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input type="radio" name="digits" checked={digits === 8} onClick={() => {
                            setDigits(8);
                        }}/>
                        <label>8 digits</label>
                    </div>
                </div>
                <button
                    className="bg-emerald-400 hover:bg-emerald-500 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full"
                    onClick={async () => {
                        // if the account name or secret key is empty, don't add the account
                        if (!accountName || !secretKey) {
                            toast.error("Account name and/or secret key cannot be empty!", {
                                duration: 2000
                            });
                            return
                        }
                        // if the secret key is not base32, don't add the account
                        if (!/^[A-Z2-7]+=*$/i.test(secretKey)) {
                            toast.error("Secret key must be base32 encoded!", {
                                duration: 1000
                            });
                            return
                        }
                        await invoke('add_account', {title: accountName, secret: secretKey, digits: digits, period: 30})
                        toast.success("Account added successfully!", {
                            duration: 1000
                        });
                        setAccountName("");
                        setSecretKey("");
                        setDigits(6);
                    }}>
                    Add Account
                </button>
                <div className="flex flex-col space-y-5 justify-center items-center text-center">
                    <p>
                        Or, try adding accounts from clipboard. Note that they need to follow the otpauth://totp/ format, and should be newline seperated.
                    </p>
                    <button
                        className="bg-emerald-400 hover:bg-emerald-500 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full"
                        onClick={async () => {
                            const quantity = await invoke('add_from_clipboard', {
                                clipboard: await readText()
                            })
                            toast.success(`Successfully added ${quantity} accounts from clipboard!`, {
                                duration: 1000
                            });
                        }}>
                        Add Account from Clipboard
                    </button>
                </div>
            </div>
            <Toaster position="bottom-center" />
        </div>
    );
}

export default AddOTP;
