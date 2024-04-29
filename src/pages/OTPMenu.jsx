import OTPEntry from "../components/OTPEntry.jsx";
import React, {useState} from "react";
import {produce} from "immer";

function OTPMenu() {
    const [OTPEntries, setOTPEntries] = useState({})

    for (let i = 0; i < 10; i++) {
        if (!OTPEntries[i]) {
            setOTPEntries(produce((draft) => {
                draft[i] = {
                    title: "Sample OTP Entry " + i,
                    oldFavourite: false,
                    index: i
                }
            }));
        }
    }

    const savePreference = ({favourite, id}) => {
        setOTPEntries(produce((draft) => {
            draft[id].oldFavourite = favourite;
        }));
    }

    return (
        <div className="h-screen">
            <div className="flex flex-col overflow-y-scroll smooth-scroll">
            {/*    sort by favourites then index */}
                {Object.keys(OTPEntries).sort((a, b) => OTPEntries[a].oldFavourite ? -1 : OTPEntries[b].oldFavourite ? 1 : OTPEntries[a].index - OTPEntries[b].index).map((key) => (
                    <OTPEntry key={key} title={OTPEntries[key].title} id={key} oldFavourite={OTPEntries[key].oldFavourite} savePreference={savePreference}/>
                ))}
            </div>
        </div>
    );
}

export default OTPMenu;
