// a flexible component which displays a single OTP entry, taking up its entire width in the flex row
import React, {useState} from 'react';

const OTPEntry = ({title, oldFavourite, savePreference}) => {
    const [favourite, setFavourite] = useState(oldFavourite);

    return (
        <div
            className="relative flex bg-gray-100 hover:bg-green-300 transition-all ease-in-out mx-6 my-4 border-y-4 border-gray-700 cursor-pointer">
            <div className="flex items-center hover:scale-125 transition-all ease-in-out" onClick={() => {
                setFavourite(!favourite);
                savePreference(!favourite);
            }}>
                <svg className={(favourite ? "text-yellow-300" : "text-gray-500") + " w-8 h-8 m-4 me-1 transition-all ease-in-out"}
                     aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                     fill="currentColor" viewBox="0 0 22 20">
                    <path
                        d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
            </div>
            <div className="p-4">
                <h1 className="text-2xl font-bold font-['Inter var'] text-center">{title}</h1>
            </div>
        </div>
    );
};

export default OTPEntry;
