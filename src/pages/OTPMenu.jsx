import OTPEntry from "../components/OTPEntry.jsx";
import React, {useState} from "react";
import {produce} from "immer";
import SearchBar from "../components/SearchBar.jsx";
import {invoke} from '@tauri-apps/api/tauri'
import {SquarePlus} from "lucide-react";

function OTPMenu() {
    const [OTPEntries, setOTPEntries] = useState({})
    const [search, setSearch] = useState("")

    invoke('get_saved_totp').then((res) => {
        setOTPEntries(JSON.parse(res))
    })

    const savePreference = async ({id, favourite}) => {
        setOTPEntries(produce((draft) => {
            draft[id].favourite = favourite;
        }));
        await invoke('set_favourite', {id, favourite})
    }

    const copyTOTP = async (id) => {
        await navigator.clipboard.writeText(id + " TOTP")
    }

    const deleteEntry = async (id) => {
        setOTPEntries(produce((draft) => {
            delete draft[id]
        }));
        await invoke('remove_account', {id})
    }

    const addEntry = async () => {
        const dummyCount = 10
        for (let i = 1; i < dummyCount; i++) {
            setOTPEntries(produce((draft) => {
                draft[i] = {
                    "id": "dummy",
                    "title": "Dummy",
                    "favourite": false
                }
            }))
            await invoke('add_account', {"id": i, "title": "Dummy", secret: "dummy", digits: 6, period: 30})
        }
    }

    const onInput = (event) => {
        setSearch(event.target.value)
    }

    return (
        <div>
            <div className="flex flex-row justify-center items-center">
                <div className="flex-initial w-96 mx-6 my-4 p-2">
                    <SearchBar placeholder="Search for an OTP entry" onInput={onInput}/>
                </div>
                <SquarePlus
                    className="w-8 h-8 mr-6 hover:scale-105 hover:fill-green-200 transition-all ease-in-out cursor-pointer"
                    onClick={addEntry}/>
            </div>
            <div className="flex flex-col overflow-auto smooth-scroll">
                {Object.values(OTPEntries).filter((entry) => {
                    return entry.title.toLowerCase().includes(search.toLowerCase())
                }).sort((a, b) => a.favourite ? -1 : b.favourite ? 1 : a.index - b.index).map((entry) => (
                    <OTPEntry key={entry.id} title={entry.title} id={entry.id} oldFavourite={entry.favourite}
                              savePreference={savePreference} copyTOTP={copyTOTP} deleteEntry={deleteEntry}/>
                ))}
            </div>
        </div>
    );
}

export default OTPMenu;
