import clsx from 'clsx';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';
import { useUser } from '@/hooks/useUser';

const ResetPassword = () => {
  const { sendForgotPasswordOtp } = useUser();
  const navigate = useNavigate();
  const [inputEmail, setInputEmail] = useState<string>('');
  const [isError, setIsError] = useState({
    email: false,
  });

  const validateFields = () => {
    const errors = {
      email: !inputEmail.trim(),
    };

    setIsError(errors);

    const hasError = Object.values(errors).some((error) => error);
    if (hasError) {
      if (errors.email) toast.error("Email là bắt buộc");
    }
    return !hasError;
  };

  const handleInputChange = (
    field: "email",
    value: any
  ) => {
    switch (field) {
      case "email":
        setInputEmail(value);
        break;
    }
    setIsError((prev) => ({ ...prev, [field]: false })); 
  };

  const handleSendMail = async () => {
    if (!validateFields()) return;

    try {
      await sendForgotPasswordOtp(inputEmail.trim());
      // chuyển sang màn hình nhập OTP
      navigate('/auth/reset-password/enter-otp', {
        state: { email: inputEmail.trim() },
      });
    } catch (error) {
      // toast đã được xử lý trong hook
      console.error('Failed to send OTP', error);
    }
  };

  return (
    <div className="card max-w-[370px] w-full p-10 gap-5">
      <div className="text-center mb-2.5">
        <div className='flex gap-2 items-center justify-center text-[#1A2B49] text-lg font-bold'>
          ADMIN
        </div>
        <div className="flex items-center justify-center font-medium mt-6 text-[#1A2B49] text-lg">
          Quên mật khẩu
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label text-gray-900">Email</label>
        <label className="input">
          <input
            type="email"
            value={inputEmail}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Vui lòng nhập email"
            autoComplete="off"
            className={clsx(
              'form-control bg-transparent'
            )}
          />
        </label>
      </div>

      <div className="flex flex-col gap-5 items-stretch">
        <div
          onClick={handleSendMail}
          className="btn btn-primary flex justify-center grow bg-[#1A2B49] hover:bg-[#1A2B49]"
        >
          {'Tiếp tục'}
        </div>
        <div className='flex items-center gap-1 justify-center'>
          <p className='text-sm font-medium text-[#1A2B49]'>Bạn đã có tài khoản ?</p>
          <Link
            to={
              '/auth/login'
            }
            className="text-2sm link shrink-0 text-[#BAA382]"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ResetPassword };
