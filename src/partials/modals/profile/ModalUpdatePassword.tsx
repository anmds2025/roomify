import { forwardRef, useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { useSnackbar } from 'notistack';
import clsx from 'clsx';
import { useUser } from '@/hooks/useUser';
import { useAuthContext } from '@/auth';

interface ModalUpdatePasswordProps {
  open: boolean;
  onClose: () => void;
}


const ModalUpdatePassword = forwardRef<HTMLDivElement, ModalUpdatePasswordProps>(
  ({ open, onClose }, ref) => {
  const { enqueueSnackbar } = useSnackbar();
  const { changePassword } = useUser();
  const { currentUser } = useAuthContext();
  const [inputPasswordOld, setInputPasswordOld] = useState<string>('');
  const [inputPasswordNew1, setInputPasswordNew1] = useState<string>('');
  const [inputPasswordNew2, setInputPasswordNew2] = useState<string>('');

  const [showPasswordOld, setShowPasswordOld] = useState(false);
  const [showPasswordNew1, setShowPasswordNew1] = useState(false);
  const [showPasswordNew2, setShowPasswordNew2] = useState(false);

  const togglePasswordOld = () => {
    setShowPasswordOld((prev) => !prev);
  };

  const togglePasswordNew1 = () => {
    setShowPasswordNew1((prev) => !prev);
  };

  const togglePasswordNew2 = () => {
    setShowPasswordNew2((prev) => !prev);
  };

  const [isError, setIsError] = useState({
    passwordOld: false,
    passwordNew1: false,
    passwordNew2: false,
    passwordMatch: false,
  });

  const validateFields = () => {  
    const errors = {
      passwordOld: !inputPasswordOld.trim(),
      passwordNew1: !inputPasswordNew1.trim(),
      passwordNew2: !inputPasswordNew2.trim(),
      passwordMatch: inputPasswordNew1 !== inputPasswordNew2,
    };
  
    setIsError(errors as any);
  
    const hasError = Object.values(errors).some((error) => error);
  
    if (hasError) {
      if (errors.passwordOld) toast.error("Mật khẩu cũ là bắt buộc");
      if (errors.passwordNew1) toast.error("Mật khẩu mới là bắt buộc");
      if (errors.passwordNew2) toast.error("Xác nhận nhận khẩu là bắt buộc");
      if (errors.passwordMatch) toast.error("Mật khẩu không trùng khớp");
    }
    return !hasError;
  };
  

  const handleClose = () => {
    setInputPasswordOld('');
    setInputPasswordNew1('');
    setInputPasswordNew2('');
    setIsError({
      passwordOld: false,
      passwordNew1: false,
      passwordNew2: false,
      passwordMatch: false,
    })
    onClose();
  };

  const handleInputChange = (
    field: "passwordOld" | "passwordNew1" | "passwordNew2",
    value: any
  ) => {
    switch (field) {
      case "passwordOld":
        setInputPasswordOld(value);
        break;
      case "passwordNew1":
        setInputPasswordNew1(value);
        break;
      case "passwordNew2":
        setInputPasswordNew2(value);
        break;
    }
    setIsError((prev) => ({ ...prev, [field]: false })); 
  };

  const handleUpdate = async () => {
    if (validateFields()) {
      try {
        const success = await changePassword({
          id: currentUser?._id.$oid || "",
          old_password :inputPasswordOld,
          new_password :inputPasswordNew1
        });
        if (success) {
          handleClose()
        }
      } catch (error) {
        console.error('Failed to update Profile', error);
      }
    }
  };

  return (
    <>
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[10%]">
        <ModalHeader className="py-4 px-5">
          <div className="text-[#1A2B49] text-lg font-semibold">Thay đổi mật khẩu</div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="py-4 px-5">

          <div className="text-sm text-[#1A2B49] mt-4">Mật khẩu hiện tại</div>
          <div className="flex gap-2 items-center">
            <div
              className="input w-full text-sm mt-1 flex items-center justify-between px-2"
              style={{ borderColor: isError.passwordOld ? 'red' : '#F4F4F4' }}
            >
              <input
                style={{
                  color: '#1A2B49',
                  padding: '0.5rem 0',
                  fontWeight: 600,
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                }}
                type={showPasswordOld ? 'text' : 'password'}
                value={inputPasswordOld}
                onChange={(e) => handleInputChange('passwordOld', e.target.value)}
              />

              <button
                type="button"
                className="btn btn-icon"
                onClick={togglePasswordOld}
              >
                <KeenIcon
                  icon="eye"
                  className={clsx('text-gray-500', { hidden: showPasswordOld })}
                />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx('text-gray-500', { hidden: !showPasswordOld })}
                />
              </button>
            </div>
          </div>

          <div className="text-sm text-[#1A2B49] mt-4">Mật khẩu mới</div>
          <div className="flex gap-2 items-center">
            <div
              className="input w-full text-sm mt-1 flex items-center justify-between px-2"
              style={{ borderColor: (isError.passwordNew1) ? 'red' : '#F4F4F4' }}
            >
              <input
                style={{
                  color: '#1A2B49',
                  padding: '0.5rem 0',
                  fontWeight: 600,
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                }}
                type={showPasswordNew1 ? 'text' : 'password'}
                value={inputPasswordNew1}
                onChange={(e) => handleInputChange('passwordNew1', e.target.value)}
              />

              <button
                type="button"
                className="btn btn-icon"
                onClick={togglePasswordNew1}
              >
                <KeenIcon
                  icon="eye"
                  className={clsx('text-gray-500', { hidden: showPasswordNew1 })}
                />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx('text-gray-500', { hidden: !showPasswordNew1 })}
                />
              </button>
            </div>
          </div>

          <div className="text-sm text-[#1A2B49] mt-4">Nhập lại mật khẩu mới</div>
          <div className="flex gap-2 items-center">
            <div
              className="input w-full text-sm mt-1 flex items-center justify-between px-2"
              style={{ borderColor: (isError.passwordMatch || isError.passwordNew2) ? 'red' : '#F4F4F4' }}
            >
              <input
                style={{
                  color: '#1A2B49',
                  padding: '0.5rem 0',
                  fontWeight: 600,
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                }}
                type={showPasswordNew2 ? 'text' : 'password'}
                value={inputPasswordNew2}
                onChange={(e) => handleInputChange('passwordNew2', e.target.value)}
              />

              <button
                type="button"
                className="btn btn-icon"
                onClick={togglePasswordNew2}
              >
                <KeenIcon
                  icon="eye"
                  className={clsx('text-gray-500', { hidden: showPasswordNew2 })}
                />
                <KeenIcon
                  icon="eye-slash"
                  className={clsx('text-gray-500', { hidden: !showPasswordNew2 })}
                />
              </button>
            </div>
          </div>

          <div className="w-full flex gap-2 justify-end pt-4">
            <button onClick={handleClose} className="py-2 px-3 border border-[#F4F4F4] rounded text-sm font-medium text-[#161517]">
              Hủy bỏ
            </button>
            <button onClick={handleUpdate} className="py-2 px-3 border border-[#F4F4F4] rounded text-sm font-medium bg-[#1A2B49] text-white">
              Cập nhật
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  );
});

export { ModalUpdatePassword };
