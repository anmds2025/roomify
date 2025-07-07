import { forwardRef, useEffect, useRef, useState } from 'react';
import { Modal, ModalContent, ModalBody, ModalHeader } from '@/components/modal';
import { KeenIcon } from '@/components';
import { toast } from 'react-toastify';
import { IRoleData, ModalUpdateUserProps, IUserRoleData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useSnackbar } from 'notistack';
import { useUser } from '@/hooks/useUser';
import { ModalConfirmCreateUser } from '../confirm/ModalConfirmCreateUser';

const ModalUpdateUser = forwardRef<HTMLDivElement, ModalUpdateUserProps>(
  ({ open, onClose, user, fetchUsers }, ref) => {
  const { createUser, updateUser } = useUser();
  const [inputFullname, setInputFullname] = useState<string>('');
  const [inputEmail, setInputEmail] = useState<string>('');
  const [inputPhone, setInputPhone] = useState<string>('');
  const [inputAddress, setInputAddress] = useState<string>('');
  const [inputLevel, setInputLevel] = useState<string>('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  
  const [isError, setIsError] = useState({
    fullname: false,
    email: false,
    address: false,
    phone: false,
    level: false,
    emailInvalid: false
  });

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateFields = () => {
    const isEmailInvalid = validateEmail(inputEmail.trim());
    const errors = {
      fullname: !inputFullname.trim(),
      email: !inputEmail.trim(),
      phone: !inputPhone.trim(),
      level: !inputLevel.trim(),
      address: !inputAddress.trim(),
      emailInvalid: !isEmailInvalid
    };

    setIsError(errors);

    const hasError = Object.values(errors).some((error) => error);
    if (hasError) {
      if (errors.fullname) toast.error("Họ tên là bắt buộc");
      if (errors.email) toast.error("Email là bắt buộc");
      if (errors.phone) toast.error("Số điện thoại là bắt buộc");
      if (errors.level) toast.error("Cấp độ là bắt buộc");
      if (errors.address) toast.error("Địa chỉ là bắt buộc");
      if (errors.emailInvalid) toast.error("Email không đúng định dạng");
    }
    return !hasError;
  };

  useEffect(() => {
    setInputFullname(user?.fullname || "")
    setInputEmail(user?.email || "")
    setInputPhone(user?.phone || "")
    setInputLevel(user?.level || "")
    setInputAddress(user?.address || "")
  }, [user]);

  const handleClose = () => {
    setInputFullname('');
    setInputEmail('');
    setInputPhone('');
    setInputLevel('');
    setInputAddress('');
    setIsError({
      fullname: false,
      email: false,
      address: false,
      phone: false,
      level: false,
      emailInvalid: false
    })
    onClose();
  };

  const handleInputChange = (
    field: "fullname" | "email" | "address" | "phone" | "level",
    value: string
  ) => {
    switch (field) {
      case "fullname":
        setInputFullname(value);
        break;
      case "email":
        setInputEmail(value);
        break;
      case "address":
        setInputAddress(value);
        break;
      case "phone":
        setInputPhone(value);
        break;
      case "level":
        setInputLevel(value);
        break;
      }
    setIsError((prev) => ({ ...prev, [field]: false })); 
  };

  const handleSubmit = async () => {
    if (validateFields()) {
      try 
      {
        await createUser({ 
          pk: '',
          email: inputEmail, 
          fullname: inputFullname, 
          phone: inputPhone,
          level: inputLevel,
          address: inputAddress,
          typeLogin: 'admin_add',
        });
        handleCloseCreateModal();
        fetchUsers();
        handleClose();
      } catch (error) {
        console.error('Failed to create user', error);
      }
    }
  };

  const handleUpdate = async () => {
    if (validateFields()) {
      try 
      {
        await updateUser({ 
          pk: user._id.$oid,
          email: inputEmail, 
          fullname: inputFullname, 
          phone: inputPhone,
          level: inputLevel,
          address: inputAddress,
          typeLogin: 'admin_add',
        });
        fetchUsers();
        handleClose();
      } catch (error) {
        console.error('Failed to update user', error);
      }
    }
  };

  const handleOpenCreateModal = () => {
    if (validateFields()) {
      setOpenCreateModal(true);
    }
  };

  const handleCloseCreateModal = () => {
    setOpenCreateModal(false);
  };

  return (
    <>
    <ModalConfirmCreateUser
      open={openCreateModal}
      onClose={handleCloseCreateModal}
      onConfirm={handleSubmit}
      title= "Xác nhận tạo tài khoản"
      message={"Tài khoản sẽ được tạo và gửi thông tin đăng nhập về địa chỉ email " + inputEmail}
    />
    <Modal open={open} onClose={handleClose}>
      <ModalContent className="max-w-[600px] top-[15%]">
        <ModalHeader className="py-4 px-5">
          <div className="text-[#1A2B49] text-lg font-semibold">{user?._id?.$oid ? "Cập nhật tài khoản" : "Thêm tài khoản"}</div>
          <button className="btn btn-sm btn-icon btn-light btn-clear shrink-0" onClick={handleClose}>
            <KeenIcon icon="cross" />
          </button>
        </ModalHeader>
        <ModalBody className="py-4 px-5">
          <div className='flex items-center mb-4'>
            <div className="text-sm text-[#404041] min-w-[150px]">Họ tên</div>
            <div className="flex gap-2 w-full">
              <div className="input w-full text-base" style={{borderColor : isError.fullname ? "red" : "#DBDFE9"}}>
                <input
                  style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                  type="text"
                  value={inputFullname}
                  onChange={(e) => handleInputChange("fullname", e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className='flex items-center mb-4'>
            <div className="text-sm text-[#404041] min-w-[150px]">Email</div>
            <div className="flex gap-2 w-full">
              <div className="input w-full text-base" style={{borderColor : isError.email ? "red" : "#DBDFE9"}}>
                <input
                  style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                  type="text"
                  value={inputEmail}
                  onChange={(e) => handleInputChange("email", e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className='flex items-center mb-4'>
            <div className="text-sm text-[#404041] min-w-[150px]">Số điện thoại</div>
            <div className="flex gap-2 w-full">
              <div className="input w-full text-base" style={{borderColor : isError.phone ? "red" : "#DBDFE9"}}>
                <input
                  style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                  type="text"
                  value={inputPhone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    handleInputChange("phone", value);
                  }} 
                />
              </div>
            </div>
          </div>

          <div className='flex items-center mb-4'>
            <div className="text-sm text-[#404041] min-w-[150px]">Địa chỉ</div>
            <div className="flex gap-2 w-full">
              <div className="input w-full text-base" style={{borderColor : isError.address ? "red" : "#DBDFE9"}}>
                <input
                  style={{ color: '#1A2B49', padding: '0.5rem 0' }}
                  type="text"
                  value={inputAddress}
                  onChange={(e) => handleInputChange("address", e.target.value)} 
                />
              </div>
            </div>
          </div>

          <div className='flex items-center mb-4'>
            <div className="text-sm text-[#404041] min-w-[150px]">Cấp độ</div>
            <div className="flex gap-2 w-full">
              <div
                className="input w-full text-base"
                style={{ borderColor: isError.level ? "red" : "#DBDFE9" }}
              >
                <select
                  style={{ color: '#1A2B49', padding: '0.5rem 0', width: '100%', backgroundColor: 'transparent' }}
                  value={inputLevel}
                  onChange={(e) => handleInputChange("level", e.target.value)}
                >
                  <option value="">Chọn cấp độ</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>
          </div>
          <div className="w-full flex gap-2 justify-end pt-4">
            <button onClick={handleClose} className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold text-[#1A2B49]">
              Hủy bỏ
            </button>
            <button onClick={user?._id?.$oid ? handleUpdate : handleOpenCreateModal} className="py-2 px-3 border border-[#F4F4F4] rounded text-base font-bold bg-[#404041] text-white">
              {user?._id?.$oid ? "Cập nhật" : "Tạo"}
            </button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  );
});

export { ModalUpdateUser };
