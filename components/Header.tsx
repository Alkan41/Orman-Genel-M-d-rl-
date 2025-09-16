import React from 'react';

export const Header = () => {
    return (
        <header className="bg-ogm-green-700/80 backdrop-blur-sm text-white py-4 px-6 text-center rounded-xl -mt-12 -mx-8 mb-6 sm:-mt-14 sm:-mx-12 sm:mb-8 flex items-center justify-between shadow-lg">
            <div className="flex items-center space-x-2 sm:space-x-4 ml-2 sm:ml-4">
                <div className="rounded-full embedded-shadow flex-shrink-0">
                    <img
                        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWx6eG0zcjIxY2xqczQ3NDdzdWg1NnBuZjJsY3Z0aG53djI3bmtyciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/eRlCNIpfGdPdub57JI/giphy.gif"
                        alt="OGM Logo"
                        className="h-20 w-20 sm:h-28 sm:w-28 rounded-full object-cover"
                    />
                </div>
                <div className="rounded-full embedded-shadow flex-shrink-0 animated-gif-left">
                    <img
                        src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmJ0N2k2anQ5dzBncWMwd2Fkemh3M2Zudm9hMXpmODNxYngwMTlwOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Ft0CtHyxdGJusr6MWi/giphy.gif"
                        alt="Animated Left Gif"
                        className="h-20 w-20 sm:h-28 sm:w-28 rounded-full object-cover"
                    />
                </div>
            </div>
            <div className="flex flex-col items-center px-4">
                <h1 className="text-xl sm:text-3xl font-bold uppercase tracking-wider">ORMAN GENEL MÜDÜRLÜĞÜ</h1>
                <p className="text-lg sm:text-2xl font-semibold uppercase">HAVACILIK DAİRESİ</p>
                <p className="text-base sm:text-xl font-medium uppercase">YAKIT TAKİP SİSTEMİ</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 mr-4 sm:mr-6">
                <div className="rounded-full embedded-shadow flex-shrink-0 animated-gif-right">
                     <img
                        src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmI3ZWpuc25laHFtd3FjdnNvNHZ0cTN1NzFkZjVlbzMxN2Y1N2J3byZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/il1R6wTaTD5q5d7H6T/giphy.gif"
                        alt="Animated Right Gif"
                        className="h-20 w-20 sm:h-28 sm:w-28 rounded-full object-cover transform scale-x-[-1]"
                        style={{ objectPosition: 'center 47.5%' }}
                    />
                </div>
                <div className="rounded-full embedded-shadow flex-shrink-0">
                    <img
                        src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3E3cXhjcDJibHQ2YTJiOTh0dTg3azF2M210MjJsdXVrYTJpdmE0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/1rrxPs1nb3IjwmbiXw/giphy.gif"
                        alt="Helikopter Logo"
                        className="h-20 w-20 sm:h-28 sm:w-28 rounded-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};
