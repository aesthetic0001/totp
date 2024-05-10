const EcholessInput = ({currentText, placeholder, onInput}) => {
    return (
        <div className="flex items-center bg-gray-200 border-transparent rounded-lg shadow">
            <input type="password" value={currentText} placeholder={placeholder} className="w-full m-2 p-2 text-center bg-transparent outline-none" onInput={onInput}/>
        </div>
    );
};

export default EcholessInput;
