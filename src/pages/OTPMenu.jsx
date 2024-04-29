import OTPEntry from "../components/OTPEntry.jsx";

function OTPMenu() {
    const OTPEntries = {}

    for (let i = 0; i < 10; i++) {
        OTPEntries[i] = {
            title: `OTP Entry ${i + 1}`,
            oldFavourite: Math.random() < 0.5
        }
    }

    const savePreference = (favourite) => {
        console.log(favourite);
    }

    return (
        <div className="h-screen">
            <div className="flex flex-col overflow-y-scroll smooth-scroll">
            {/*    sort by favourites then index */}
                {Object.keys(OTPEntries).sort((a, b) => OTPEntries[a].oldFavourite ? -1 : OTPEntries[b].oldFavourite ? 1 : a - b).map((key) => (
                    <OTPEntry key={key} title={OTPEntries[key].title} oldFavourite={OTPEntries[key].oldFavourite} savePreference={savePreference}/>
                ))}
            </div>
        </div>
    );
}

export default OTPMenu;
