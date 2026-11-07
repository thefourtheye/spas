"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "darkMode";
const CLASS_NAME = "darkmode";

export default function ThemeToggle() {
    const [dark, setDark] = useState(false);

    useEffect(() => {
        setDark(document.body.classList.contains(CLASS_NAME));
    }, []);

    function toggle() {
        const enable = !document.body.classList.contains(CLASS_NAME);
        document.body.classList.toggle(CLASS_NAME, enable);
        localStorage.setItem(STORAGE_KEY, enable ? "enabled" : "disabled");
        setDark(enable);
    }

    return (
        <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            aria-pressed={dark}
            className="dark-mode-toggle"
        >
            <svg
                width="1.5rem"
                height="1.5rem"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 496 496"
            >
                <path
                    fill="currentColor"
                    d="M8,256C8,393,119,504,256,504S504,393,504,256,393,8,256,8,8,119,8,256ZM256,440V72a184,184,0,0,1,0,368Z"
                    transform="translate(-8 -8)"
                />
            </svg>
        </button>
    );
}
