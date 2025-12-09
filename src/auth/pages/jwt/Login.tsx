import { type MouseEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useLayout } from '@/providers';

const loginSchema = Yup.object().shape({
  account: Yup.string()
    .min(9, 'Tối thiểu 9 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập số điện thoại hoặc email'),
  password: Yup.string()
    .min(6, 'Tối thiểu 6 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập mật khẩu'),
  remember: Yup.boolean()
});

const initialValues = {
  account: '',
  password: '',
  remember: false
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);

      try {
        if (!login) {
          throw new Error('JWTProvider is required for this form.');
        }
        await login(values.account, values.account, values.password);

        if (values.remember) {
          localStorage.setItem('account', values.account);
        } else {
          localStorage.removeItem('account');
        }

        navigate(from, { replace: true });
      } catch {
        setStatus('The login details are incorrect');
        setSubmitting(false);
      }
      setLoading(false);
    }
  });

  const togglePassword = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[392px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10 dark:bg-white"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="text-center mb-2.5">
          <div className='flex gap-2 items-center justify-center text-[#1A2B49] dark:text-[#1A2B49] text-lg font-bold'>
            ADMIN
          </div>
          <div className="flex items-center justify-center font-medium mt-6 text-[#1A2B49] dark:text-[#1A2B49] text-lg">
            Đăng nhập
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900 dark:text-[#1A2B49]">Tài khoản</label>
          <label className="input dark:bg-white">
            <input
              placeholder="Vui lòng nhập tài khoản"
              autoComplete="off"
              {...formik.getFieldProps('account')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.account && formik.errors.account
              })}
            />
          </label>
          {formik.touched.account && formik.errors.account && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.account}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <label className="form-label text-gray-900">Mật khẩu</label>
          </div>
          <label className="input dark:bg-white">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.password && formik.errors.password
              })}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )}
        </div>
        
        <div className='w-full flex justify-between'>
          <label className="checkbox-group dark:bg-white">
            <input
              className="checkbox checkbox-sm dark:bg-white"
              type="checkbox"
              {...formik.getFieldProps('remember')}
            />
            <span className="checkbox-label dark:bg-white">Nhớ tài khoản</span>
          </label>
          <Link
            to={
              '/auth/reset-password'
            }
            className="text-2sm link shrink-0 text-[#BAA382]"
          >
            Quên mật khẩu
          </Link>
          <Link
            to={
              '/auth/signup'
            }
            className="text-2sm link shrink-0 text-[#FEC010]"
          >
            Đăng ký
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Please wait...' : 'Sign In'}
        </button>

        {formik.status && (
          <div className="text-danger text-xs mt-1" role="alert">
            {formik.status}
          </div>
        )}
      </form>
    </div>
  );
};

export { Login };
