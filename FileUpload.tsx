import React, { useState, useCallback } from 'react';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
    const [isDragging, setIsDragging] = useState(false);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
        }
    };

    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileUpload(e.dataTransfer.files[0]);
        }
    }, [onFileUpload]);

    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-ogm-green-500 bg-ogm-green-50' : 'border-slate-300 bg-white/80'
            }`}
        >
            <input
                type="file"
                id="fileInput"
                accept=".xlsx, .csv, .pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                className="hidden"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
                <p className="text-slate-500">Dosyayı buraya sürükleyip bırakın</p>
                <p className="text-slate-500 my-2">veya</p>
                <span className="inline-block py-2 px-4 bg-ogm-green-600 text-white rounded-md font-semibold hover:bg-ogm-green-700">Dosya Seç</span>
            </label>
        </div>
    );
};
