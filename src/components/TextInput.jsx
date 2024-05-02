const TextInput = ({placeholder, onInput}) => {
    return (
        <div className="flex items-center bg-gray-200 border-2 border-gray-700 rounded-lg shadow">
            <input type="text" placeholder={placeholder} className="w-full m-2 p-2 bg-transparent outline-none" onInput={onInput}/>
        </div>
    );
};

export default TextInput;
