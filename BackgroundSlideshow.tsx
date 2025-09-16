import React, { useState, useEffect } from 'react';

const imageUrls = [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop', // Sisli Orman Yolu
    'https://images.unsplash.com/photo-1476231682828-37e571bc172f?q=80&w=1974&auto=format&fit=crop', // Kıvrımlı Orman Yolu
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop', // Yeşil Çam Ormanı
];

// Preload images for a smoother experience
imageUrls.forEach(url => {
    (new Image()).src = url;
});

export const BackgroundSlideshow = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % imageUrls.length);
        }, 20000); // Change image every 20 seconds

        return () => clearTimeout(timer);
    }, [currentIndex]);

    return (
        <div className="fixed inset-0 -z-10">
            {imageUrls.map((url, index) => (
                <div
                    key={url}
                    className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
                    style={{
                        backgroundImage: `url('${url}')`,
                        opacity: index === currentIndex ? 1 : 0,
                    }}
                />
            ))}
            <div className="absolute inset-0 bg-black/20"></div>
        </div>
    );
};