import { Link, Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { toAbsoluteUrl } from '@/utils';
import useBodyClasses from '@/hooks/useBodyClasses';
import { AuthBrandedLayoutProvider } from './AuthBrandedLayoutProvider';

const Layout = () => {
  useBodyClasses('dark:bg-coal-500');

  return (
    <Fragment>
      <style>
        {`
          .bg-login {
            background-image: url('${toAbsoluteUrl('media/login/bg_kiai_login.jpg')}');
          }
        `}
      </style>

      <div className={`grid lg:grid-cols-1 grow bg-login`}>
        <div className="flex justify-center items-center p-8 lg:p-10 order-2 lg:order-1">
          <Outlet />
        </div>
      </div>
    </Fragment>
  );
};

// AuthBrandedLayout component that wraps the Layout component with AuthBrandedLayoutProvider
const AuthBrandedLayout = () => (
  <AuthBrandedLayoutProvider>
    <Layout />
  </AuthBrandedLayoutProvider>
);

export { AuthBrandedLayout };
