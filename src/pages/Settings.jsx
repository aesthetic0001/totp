// import React from "react";
import TextInput from "../components/TextInput.jsx";
import {ArrowLeft} from "lucide-react";
import {Link} from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";
import { save, open } from '@tauri-apps/api/dialog';
import { writeTextFile } from '@tauri-apps/api/fs';
import { invoke } from '@tauri-apps/api/tauri';

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
                <div className="flex flex-row space-x-5">
                    <button
                        className="bg-emerald-400 hover:bg-emerald-500 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full"
                        onClick={async () => {
                            const selected = await open({
                                filters: [{
                                    name: 'Import from JSON',
                                    extensions: ['json']
                                }]
                            });
                            if (selected) {
                                // import selected file
                                const imported_count = await invoke('import_from_json', {path: selected});
                                toast.success(`Imported ${imported_count} accounts!`, {
                                    duration: 2000
                                });
                            }
                        }}>
                        Import Accounts
                    </button>
                    <button
                        className="bg-emerald-400 hover:bg-emerald-500 transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full"
                        onClick={async () => {
                            const filePath = await save({defaultPath: "exported-accounts.json"});
                            if (filePath) {
                                const exports = await invoke('export_to_json');
                                await writeTextFile(filePath, exports)
                            }
                        }}>
                        Export Accounts
                    </button>
                </div>
            </div>
            <Toaster position="bottom-center"/>
        </div>
    );
}

export default Settings;
