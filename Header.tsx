import React from 'react';

export const Header = () => {
    return (
        <header className="bg-ogm-green-700/80 backdrop-blur-sm py-3 sm:py-4 shadow-lg z-10 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 pl-3 sm:pl-4 md:pl-6">
                <div className="rounded-full embedded-shadow flex-shrink-0">
                    <img
                        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWx6eG0zcjIxY2xqczQ3NDdzdWg1NnBuZjJsY3Z0aG53djI3bmtyciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/eRlCNIpfGdPdub57JI/giphy.gif"
                        alt="OGM Logo"
                        className="h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 rounded-full object-cover"
                    />
                </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center px-2 sm:px-4 text-center">
                <h1 className="text-base sm:text-lg md:text-3xl font-bold uppercase tracking-wider text-white">ORMAN GENEL MÜDÜRLÜĞÜ</h1>
                <p className="text-sm sm:text-base md:text-2xl font-semibold uppercase text-white">HAVACILIK DAİRESİ</p>
                <p className="text-xs sm:text-sm md:text-xl font-medium uppercase text-white">YAKIT TAKİP SİSTEMİ</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 pr-4 sm:pr-4 md:pr-6">
                <div className="rounded-full embedded-shadow flex-shrink-0">
                    <img
                        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3E3cXhjcDJibHQ2YTJiOTh0dTg3azF2M210MjJsdXVrYTJpdmE0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1rrxPs1nb3IjwmbiXw/giphy.gif"
                        alt="Helikopter Logo"
                        className="h-16 w-16 sm:h-20 sm:w-20 md:h-28 md:w-28 rounded-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};