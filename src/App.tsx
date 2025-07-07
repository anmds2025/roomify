import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useSettings } from './providers/SettingsProvider';
import { AppRouting } from './routing';
import { PathnameProvider } from './providers';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import { setupAxios, useAuthContext } from './auth';
import axios from 'axios';

const { BASE_URL } = import.meta.env;

const App = () => {
  const { settings } = useSettings();
  const { currentUser } = useAuthContext();

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.remove('light');
    document.documentElement.classList.add(settings.mode);
    setupAxios(axios, currentUser?.token);
  }, [settings]);


  return (
    <BrowserRouter basename={BASE_URL}>
      <PathnameProvider>
        <AppRouting />
        <ToastContainer
          position="top-center"
          autoClose={2000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </PathnameProvider>
    </BrowserRouter>
  );
};

export { App };
