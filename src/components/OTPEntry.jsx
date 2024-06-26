// a flexible component which displays a single OTP entry, taking up its entire width in the flex col
import React, {useState} from 'react';
import {Star, ClipboardCopy, Trash} from 'lucide-react';

const OTPEntry = ({title, id, oldFavourite, savePreference, copyTOTP, deleteEntry, editName}) => {
    const [favourite, setFavourite] = useState(oldFavourite);
    const [inputActive, setInputActive] = useState(false);
    const [newTitle, setNewTitle] = useState(title);

    return (
        <div
            className="relative flex bg-gray-100 hover:bg-green-200 transition-all ease-in-out mx-6 my-4 border-y-4 border-gray-700 cursor-pointer">
            <div className="flex items-center hover:scale-110 transition-all ease-in-out" onClick={() => {
                setFavourite(!favourite);
                savePreference({
                    favourite: !favourite,
                    id
                });
            }}>
                <Star
                    className={(favourite ? "fill-yellow-400 text-yellow-400 " : "fill-gray-500 text-gray-500 ") + " w-8 h-8 m-4 me-1 transition-all ease-in-out"}/>
            </div>
            <div className="flex-1 p-4">
            {/*    on double click text, set input active. once it is out of focus, disable input active*/}
                <div className="text-2xl font-bold text-center" onDoubleClick={() => {
                    setInputActive(true);
                }} onBlur={() => {
                    setInputActive(false);
                    editName({
                        id,
                        newTitle
                    });
                }}>
                    {inputActive ? <input type="text" value={newTitle} onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            editName({
                                id,
                                newTitle
                            });
                            setInputActive(false);
                        }
                    }} onInput={(event) => {
                        setNewTitle(event.target.value);
                    }} className="bg-transparent outline-none" /> : title}
                </div>
            </div>
            <div className="flex items-center">
                <div className="hover:scale-110 transition-all ease-in-out" onClick={() => {
                    copyTOTP(id);
                }}>
                    <ClipboardCopy
                        className="w-8 h-8 m-2 me-1 text-gray-500 hover:text-cyan-400 transition-all ease-in-out"/>
                </div>
                <div className="hover:scale-110 transition-all ease-in-out" onClick={() => {
                    deleteEntry(id);
                }}>
                    <Trash className="w-8 h-8 m-2 me-1 text-gray-500 hover:text-red-400 transition-all ease-in-out"/>
                </div>
            </div>
        </div>
    );
};

export default OTPEntry;
