import clsx from 'clsx';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { useUser } from '@/hooks/useUser';
import { toast } from 'react-toastify';

type LocationState = {
  email?: string;
};

const ResetPasswordEnterOTP = () => {
  const { verifyForgotPasswordOtp } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state || {}) as LocationState;
  const email = state.email;

  const [otp, setOtp] = useState('');
  const [isError, setIsError] = useState({ otp: false });

  const validate = () => {
    const errors = {
      otp: !otp.trim(),
    };
    setIsError(errors);
    if (errors.otp) toast.error('OTP là bắt buộc');
    return !Object.values(errors).some(Boolean);
  };

  const handleVerify = async () => {
    if (!validate()) return;

    try {
      await verifyForgotPasswordOtp(otp.trim());
      // Backend hiện tại: verify OTP sẽ generate password mới và gửi về email.
      navigate('/auth/reset-password/changed', { replace: true });
    } catch (e) {
      // toast đã được xử lý trong hook
    }
  };

  return (
    <div className="card max-w-[370px] w-full p-10 gap-5">
      <div className="text-center mb-2.5">
        <div className="flex items-center justify-center font-medium mt-6 text-[#1A2B49] text-lg">
          Nhập OTP
        </div>
        <div className="text-2sm text-gray-700 mt-2">
          {email ? (
            <>
              Mã OTP đã được gửi về email <span className="font-medium">{email}</span>
            </>
          ) : (
            <>Mã OTP đã được gửi về email của bạn</>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="form-label text-gray-900">OTP</label>
        <label className="input">
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setIsError((prev) => ({ ...prev, otp: false }));
            }}
            placeholder="Nhập mã OTP (6 số)"
            autoComplete="one-time-code"
            className={clsx('form-control bg-transparent', isError.otp && 'border border-danger')}
          />
        </label>
      </div>

      <div className="flex flex-col gap-5 items-stretch">
        <div
          onClick={handleVerify}
          className="btn btn-primary flex justify-center grow bg-[#1A2B49] hover:bg-[#1A2B49]"
        >
          Xác nhận
        </div>

        <div className="flex items-center gap-1 justify-center">
          <p className="text-sm font-medium text-[#1A2B49]">Nhập sai email?</p>
          <Link to={'/auth/reset-password'} className="text-2sm link shrink-0 text-[#BAA382]">
            Quay lại
          </Link>
        </div>
      </div>
    </div>
  );
};

export { ResetPasswordEnterOTP };

