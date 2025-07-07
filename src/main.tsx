import '@/components/keenicons/assets/duotone/style.css';
import '@/components/keenicons/assets/outline/style.css';
import '@/components/keenicons/assets/filled/style.css';
import '@/components/keenicons/assets/solid/style.css';
import './css/styles.css';

import axios from 'axios';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { setupAxios, useAuthContext } from './auth';
import { ProvidersWrapper } from './providers/ProvidersWrapper';
import React from 'react';


/**
 * Inject interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ProvidersWrapper>
      <App />
    </ProvidersWrapper>
  </React.StrictMode>
);
