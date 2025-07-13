import React, { forwardRef, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useDemo1Layout } from '../';
import { toAbsoluteUrl } from '@/utils';
import { SidebarToggle } from './';

const { VITE_APP_NAME } = import.meta.env ?? { VITE_APP_NAME: 'ADMIN' };

const SidebarHeader = forwardRef<HTMLDivElement>(() => {
  const { layout } = useDemo1Layout();

  const logoKiai = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        <img
          src={toAbsoluteUrl('media/login/logo_kiai.svg')}
          className="default-logo min-h-[22px] max-w-none"
        />
      </Link>
    </Fragment>
  );

  const lightLogo = () => (
    <Fragment>
      <Link to="/" className="dark:hidden">
        <img
          src={toAbsoluteUrl('media/app/default-logo.svg')}
          className="default-logo min-h-[22px] max-w-none"
        />
        <img
          src={toAbsoluteUrl('media/app/mini-logo.svg')}
          className="small-logo min-h-[22px] max-w-none"
        />
      </Link>
      <Link to="/" className="hidden dark:block">
        <img
          src={toAbsoluteUrl('media/app/default-logo-dark.svg')}
          className="default-logo min-h-[22px] max-w-none"
        />
        <img
          src={toAbsoluteUrl('media/app/mini-logo.svg')}
          className="small-logo min-h-[22px] max-w-none"
        />
      </Link>
    </Fragment>
  );

  const darkLogo = () => (
    <Link to="/">
      <img
        src={toAbsoluteUrl('media/app/default-logo-dark.svg')}
        className="default-logo min-h-[22px] max-w-none"
      />
      <img
        src={toAbsoluteUrl('media/app/mini-logo.svg')}
        className="small-logo min-h-[22px] max-w-none"
      />
    </Link>
  );

  return (
    <div className="sidebar-header hidden lg:flex items-center relative px-6 shrink-0 text-lg font-bold">
      <div className='p-2 text-[18px] text-white bg-[#1A2B49] rounded-lg'>
        {VITE_APP_NAME}
      </div>
      <SidebarToggle />
    </div>
  );
});

export { SidebarHeader };
