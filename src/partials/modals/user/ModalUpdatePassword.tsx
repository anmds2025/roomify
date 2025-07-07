import { forwardRef, useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { ModalUpdatePasswordProps } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useUser } from '@/hooks/useUser';

const ModalUpdatePassword = forwardRef<HTMLDivElement, ModalUpdatePasswordProps>(
  ({ open, onClose, user_id }) => {
  const { changePassword } = useUser();
  
  const [inputPasswordOld, setInputPasswordOld] = useState<string>('');
  const [showPasswordOld, setShowPasswordOld] = useState(false);

  const [inputPasswordNew, setInputPasswordNew] = useState<string>('');
  const [showPasswordNew, setShowPasswordNew] = useState(false);

  const [inputPasswordConfirm, setInputPasswordConfirm] = useState<string>('');
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const togglePasswordOldVisibility = () => {
    setShowPasswordOld(!showPasswordOld);
  };

  const togglePasswordNewVisibility = () => {
    setShowPasswordNew(!showPasswordNew);
  };

  const togglePasswordConfirmVisibility = () => {
    setShowPasswordConfirm(!showPasswordConfirm);
  };
  
  const [isError, setIsError] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false,
    check: false
  });

  const validateFields = () => {
    const errors = {
      old_password: !inputPasswordOld.trim(),
      new_password: !inputPasswordNew.trim(),
      confirm_password: !inputPasswordConfirm.trim(),
      check: inputPasswordNew != inputPasswordConfirm
    };

    setIsError(errors);

    const hasError = Object.values(errors).some((error) => error);
    if (hasError) {
      if (errors.old_password) toast.error("Mật khẩu hiện tại là bắt buộc");
      if (errors.new_password) toast.error("Mật khẩu mới là bắt buộc");
      if (errors.confirm_password) toast.error("Xác nhận mật khẩu là bắt buộc");
      if (errors.check) toast.error("Mật khẩu mới và nhập lại mật khẩu mới không giống nhau");
    }
  
    return !hasError;
  };

  const handleClose = () => {
    setInputPasswordOld('');
    setInputPasswordNew('');
    setInputPasswordConfirm('');
    setIsError({
      old_password: false,
      new_password: false,
      confirm_password: false,
      check: false
    })
    onClose();
  };

  const handleInputChange = (
    field: "old_password" | "new_password" | "confirm_password",
    value: string
  ) => {
    switch (field) {
      case "old_password":
        setInputPasswordOld(value);
        break;
      case "new_password":
        setInputPasswordNew(value);
        break;
      case "confirm_password":
        setInputPasswordConfirm(value);
        break;
      }
    setIsError((prev) => ({ ...prev, [field]: false })); 
  };


  const handleUpdate = async () => {
    if (validateFields()) {
      try {
        await changePassword({ 
          id: user_id,
          old_password: inputPasswordOld, 
          new_password: inputPasswordNew
        });
        handleClose();
      } catch (error) {
        console.error('Failed to update password', error);
      }
    }
  };

  return (
    <>
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[15%]">
        <ModalHeader className="py-4 px-5">
          <div className="text-[#1A2B49] text-lg font-semibold">Thay đổi mật khẩu</div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="py-4 px-5">
          <div className='flex flex-col gap-2'>
            <div className="flex gap-2 justify-between">
            <div className="text-sm text-[#404041] mt-4">Mật khẩu hiện tại</div>
                <div className="flex gap-2 items-center">
                  <div className="input w-full text-base relative" style={{borderColor : isError.old_password ? "red" : "#404041"}}>
                    <input
                      style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                      type={showPasswordOld ? 'text' : 'password'} // Thay đổi loại input
                      placeholder="Mật khẩu hiện tại"
                      value={inputPasswordOld}
                      onChange={(e) => handleInputChange("old_password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordOldVisibility}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {showPasswordOld ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#1A2B49"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.761 0-5-2.238-5-5s2.239-5 5-5 5 2.238 5 5-2.239 5-5 5zm0-9c-2.21 0-4 1.791-4 4s1.79 4 4 4 4-1.791 4-4-1.79-4-4-4z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#1A2B49"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.761 0-5-2.238-5-5s2.239-5 5-5 5 2.238 5 5-2.239 5-5 5zm9-12.485l-1.586-1.586-14.829 14.829 1.586 1.586 14.829-14.829z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
            </div>

            <div className="flex gap-2 justify-between">
            <div className="text-sm text-[#404041] mt-4">Mật khẩu mới</div>
                <div className="flex gap-2 items-center">
                  <div className="input w-full text-base relative" style={{borderColor : isError.new_password ? "red" : "#404041"}}>
                    <input
                      style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                      type={showPasswordNew ? 'text' : 'password'} // Thay đổi loại input
                      placeholder="Mật khẩu mới"
                      value={inputPasswordNew}
                      onChange={(e) => handleInputChange("new_password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordNewVisibility}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {showPasswordNew ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#1A2B49"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.761 0-5-2.238-5-5s2.239-5 5-5 5 2.238 5 5-2.239 5-5 5zm0-9c-2.21 0-4 1.791-4 4s1.79 4 4 4 4-1.791 4-4-1.79-4-4-4z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#1A2B49"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.761 0-5-2.238-5-5s2.239-5 5-5 5 2.238 5 5-2.239 5-5 5zm9-12.485l-1.586-1.586-14.829 14.829 1.586 1.586 14.829-14.829z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
            </div>

            <div className="flex gap-2 justify-between">
            <div className="text-sm text-[#404041] mt-4">Nhập lại mật khẩu mới</div>
                <div className="flex gap-2 items-center">
                  <div className="input w-full text-base relative" style={{borderColor : isError.confirm_password ? "red" : "#404041"}}>
                    <input
                      style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                      type={showPasswordConfirm ? 'text' : 'password'} // Thay đổi loại input
                      placeholder="Nhập lại mật khẩu mới"
                      value={inputPasswordConfirm}
                      onChange={(e) => handleInputChange("confirm_password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={togglePasswordConfirmVisibility}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {showPasswordConfirm ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#1A2B49"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.761 0-5-2.238-5-5s2.239-5 5-5 5 2.238 5 5-2.239 5-5 5zm0-9c-2.21 0-4 1.791-4 4s1.79 4 4 4 4-1.791 4-4-1.79-4-4-4z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          fill="#1A2B49"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 5c-7 0-12 7-12 7s5 7 12 7 12-7 12-7-5-7-12-7zm0 12c-2.761 0-5-2.238-5-5s2.239-5 5-5 5 2.238 5 5-2.239 5-5 5zm9-12.485l-1.586-1.586-14.829 14.829 1.586 1.586 14.829-14.829z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
            </div>
          </div>

          
          <div className="w-full flex gap-2 justify-end pt-4">
            <button onClick={handleClose} className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold text-[#1A2B49]">
              Hủy bỏ
            </button>
            <button onClick={handleUpdate} className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold bg-[#404041] text-white">
              Thay đổi
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  );
});

export { ModalUpdatePassword };
