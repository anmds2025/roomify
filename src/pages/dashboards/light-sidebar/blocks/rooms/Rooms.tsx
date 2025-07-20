/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { IRoomData } from './RoomsData';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { ModalUpdateRoom } from '@/partials/modals/room/ModalUpdateRoom';
import { useRoomManagement } from '@/hooks/useRoomManagement';

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

// Component cho status badge
const StatusBadge = React.memo(({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseClass = 'capitalize px-2 py-1 rounded-2xl font-[400] text-sm inline-block w-[90px] text-center';
    
    switch (status) {
      case 'Đang trống':
        return `${baseClass} bg-green-100 text-green-800`;
      case 'Đang đăng':
        return `${baseClass} bg-blue-100 text-blue-800`;
      case 'Đã ẩn':
        return `${baseClass} bg-gray-100 text-gray-800`;
      case 'Đã cho thuê':
        return `${baseClass} bg-orange-100 text-orange-800`;
      default:
        return `${baseClass} bg-gray-300 text-black`;
    }
  };

  return <div className={getStatusStyles(status)}>{status}</div>;
});

const Rooms = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    roomUpdate,
    roomId,
    openDeleteModal,
    openEditModal,
    emptyRoom,
    
    // Actions
    fetchRooms,
    filterData,
    updateSearchTerm,
    updatePagination,
    
    // Modal handlers
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteRoomHandler,
    openEditModalHandler,
    closeEditModalHandler,
    addNewRoomHandler,
  } = useRoomManagement();

  useEffect(() => {
    fetchRooms();
  }, []); // Chỉ chạy 1 lần khi component mount

  useEffect(() => {
    filterData();
  }, [searchTerm, data]); // Chạy khi searchTerm hoặc data thay đổi

  // Table columns với useMemo để tối ưu performance
  const columns = useMemo<ColumnDef<IRoomData>[]>(
    () => [
      {
        accessorFn: (row) => row.room_name,
        id: 'room_name',
        header: () => 'Tên phòng',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        accessorFn: (row) => row.user_name,
        id: 'user_name',
        header: () => 'Chủ phòng',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        accessorFn: (row) => row.price,
        id: 'price',
        header: () => 'Giá thuê',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as number;
          return value ? `${value.toLocaleString()} VNĐ` : '-';
        },
        meta: {
          className: 'min-w-[120px]',
        }
      },
      {
        accessorFn: (row) => row.size,
        id: 'size',
        header: () => 'Diện tích',
        enableSorting: true,
        cell: (info) => {
          const value = info.getValue() as number;
          return value ? `${value} m²` : '-';
        },
        meta: {
          className: 'min-w-[100px]',
        }
      },
      {
        accessorFn: (row) => row.address,
        id: 'address',
        header: () => 'Địa chỉ',
        enableSorting: true,
        cell: (info) => info.getValue() || '-',
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.status,
        id: 'status',
        header: () => 'Trạng thái',
        enableSorting: true,
        cell: (info) => <StatusBadge status={info.row.original.status} />,
        meta: {
          className: 'min-w-[120px]',
        }
      },
      {
        accessorFn: (row) => row.timeUpdate?.$date,
        id: 'timeUpdate',
        header: () => 'Ngày cập nhật',
        enableSorting: true,
        cell: (info) => {
          const date = info.getValue();
          return date ? moment(date).format('DD/MM/YYYY') : '-';
        },
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
            <ActionButtons 
              onAddNew={addNewRoomHandler} 
              onRefresh={fetchRooms}
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
                <div className="text-gray-500 mb-2">Không có dữ liệu phòng</div>
                <div className="text-sm text-gray-400">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy thêm phòng mới'}
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
              initialSorting={[{ id: 'room_name', desc: false }]}
              saveState={true}
              saveStateId="Rooms-grid"
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
        onConfirm={deleteRoomHandler}
        title="Xóa"
        message="Bạn có muốn xoá phòng này. Khi xác nhận thì sẽ không thể quay lại"
      />
      
      <ModalUpdateRoom 
        open={openEditModal} 
        onClose={closeEditModalHandler} 
        room={roomUpdate} 
        fetchRooms={fetchRooms}
      />
    </Fragment>
  );
};

export { Rooms }; 