import clsx from 'clsx';
import { useFormik } from 'formik';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

import { useAuthContext } from '@/auth/useAuthContext';
import { KeenIcon } from '@/components';
import { useLayout } from '@/providers';
import { toast } from 'react-toastify';
import { useUser } from '@/hooks/useUser';
import { ModalCheckPassword } from '@/partials/modals/confirm/ModalCheckPassword';

const ResetPassword = () => {
  const { sendMailCheckPassword } = useUser();
  const [inputEmail, setInputEmail] = useState<string>('');
  const [openCheckModal, setOpenCheckModal] = useState(false);
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
    if (validateFields()) {
      try {
        const response =  await sendMailCheckPassword(inputEmail);
        if(response)
        {
          setOpenCheckModal(true)
        }
      } catch (error) {
        console.error('Failed to update password', error);
      }
    }
  };

  const handleCloseActiveModal = () => {
    setOpenCheckModal(false);
  };

  return (
    <div className="card max-w-[370px] w-full p-10 gap-5">
      <ModalCheckPassword
        open={openCheckModal}
        onClose={handleCloseActiveModal}
        title= {"Khôi phục mật khẩu"}
        message={'Hệ thống sẽ gửi email chứa liên kết khôi phục mật khẩu đến bạn nếu email đã được đăng ký trước đó. Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.'}
      />
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
