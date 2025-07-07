import { useAuthContext, UserModel } from '@/auth';
import {KeenIcon } from '@/components';

import { CrudAvatarUpload } from '@/partials/crud';
import { ModalUpdatePassword } from '@/partials/modals/profile/ModalUpdatePassword';
import { ModalUpdateProfile } from '@/partials/modals/profile/ModalUpdateProfile';
import { toAbsoluteUrl } from '@/utils/Assets';
import moment from 'moment';
import { useState } from 'react';

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
  const emptyUser: UserModel = {} as UserModel

  const handleOpenEditModal = () => {
    setSelectUser(currentUser || emptyUser)
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectUser({} as UserModel)
    setOpenEditModal(false);
  };
  const avatarDefault = toAbsoluteUrl(`/media/avatars/blank.png`);

  return (
    <>
    <ModalUpdateProfile open={openEditModal} onClose={handleCloseEditModal} user={currentUser || emptyUser}/>
    <ModalUpdatePassword open={openEditPasswordModal} onClose={handleCloseEditPasswordModal}/>
    <div className="card min-w-full">
      <div className="card-header w-full justify-between">
        <h3 className="card-title">Thông tin cá nhân</h3>
        <button onClick={handleOpenEditModal} className='btn border border-[#DBDFE9]'>Chỉnh sửa</button>
      </div>
      <div className="card-table scrollable-x-auto pb-3">
        <table className="table align-middle text-sm text-gray-500">
          <tbody>
            <tr>
              <td className="py-2 min-w-28 text-gray-600 font-normal">Photo</td>
              
              <td className="py-2 text-center">
                <div className="flex justify-start items-center gap-2">
                  <img
                    src={avatarDefault}
                    alt="avatar"
                    className="h-full object-cover rounded-full"
                    height={60}
                    width={60}
                  />
                  <p className='text-[#4B5675]'>150x150px JPEG, PNG</p>
                </div>
              </td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600 font-normal">Họ tên</td>
              <td className="py-2 text-gray-800 text-sm font-semibold">{currentUser?.fullname}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600 font-normal">Địa chỉ</td>
              <td className="py-2 text-[#99A1B7] font-normal text-sm">{currentUser?.address}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600 font-normal">Số điện thoại</td>
              <td className="py-2 text-[#99A1B7] font-normal text-sm">{currentUser?.phone}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600 font-normal">Email</td>
              <td className="py-2 text-[#99A1B7] font-normal text-sm">{currentUser?.email}</td>
            </tr>
            <tr>
              <td className="py-2 text-gray-600 font-normal">Password</td>
              <td className="py-2 text-gray-800 font-normal text-sm">************
                <button onClick={handleOpenEditPasswordModal} style={{color: '#056EE9'}} className='badge badge-outline badge-primary ml-2'>Change</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export { PersonalInfo };
