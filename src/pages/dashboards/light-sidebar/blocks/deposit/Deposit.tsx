/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { useDepositManagement } from '@/hooks/useDepositManagement';
import { IDepositData } from '@/types/deposit';
import { useDeposit } from '@/hooks/useDeposit';
import { ModalCreateDeposit } from '@/partials/modals/deposit/ModalCreateDeposit';

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
      className="btn btn-sm btn-primary badge badge-outline badge-light gap-1 items-center rounded-lg w-full sm:w-auto"
      style={{minWidth: "80px"}}
    >
      <KeenIcon icon="refresh" />
      {isLoading ? 'Đang tải...' : 'Làm mới'}
    </button>
    <button 
      onClick={onAddNew} 
      className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg w-full sm:w-auto"
      style={{minWidth: "90px"}}
    >
      <KeenIcon icon="add-notepad" />
      Thêm mới
    </button>
  </div>
));

const Deposit = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    data,
    filteredData,
    searchTerm,
    isLoading,
    fetchDeposits,
    updatePagination,
  } = useDepositManagement();
  const { removeDeposit } = useDeposit();
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDepositDelete, setSelectedDepositDelete] = useState<string>('');

  useEffect(() => {
    fetchDeposits()
  }, []);
  
  // Table columns với useMemo để tối ưu performance
  const columns = useMemo<ColumnDef<IDepositData>[]>(
  () => [
    {
      id: 'id',
      header: () => 'STT',
      cell: (info) => <div>{info.row.index + 1}</div>,
      meta: {
        className: 'min-w-[50px] text-center',
        cellClassName: 'min-w-[50px] text-center'
      }
    },
    {
      accessorFn: (row) => row.home_name,
      id: 'home_name',
      header: () => 'Tòa nhà',
      enableSorting: true,
      cell: (info) => (
        <span className="block truncate max-w-[160px] sm:max-w-none">
          {info.getValue() as string}
        </span>
      ),
      meta: {
        className: 'min-w-[160px]',
        cellClassName: 'min-w-[160px]'
      }
    },
    {
      accessorFn: (row) => row.room_name,
      id: 'room_name',
      header: () => 'Phòng',
      enableSorting: true,
      cell: (info) => info.getValue(),
      meta: {
        className: 'hidden sm:table-cell min-w-[120px]',
        cellClassName: 'hidden sm:table-cell min-w-[120px]'
      }
    },
    {
      accessorFn: (row) => row.deposit,
      id: 'deposit',
      header: () => 'Tiền cọc',
      enableSorting: true,
      cell: (info) => `${info.getValue()} VNĐ`,
      meta: {
        className: 'hidden md:table-cell min-w-[120px]',
        cellClassName: 'hidden md:table-cell min-w-[120px]'
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
        className: 'hidden lg:table-cell min-w-[140px]',
        cellClassName: 'hidden lg:table-cell min-w-[140px]'
      }
    },
    {
      id: 'view',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-icon btn-clear btn-light"
          onClick={() => {
            window.open(
              `${import.meta.env.VITE_APP_SERVER_URL}${row.original.deposit_path}`,
              "_blank"
            );
          }}
        >
          <KeenIcon icon="eye" />
        </button>
      ),
      meta: {
        className: 'w-[50px]',
        cellClassName: 'w-[50px]'
      }
    },
    {
      id: 'delete',
      header: () => '',
      enableSorting: false,
      cell: ({ row }) => (
        <button
          className="btn btn-sm btn-icon btn-clear btn-light"
          onClick={() =>
            handleOpenDeleteModal(row.original._id?.$oid || '')
          }
        >
          <KeenIcon icon="trash" />
        </button>
      ),
      meta: {
        className: 'w-[50px]',
        cellClassName: 'w-[50px]'
      }
    }
  ],
  []
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

  const handleOpenEditModal = () => {
    setOpenUpdateModal(true);
  };

  const handleCloseEditModal = () => {
    setSelectedDepositDelete('');
    setOpenUpdateModal(false);
  };

  const handleOpenDeleteModal = (id: string) => {
    setSelectedDepositDelete(id);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleDeleteDeposit = async () => {
    try {
      await removeDeposit(selectedDepositDelete);
      handleCloseDeleteModal();
      fetchDeposits();
    } catch (error) {
      console.error('Failed to delete deposit', error);
    }
  };

  return (
    <Fragment>
      <div className="card card-grid h-full min-w-full">
        {/* DataGrid */}
        <div className="card-header flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center">
            <ActionButtons
              onAddNew={handleOpenEditModal}
              onRefresh={fetchDeposits}
              isLoading={isLoading}
            />
          </div>
        </div>

        <div className="card-body">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-gray-500 mb-2">Không có dữ liệu giấy cọc</div>
                <div className="text-sm text-gray-400">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy thêm giấy cọc'}
                </div>
              </div>
            </div>
          ) : (
            <DataGrid
              columns={columns}
              data={filteredData}
              rowSelect={false}
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
        onClose={handleCloseDeleteModal}
        onConfirm={handleDeleteDeposit}
        title="Xóa giấy cọc"
        message="Bạn có muốn giấy cọc này không. Khi xác nhận thì sẽ không thể quay lại"
      />
      
      <ModalCreateDeposit
        open={openUpdateModal} 
        onClose={handleCloseEditModal} 
        fetchDeposits={fetchDeposits}
      />
    </Fragment>
  );
};

export { Deposit };