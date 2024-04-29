// a flexible component which displays a single OTP entry, taking up its entire width in the flex row
const OTPEntry = ({title}) => {
    return (
        <div className="flex bg-gray-100 hover:bg-green-300 hover:scale-105 transition-all ease-in-out mx-6 my-4 border-y-4 border-gray-700 cursor-pointer">
            <div className="p-4">
                <h1 className="text-4xl font-bold font-['Inter var'] text-center">{title}</h1>
            </div>
        </div>
    );
};

export default OTPEntry;
