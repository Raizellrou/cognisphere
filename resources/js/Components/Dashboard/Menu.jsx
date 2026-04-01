import React from "react";

export default function Menu({ active, setActive }) {
  const menuItems = ["Home", "Profile", "Messages", "Settings"];

  return (
    <nav className="bg-gray-900 text-white w-full md:w-64 p-4 flex md:flex-col justify-around md:justify-start">
      {menuItems.map((item) => (
        <button
          key={item}
          onClick={() => setActive(item)}
          className={`block px-4 py-2 rounded mb-2 w-full text-left transition-colors duration-200 ${
            active === item ? "bg-blue-600" : "hover:bg-gray-700"
          }`}
        >
          {item}
        </button>
      ))}
    </nav>
  );
}