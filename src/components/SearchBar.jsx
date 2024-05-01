import {SearchIcon} from "lucide-react";

const SearchBar = ({placeholder, onInput}) => {
    return (
        <div className="flex items-center bg-gray-200 border-2 border-gray-700 rounded-lg shadow">
            <SearchIcon className="m-2 dark:text-gray-400"/>
            <input type="text" placeholder={placeholder} className="w-full py-2 bg-transparent outline-none" onInput={onInput}/>
        </div>
    );
};

export default SearchBar;
