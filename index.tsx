import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.js';

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Could not find root element to mount to");
}
const root = ReactDOM.createRoot(rootElement);
// Fix: Switched from React.createElement to standard JSX to resolve a type overload error.
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
