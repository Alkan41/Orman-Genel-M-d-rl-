import React, { useState, useEffect, useMemo, useRef } from 'react';

interface AutocompleteSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const AutocompleteSelect = ({ options, value, onChange, placeholder, className }: AutocompleteSelectProps) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const inputClassName = className || "w-full p-3 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-ogm-green-500 bg-white";

    useEffect(() => {
        const selectedOption = options.find(option => option.value === value);
        setInputValue(selectedOption ? selectedOption.label : '');
    }, [value, options]);

    const handleBlur = () => {
        setTimeout(() => {
            if (inputRef.current && (document.activeElement === inputRef.current || (wrapperRef.current && wrapperRef.current.contains(document.activeElement)))) {
                return;
            }

            setIsOpen(false);
            const trimmedInput = inputValue.trim();

            if (!trimmedInput) {
                if (value) onChange('');
                setInputValue('');
                return;
            }

            const exactMatch = options.find(option =>
                option.label.toLocaleLowerCase('tr-TR') === trimmedInput.toLocaleLowerCase('tr-TR')
            );

            if (exactMatch) {
                setInputValue(exactMatch.label);
                if (exactMatch.value !== value) {
                    onChange(exactMatch.value);
                }
            } else {
                setInputValue('');
                if (value) {
                    onChange('');
                }
            }
        }, 150);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const currentInput = e.target.value;
        setInputValue(currentInput);
        if (currentInput === '') {
            onChange('');
        }
        setIsOpen(true);
    };

    const handleSelectOption = (option: { value: string; label: string }) => {
        setInputValue(option.label);
        onChange(option.value);
        setIsOpen(false);
    };

    const filteredOptions = useMemo(() => {
        const inputWithoutSpaces = inputValue ? String(inputValue).replace(/\s/g, '').toLocaleLowerCase('tr-TR') : "";
        if (!inputWithoutSpaces) {
            return [...options].sort((a, b) => String(a.label).localeCompare(String(b.label), 'tr-TR'));
        }
        const startsWith: { value: string; label: string }[] = [];
        const includes: { value: string; label: string }[] = [];
        for (const option of options) {
            if (!option.label) continue;
            const labelWithoutSpaces = String(option.label).replace(/\s/g, '').toLocaleLowerCase('tr-TR');
            if (labelWithoutSpaces.startsWith(inputWithoutSpaces)) {
                startsWith.push(option);
            } else if (labelWithoutSpaces.includes(inputWithoutSpaces)) {
                includes.push(option);
            }
        }
        startsWith.sort((a, b) => String(a.label).localeCompare(String(b.label), 'tr-TR'));
        includes.sort((a, b) => String(a.label).localeCompare(String(b.label), 'tr-TR'));
        return [...startsWith, ...includes];
    }, [inputValue, options]);

    return (
        <div className="relative" ref={wrapperRef}>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={inputClassName}
                autoComplete="off"
            />
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <li
                                key={option.value || option.label}
                                onMouseDown={(e) => { e.preventDefault(); handleSelectOption(option); }}
                                className="p-3 hover:bg-slate-100 cursor-pointer text-sm"
                            >
                                {option.label}
                            </li>
                        ))
                    ) : (
                        <li className="p-3 text-slate-500 text-sm">Sonuç bulunamadı</li>
                    )}
                </ul>
            )}
        </div>
    );
};
