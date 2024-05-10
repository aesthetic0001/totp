import {ArrowLeft} from "lucide-react";
import {Link} from "react-router-dom";
import {toast, Toaster} from "react-hot-toast";
import {save, open} from '@tauri-apps/api/dialog';
import {writeTextFile} from '@tauri-apps/api/fs';
import {invoke} from '@tauri-apps/api/tauri';
import {useState} from "react";
import Modal from "../components/Modal.jsx";

function Settings() {
    const [passwordProtected, setPasswordProtected] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [password, setPassword] = useState('');

    invoke('is_encrypted').then((res) => {
        setPasswordProtected(res)
    })

    return (
        <div>
            <div className="flex flex-col space-y-10 justify-center items-center text-center">
                <Link className="flex items-center cursor-pointer hover:text-emerald-400 transition-all ease-in-out"
                      to="/accounts">
                    <ArrowLeft className="h-8 w-8"/>
                    <div className="text-4xl font-bold">Settings</div>
                </Link>
                <div className="relative">
                    <button
                        className={(!passwordProtected ? "bg-emerald-400 hover:bg-emerald-500 " : "bg-red-400 hover:bg-red-500 ") + "transition-all ease-in-out text-white font-bold py-2 px-4 rounded-full"}
                        onClick={() => {
                            setModalOpen(true);
                        }}>
                        {
                            !passwordProtected ? "Enable Password Encryption" : "Disable Password Encryption"
                        }
                    </button>
                </div>
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
            <Modal open={modalOpen} setOpen={setModalOpen}
                   title={!passwordProtected ? 'Set Master Password' : 'Disable Master Password'}
                   description={!passwordProtected ? "Please note that whitespaces will be excluded during encryption!" : "Your files will be stored in plaintext if this option is disabled!"}
                   actionText="Confirm" dialogueBox={!passwordProtected}
                   onSubmit={async () => {
                       if (passwordProtected) {
                           await invoke('disable_encryption')
                       } else {
                           await invoke('set_master_password', {key: password})
                       }
                   }}
                   onDialogAction={async (x) => {
                       const previous = password
                       setPassword(x);
                       if (!x) return false
                       if (x.length > 32) {
                           if (previous.length < x.length && (x.length - 33) % 8 === 0) {
                               toast.error("Password cannot be longer than 32 characters!", {
                                   duration: 2000
                               });
                           }
                           return false
                       }
                       return true
                   }}/>
            <Toaster position="bottom-center"/>
        </div>
    );
}

export default Settings;
