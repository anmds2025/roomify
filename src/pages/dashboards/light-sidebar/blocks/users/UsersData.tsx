export interface IDataResponseUser {
  objects : IUserData[]
}


interface IUserData {
  _id: { $oid: string };
  phone: string;
  email: string;
  fullname: string;
  address: string;
  nameLogin: string;
  level: string;
  timeUpdate: { $date: number }; 
  cccd_code: string;
  cccd_address: string;
  cccd_day: string; 
  isDeleted: boolean;
  token: string;
}

interface IRoleData {
  id: string;
  name: string;
}

interface IUserRoleData {
  id: string;
  user_id: string;
  roleuser_id: string;
}

interface ModalUpdateUserProps {
  open: boolean;
  onClose: () => void;
  user: IUserData;  
  fetchUsers: () => void; 
}

interface ModalUpdatePasswordProps {
  open: boolean;
  onClose: () => void;
  user_id: string;  
}

interface IChangePasswordData {
  token: string;
  id: string;
  old_password: string;
  new_password: string;
}


export { type IUserData , type IUserRoleData, type IRoleData, type ModalUpdateUserProps, type ModalUpdatePasswordProps, type IChangePasswordData };
