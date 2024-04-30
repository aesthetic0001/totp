import OTPEntry from "../components/OTPEntry.jsx";
import React, {useState} from "react";
import {produce} from "immer";
import SearchBar from "../components/SearchBar.jsx";

function OTPMenu() {
    const [OTPEntries, setOTPEntries] = useState({})
    const [search, setSearch] = useState("")

    // for (let i = 0; i < 10; i++) {
    //     if (!OTPEntries[i]) {
    //         console.log("Adding OTP Entry " + i)
    //         setOTPEntries(produce((draft) => {
    //             draft[i] = {
    //                 title: "Sample OTP Entry " + i,
    //                 oldFavourite: false,
    //                 index: i,
    //                 id: i
    //             }
    //         }));
    //     }
    // }

    const savePreference = ({favourite, id}) => {
        setOTPEntries(produce((draft) => {
            draft[id].oldFavourite = favourite;
        }));
    }

    const copyTOTP = async (id) => {
        console.log("Copying TOTP for id", id)
        await navigator.clipboard.writeText(id + " TOTP")
    }

    const deleteEntry = (id) => {
        setOTPEntries(produce((draft) => {
            delete draft[id]
        }));
    }

    const onInput = (event) => {
        setSearch(event.target.value)
    }

    return (
        <div className="h-screen">
            <SearchBar placeholder="Search for an OTP entry" onInput={onInput}/>
            <div className="flex flex-col overflow-y-scroll smooth-scroll">
                {Object.values(OTPEntries).filter((entry) => {
                    console.log(entry)
                    return entry.title.toLowerCase().includes(search.toLowerCase())
                }).sort((a, b) => a.oldFavourite ? -1 : b.oldFavourite ? 1 : a.index - b.index).map((entry) => (
                    <OTPEntry key={entry.id} title={entry.title} id={entry.id} oldFavourite={entry.oldFavourite}
                              savePreference={savePreference} copyTOTP={copyTOTP} deleteEntry={deleteEntry}/>
                ))}
            </div>
        </div>
    );
}

export default OTPMenu;
