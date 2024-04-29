import OTPEntry from "../components/OTPEntry.jsx";

function OTPMenu() {
  return (
      <div className="h-screen">
          <div className="flex flex-col overflow-y-scroll smooth-scroll">
              {Array.from({length: 10}, (_, i) => (
                    <OTPEntry key={i} title={`OTP Entry ${i + 1}`} />
                ))}
          </div>
      </div>
  );
}

export default OTPMenu;
