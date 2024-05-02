import OTPEntry from "../components/OTPEntry.jsx";
import React, {useState} from "react";
import SearchBar from "../components/SearchBar.jsx";
import {invoke} from '@tauri-apps/api/tauri'
import {SquarePlus} from "lucide-react";
import {useNavigate} from "react-router-dom";

function OTPMenu() {
    const navigate = useNavigate()
    const [OTPEntries, setOTPEntries] = useState({})
    const [search, setSearch] = useState("")

    // todo: switch this to use tauri events
    async function syncOTPEntries() {
        const res = await invoke('get_saved_totp')
        setOTPEntries(JSON.parse(res))
    }

    syncOTPEntries()

    const savePreference = async ({id, favourite}) => {
        await invoke('set_favourite', {id, favourite})
        await syncOTPEntries()
    }

    const copyTOTP = async (id) => {
        await navigator.clipboard.writeText(id + " TOTP")
    }

    const deleteEntry = async (id) => {
        await invoke('remove_account', {id})
        await syncOTPEntries()
    }

    const addEntry = async () => {
        const dummyCount = 10
        for (let i = 1; i < dummyCount; i++) {
            await invoke('add_account', {"id": i, "title": "Dummy", secret: "dummy", digits: 6, period: 30})
            await syncOTPEntries()
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
                    onClick={() => {
                        navigate("/add", {replace: true});
                    }}/>
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
