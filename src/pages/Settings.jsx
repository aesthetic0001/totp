// import React from "react";
import TextInput from "../components/TextInput.jsx";
import {ArrowLeft} from "lucide-react";
import {Link} from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";
import { save } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';

function Settings() {
    return (
        <div>
            <div className="flex flex-col space-y-10 justify-center items-center text-center">
                <Link className="flex items-center cursor-pointer hover:text-emerald-400 transition-all ease-in-out"
                      to="/accounts">
                    <ArrowLeft className="h-8 w-8"/>
                    <div className="text-4xl font-bold">Settings</div>
                </Link>
                <div className="flex space-x-4">
                </div>
                <button
                    className="bg-emerald-400 hover:bg-emerald-500 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full"
                    onClick={async () => {
                        const filePath = await save({ defaultPath: "exported-accounts.json" });
                        await writeTextFile(filePath, 'hi there!')
                    }}>
                    Export Accounts
                </button>
            </div>
            <Toaster position="bottom-center" />
        </div>
    );
}

export default Settings;
