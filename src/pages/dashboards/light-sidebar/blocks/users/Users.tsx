/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { IUserData } from '.';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { ModalConfirmActive } from '@/partials/modals/confirm/ModalConfirmActive';
import { ModalUpdateUser } from '@/partials/modals/user/ModalUpdateUser';
import { useUserManagement } from '@/hooks/useUserManagement';

// Component cho search input
const SearchInput = React.memo(({ value, onChange, placeholder }: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="input input-sm max-w-48">
    <KeenIcon icon="magnifier" />
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
));

// Component cho level filter
const LevelFilter = React.memo(({ value, onChange }: {
  value: string;
  onChange: (value: string) => void;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="select select-sm min-w-40"
  >
    <option value="Tất cả">Tất cả</option>
    <option value="Basic">Basic</option>
    <option value="Pro">Pro</option>
    <option value="Premium">Premium</option>
    <option value="Enterprise">Enterprise</option>
  </select>
));

// Component cho action buttons
const ActionButtons = React.memo(({ onAddNew, onRefresh, isLoading }: { 
  onAddNew: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) => (
  <div className="flex gap-2">
    <button 
      onClick={onRefresh}
      disabled={isLoading}
      className="btn btn-sm btn-light gap-1 items-center rounded-lg"
      style={{minWidth: "80px"}}
    >
      <KeenIcon icon="refresh" />
      {isLoading ? 'Đang tải...' : 'Làm mới'}
    </button>
    <button 
      onClick={onAddNew} 
      className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg"
      style={{minWidth: "90px"}}
    >
      <KeenIcon icon="add-notepad" />
      Thêm mới
    </button>
  </div>
));

// Component cho level badge
const LevelBadge = React.memo(({ level }: { level: string }) => {
  const getLevelStyles = (level: string) => {
    const baseClass = 'capitalize px-2 py-1 rounded-2xl font-[400] text-sm inline-block w-[90px] text-center';
    
    switch (level) {
      case 'Basic':
        return `${baseClass} bg-[#B87333] text-white`;
      case 'Pro':
        return `${baseClass} bg-white border border-[#C0C0C0] color-[#1A2B49]`;
      case 'Premium':
        return `${baseClass} bg-[#FFD700] text-white`;
      case 'Enterprise':
        return `${baseClass} bg-[#63DCCE] border border-[#C0C0C0] color-[#1A2B49]`;
      default:
        return `${baseClass} bg-gray-300 text-black`;
    }
  };

  return <div className={getLevelStyles(level)}>{level}</div>;
});

const Users = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    // State
    data,
    filteredData,
    searchTerm,
    levelFilter,
    pagination,
    isLoading,
    userUpdate,
    userId,
    statusUpdate,
    openDeleteModal,
    openActiveModal,
    openEditModal,
    emptyUser,
    
    // Actions
    fetchUsers,
    filterData,
    updateSearchTerm,
    updateLevelFilter,
    updatePagination,
    
    // Modal handlers
    openActiveModalHandler,
    closeActiveModalHandler,
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteUserHandler,
    openEditModalHandler,
    closeEditModalHandler,
    addNewUserHandler,
  } = useUserManagement();

  useEffect(() => {
    fetchUsers();
  }, []); // Chỉ chạy 1 lần khi component mount

  useEffect(() => {
    filterData();
  }, [searchTerm, levelFilter, data, filterData]); // Chạy khi searchTerm, levelFilter, data hoặc filterData thay đổi

  // Table columns với useMemo để tối ưu performance
  const columns = useMemo<ColumnDef<IUserData>[]>(
    () => [
      {
        accessorFn: (row) => row.fullname,
        id: 'fullname',
        header: () => 'Họ tên',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.email,
        id: 'email',
        header: () => 'Email',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.phone,
        id: 'phone',
        header: () => 'Số điện thoại',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        accessorFn: (row) => row.address,
        id: 'address',
        header: () => 'Địa chỉ',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.timeUpdate?.$date,
        id: 'timeUpdate',
        header: () => 'Ngày cập nhật',
        enableSorting: true,
        cell: (info) => {
          const date = info.getValue();
          return date ? moment(date).format('DD/MM/YYYY') : '';
        },
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        accessorFn: (row) => row.level,
        id: 'level',
        header: () => 'Cấp độ tài khoản',
        enableSorting: true,
        cell: (info) => <LevelBadge level={info.row.original.level} />,
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        id: 'edit',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button 
            className="btn btn-sm btn-icon btn-clear btn-light" 
            onClick={() => openEditModalHandler(row.original)}
          >
            <KeenIcon icon="notepad-edit" />
          </button>
        ),
        meta: {
          className: 'w-[60px]'
        }
      },
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button 
            className="btn btn-sm btn-icon btn-clear btn-light" 
            onClick={() => openDeleteModalHandler(row.original)}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: {
          className: 'w-[60px]'
        }
      }
    ],
    [openEditModalHandler, openDeleteModalHandler]
  );

  // Handlers
  const handleRowsSelectChange = useCallback((selectedRowIds: TDataGridSelectedRowIds) => {
    enqueueSnackbar(
      selectedRowIds.size > 0 ? `${selectedRowIds.size} rows selected` : `No rows are selected`,
      { 
        variant: 'solid', 
        state: 'dark'
      }
    );
  }, []);

  const handlePaginationChange = useCallback((newPagination: PaginationState) => {
    updatePagination(newPagination);
  }, []);

  return (
    <Fragment>
      <div className="card card-grid h-full min-w-full">
        {/* Header */}
        <div className="card-header flex justify-end">
          <div className='flex gap-4'>
            <SearchInput
              value={searchTerm}
              onChange={updateSearchTerm}
              placeholder="Tìm kiếm"
            />
            <LevelFilter
              value={levelFilter}
              onChange={updateLevelFilter}
            />
            <ActionButtons 
              onAddNew={addNewUserHandler} 
              onRefresh={fetchUsers}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* DataGrid */}
        <div className="card-body">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-gray-500 mb-2">Không có dữ liệu người dùng</div>
                <div className="text-sm text-gray-400">
                  {searchTerm || levelFilter !== 'Tất cả' ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy thêm người dùng mới'}
                </div>
              </div>
            </div>
          ) : (
            <DataGrid
              columns={columns}
              data={filteredData}
              rowSelect={true}
              paginationSize={20}
              paginationSizes={[5, 10, 20, 50, 100]}
              initialSorting={[{ id: 'fullname', desc: false }]}
              saveState={true}
              saveStateId="Users-grid"
              onRowsSelectChange={handleRowsSelectChange}
              onPaginationChange={handlePaginationChange}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ModalConfirmDelete
        open={openDeleteModal}
        onClose={closeDeleteModalHandler}
        onConfirm={deleteUserHandler}
        title="Xóa"
        message="Bạn có muốn xoá tài khoản này. Khi xác nhận thì sẽ không thể quay lại"
      />
      
      <ModalUpdateUser 
        open={openEditModal} 
        onClose={closeEditModalHandler} 
        user={userUpdate} 
        fetchUsers={fetchUsers}
      />
    </Fragment>
  );
};

export { Users };