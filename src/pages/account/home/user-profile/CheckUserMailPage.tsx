import { Fragment, useEffect, useState } from 'react';
import { ModalCheckPassword } from '@/partials/modals/confirm/ModalCheckPassword';
import { useSearchParams } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';

const CheckUserMailPage = () => {
  const [openCheckModal, setOpenCheckModal] = useState(false);
  const [searchParams] = useSearchParams();
  const [apiCalled, setApiCalled] = useState(false);
  const { sendMailNewPassword } = useUser();

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  useEffect(() => {
    const sessionKey = `sendMailNewPassword_${email}_${token}`;

    if (email && token && !sessionStorage.getItem(sessionKey)) {
      const callApi = async () => {
        try {
          const response = await sendMailNewPassword({ email, token });
          if(response)
          {
            sessionStorage.setItem(sessionKey, 'called');
            setOpenCheckModal(true);
          }
          
        } catch (error) {
          console.error('❌ Failed to update password:', error);
        }
      };
      callApi();
    } else {
      setOpenCheckModal(true);
    }
  }, [email, token]);
  
  return (
    <div className="max-w-[370px] w-full p-10 gap-5">
      <ModalCheckPassword
        open={openCheckModal}
        onClose={()=>{console.log('không đóng')}}
        title= {"Đã tạo mật khẩu mới"}
        message={'Hệ thống đã gửi email chứa mật khẩu đến mới đến email của bạn. Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.'}
      />
    </div>
  );
};

export { CheckUserMailPage };
