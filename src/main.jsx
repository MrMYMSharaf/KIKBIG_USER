// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { store, persistor } from './store/store'; // Import both store and persistor
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Polyfill for draft-js / react-draft-wysiwyg
if (typeof global === 'undefined') {
  window.global = window;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);