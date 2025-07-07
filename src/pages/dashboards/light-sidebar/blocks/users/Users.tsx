/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { IRoleData, IUserData } from '.';
import { useUser } from '@/hooks/useUser';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { ModalConfirmActive } from '@/partials/modals/confirm/ModalConfirmActive';
import { useAuthContext } from '@/auth';
import { ModalUpdateUser } from '@/partials/modals/user/ModalUpdateUser';


const Users = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getUsers, deleteUser } = useUser();
  const [data, setData] = useState<IUserData[]>([]);
  const emptyUser: IUserData = {} as IUserData
  const [userUpdate, setUserUpdate] = useState<IUserData>(emptyUser);
  const [userId, setUserId] = useState<string>('');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openActiveModal, setOpenActiveModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const { currentUser } = useAuthContext();

  useEffect(() => {
      fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
      try {
        const usersResponse = await getUsers();
        const filteredUsers = (usersResponse || []).filter(
          (user) => user.email !== currentUser?.email && user.level !== 'Root'
        );
        setData(filteredUsers)
        setFilteredData(filteredUsers)
      } catch (error) {
        enqueueSnackbar('Failed to fetch users', { variant: 'error' });
      }
    };
  
  const handleOpenActiveModal = (user: IUserData, status: string) => {
    setUserUpdate(user);
    setStatusUpdate(status)
    setOpenActiveModal(true);
  };

  const handleCloseActiveModal = () => {
    setOpenActiveModal(false);
    setUserUpdate(emptyUser)
    setStatusUpdate('')
  };


  const handleOpenDeleteModal = (user: IUserData) => {
    setUserId(user._id.$oid);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser(userId); 
      handleCloseDeleteModal()
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  };

  const handleOpenEditModal = (user: IUserData) => {
    setUserId(user._id?.$oid || "");
    setUserUpdate(user)
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setUserId("")
    setUserUpdate(emptyUser)
    setOpenEditModal(false);
  };

  const columns = useMemo<ColumnDef<IUserData>[]>(
    () => [
      {
        id: 'id',
        header: () => 'STT',
        cell: (info) => {
          return <div>{info.row.index + 1}</div>;
        },
        meta: {
          className: 'min-w-[60px] text-center',
        },
      },
      {
        accessorFn: (row) => row.email,
        id: 'email',
        header: () => 'Email',
        enableSorting: true,
        cell: (info) => {
          return (
            <div className='flex gap-2'>
              <div className="flex flex-col gap-2">
                <span className="text-2sm text-gray-700 font-normal leading-3">
                  {info.row.original.email}
                </span>
              </div>
            </div>
            
          );
        },
        meta: {
          className: 'min-w-[280px]'
        }
      },
      {
        accessorFn: (row) => row.phone,
        id: 'phone',
        header: () => 'Số điện thoại',
        enableSorting: true,
        cell: (info) => {
          return (
            <div className='flex gap-2'>
              <div className="flex flex-col gap-2">
                <span className="text-2sm text-gray-700 font-normal leading-3">
                  {info.row.original.phone}
                </span>
              </div>
            </div>
            
          );
        },
        meta: {
          className: 'min-w-[280px]'
        }
      },
      {
        accessorFn: (row) => row.level,
        id: 'level',
        header: () => 'Cấp độ tài khoản',
        enableSorting: true,
        cell: (info) => {
          const level = info.row.original.level;
          let className = 'capitalize px-2 py-1 rounded-2xl font-[400] text-sm inline-block w-[90px] text-center';

          if (level === 'Basic') {
            className += ' bg-[#B87333] text-white';
          } else if (level === 'Pro') {
            className += ' bg-white border border-[#C0C0C0] color-[#1A2B49]';
          } else if (level === 'Premium') {
            className += ' bg-[#FFD700] text-white';
          }else if (level === 'Enterprise') {
            className += ' bg-[#63DCCE] border border-[#C0C0C0] color-[#1A2B49]';
          } else {
            className += ' bg-gray-300 text-black';
          }

          return <div className={className}>{level}</div>;
        },
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({
          row
        }) => <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={()=>handleOpenEditModal(row.original)}>
                <KeenIcon icon="notepad-edit" />
              </button>,
        meta: {
          className: 'w-[60px]'
        }
      },
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({
          row
        }) => <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => handleOpenDeleteModal(row.original)}>
                <KeenIcon icon="trash" />
              </button>,
        meta: {
          className: 'w-[60px]'
        }
      }
    ],
    []
  );

  // Initialize search term from localStorage if available
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('Tất cả');

  const [filteredData, setFilteredData] = useState<IUserData[]>(data);

  // Filtered data based on search term
  useEffect(() => {
    const filtered = data.filter((user) => {
      const matchesSearch =
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter === 'Tất cả' || user.level === levelFilter;

      return matchesSearch && matchesLevel;
    });

    setFilteredData(filtered);
  }, [searchTerm, levelFilter, data]);

  // Handler for sorting changes
  const handleRowsSelectChange = (selectedRowIds: TDataGridSelectedRowIds) => {
    enqueueSnackbar(
      selectedRowIds.size > 0 ? `${selectedRowIds.size} rows selected` : `No rows are selected`,
      { 
        variant: 'solid', 
        state: 'dark'
      }
    );
  };

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });

  const handlePaginationChange = (newPagination: PaginationState) => {
    if (newPagination.pageSize > filteredData.length) {
      setPagination({
        ...newPagination,
        pageSize: filteredData.length, 
      });
    } else {
      setPagination(newPagination); 
    }
  };

  return (
    <div className="card card-grid h-full min-w-full">
      <ModalConfirmDelete
        open={openDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteUser}
        title="Xóa"
        message="Bạn có muốn xoá tài khoản này. Khi xác nhận thì sẽ không thể quay lại"
      />
      <ModalUpdateUser open={openEditModal} onClose={handleCloseEditModal} user={userUpdate} fetchUsers={fetchUsers}/>
      <div className="card-header flex justify-end">
        <div className='flex gap-4'>
          <div className="input input-sm max-w-48">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
            />
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="select select-sm min-w-40"
          >
            <option value="Tất cả">Tất cả</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>
          <a onClick={() => handleOpenEditModal(emptyUser)} style={{minWidth: "90px"}} href="#" className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg">
            <KeenIcon icon="add-notepad" />
            Thêm mới
          </a>
        </div>
      </div>

      <div className="card-body">
        <DataGrid 
          cellsBorder={true}
          columns={columns} 
          data={filteredData} 
          rowSelect={false} 
          onRowsSelectChange={handleRowsSelectChange}
          initialSorting={[{ id: 'team', desc: false }]} 
          saveState={true} 
          saveStateId='teams-grid'
          onPaginationChange={handlePaginationChange}
        />
      </div>
    </div>
  );
};

export { Users };