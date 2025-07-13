import { useAuthContext, UserModel } from '@/auth';
import { KeenIcon } from '@/components';
import { ModalUpdatePassword } from '@/partials/modals/profile/ModalUpdatePassword';
import { ModalUpdateProfile } from '@/partials/modals/profile/ModalUpdateProfile';
import { toAbsoluteUrl } from '@/utils/Assets';
import { Fragment, useState } from 'react';

const PersonalInfo = () => {
  const { currentUser } = useAuthContext();

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openEditPasswordModal, setOpenEditPasswordModal] = useState(false);
  const [selectUser, setSelectUser] = useState<UserModel>();

  const handleOpenEditPasswordModal = () => {
    setOpenEditPasswordModal(true);
  };

  const handleCloseEditPasswordModal = () => {
    setOpenEditPasswordModal(false);
  };

  const emptyUser: UserModel = {} as UserModel;

  const handleOpenEditModal = () => {
    setSelectUser(currentUser);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setOpenEditModal(false);
  };

  const avatarDefault = toAbsoluteUrl(`media/avatars/blank.png`);

  return (
    <Fragment>
      <div className="card min-w-full">
        <div className="card-header w-full justify-between">
          <h3 className="card-title">Thông tin cá nhân</h3>
          <button onClick={handleOpenEditModal} className="btn btn-sm btn-primary flex items-center gap-2">
            <KeenIcon icon="pencil" />
            <span>Chỉnh sửa</span>
          </button>
        </div>
        <div className="card-body">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatarDefault}
                  alt="avatar"
                  className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {currentUser?.fullname || 'Chưa cập nhật'}
                  </h4>
                  <p className="text-sm text-gray-600">{currentUser?.level || 'Người dùng'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <KeenIcon icon="profile-circle" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Họ tên</p>
                    <p className="text-sm text-gray-800">{currentUser?.fullname || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <KeenIcon icon="phone" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                    <p className="text-sm text-gray-800">{currentUser?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <KeenIcon icon="message-text-2" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm text-gray-800">{currentUser?.email || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin bổ sung */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <KeenIcon icon="geolocation-home" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Địa chỉ</p>
                    <p className="text-sm text-gray-800">{currentUser?.address || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <KeenIcon icon="document" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Số CCCD</p>
                    <p className="text-sm text-gray-800">{currentUser?.cccd_code || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <KeenIcon icon="geolocation-home" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Địa chỉ CCCD</p>
                    <p className="text-sm text-gray-800">{currentUser?.cccd_address || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <KeenIcon icon="calendar" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ngày cấp CCCD</p>
                    <p className="text-sm text-gray-800">{currentUser?.cccd_day || 'Chưa cập nhật'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <KeenIcon icon="shield-tick" className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Mật khẩu</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-800">••••••••</span>
                      <button 
                        onClick={handleOpenEditPasswordModal} 
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Đổi mật khẩu
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalUpdateProfile 
        open={openEditModal} 
        onClose={handleCloseEditModal} 
        user={currentUser || emptyUser}
      />
      <ModalUpdatePassword 
        open={openEditPasswordModal} 
        onClose={handleCloseEditPasswordModal}
      />
    </Fragment>
  );
};

export { PersonalInfo };
