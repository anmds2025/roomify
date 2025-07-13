import useBodyClasses from '@/hooks/useBodyClasses';
import { Content, Demo1LayoutProvider, Header, Main } from '.';
import { Fragment } from 'react/jsx-runtime';
import { Helmet } from 'react-helmet-async';

const DemoLayout = () => {
  // Using the useBodyClasses hook to set background styles for light and dark modes
  useBodyClasses(
    '[--tw-page-bg:#fefefe] [--tw-page-bg-dark:var(--tw-coal-500)] bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark]'
  );

  return (
    <Demo1LayoutProvider>
      <Fragment>
        <Helmet>
        </Helmet>

        <div className="flex grow">
          <div className="wrapper flex grow flex-col">
            <Header />
            <div className='w-full h-full flex justify-center items-center px-2'>
              Tài khoản của bạn hiện chưa có quyền để sử dụng ứng dụng, vui lòng nâng cấp gói hoặc liên hệ với quản trị viên!
            </div>
            <Content />

            {/* <Footer /> */}
          </div>
        </div>
      </Fragment>
    </Demo1LayoutProvider>
  );
};

export { DemoLayout };
