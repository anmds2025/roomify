import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuthContext } from '../../useAuthContext';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { toast } from 'react-toastify';

const initialValues = {
  email: '',
  password: '',
  phone: '',
  changepassword: '',
  acceptTerms: false
};

const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email không đúng định dạng')
    .min(3, 'Tối thiểu 3 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập email'),

  phone: Yup.string()
    .min(9, 'Tối thiểu 9 ký tự')
    .max(11, 'Tối đa 11 ký tự')
    .required('Vui lòng nhập số điện thoại'),

  password: Yup.string()
    .min(3, 'Tối thiểu 3 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập mật khẩu'),

  changepassword: Yup.string()
    .min(3, 'Tối thiểu 3 ký tự')
    .max(50, 'Tối đa 50 ký tự')
    .required('Vui lòng nhập lại mật khẩu')
    .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp'),

  acceptTerms: Yup.bool().required('Bạn phải đồng ý với điều khoản sử dụng')
});

const Signup = () => {
  const [loading, setLoading] = useState(false);
  const { register } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!register) {
          throw new Error('JWTProvider is required for this form.');
        }
        const res = await register(values.phone, values.email, values.password);

        // Nếu API trả về { Success: "Đăng ký thành công!" }
        if (res?.Success) {
          setStatus('');
          setSubmitting(false);
          setLoading(false);

          // Hiển thị thông báo thành công
          toast.success(res.Success);

          // Chờ 1.5 giây rồi mới điều hướng
          setTimeout(() => {
            navigate('/auth/login');
          }, 1500);
        }
      } catch (error) {
        console.error(error);
        setStatus('Thông tin đăng ký không hợp lệ');
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const togglePassword = (event: any) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = (event: any) => {
    event.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-5 p-10"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="text-center mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Đăng ký tài khoản
          </h3>
          <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Bạn đã có tài khoản?</span>
            <Link
              to={
                currentLayout?.name === 'auth-branded'
                  ? '/auth/login'
                  : '/auth/classic/login'
              }
              className="text-2sm link"
            >
              Đăng nhập
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="border-t border-gray-200 w-full"></span>
          <span className="text-2xs text-gray-500 font-medium uppercase">Hoặc</span>
          <span className="border-t border-gray-200 w-full"></span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Email</label>
          <label className="input">
            <input
              placeholder="Nhập email"
              type="email"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.email && formik.errors.email },
                { 'is-valid': formik.touched.email && !formik.errors.email }
              )}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span className="text-danger text-xs mt-1">{formik.errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Số điện thoại</label>
          <label className="input">
            <input
              placeholder="Nhập số điện thoại"
              type="text"
              autoComplete="off"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={11}
              {...formik.getFieldProps('phone')}
              onChange={(e) => {
                // Chỉ giữ lại ký tự 0-9
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                formik.setFieldValue('phone', onlyNums);
              }}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.phone && formik.errors.phone },
                { 'is-valid': formik.touched.phone && !formik.errors.phone }
              )}
            />
          </label>
          {formik.touched.phone && formik.errors.phone && (
            <span className="text-danger text-xs mt-1">{formik.errors.phone}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Mật khẩu</label>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx(
                'form-control bg-transparent',
                { 'is-invalid': formik.touched.password && formik.errors.password },
                { 'is-valid': formik.touched.password && !formik.errors.password }
              )}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showPassword })}
              />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span className="text-danger text-xs mt-1">{formik.errors.password}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Xác nhận mật khẩu</label>
          <label className="input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu"
              autoComplete="off"
              {...formik.getFieldProps('changepassword')}
              className={clsx(
                'form-control bg-transparent',
                {
                  'is-invalid':
                    formik.touched.changepassword &&
                    formik.errors.changepassword
                },
                {
                  'is-valid':
                    formik.touched.changepassword &&
                    !formik.errors.changepassword
                }
              )}
            />
            <button className="btn btn-icon" onClick={toggleConfirmPassword}>
              <KeenIcon
                icon="eye"
                className={clsx('text-gray-500', { hidden: showConfirmPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx('text-gray-500', { hidden: !showConfirmPassword })}
              />
            </button>
          </label>
          {formik.touched.changepassword && formik.errors.changepassword && (
            <span className="text-danger text-xs mt-1">
              {formik.errors.changepassword}
            </span>
          )}
        </div>
        {formik.touched.acceptTerms && formik.errors.acceptTerms && (
          <span className="text-danger text-xs mt-1">
            {formik.errors.acceptTerms}
          </span>
        )}

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? 'Vui lòng chờ...' : 'Đăng ký'}
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

export { Signup };
