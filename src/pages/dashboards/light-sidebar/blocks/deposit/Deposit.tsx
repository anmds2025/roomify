/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { ModalUpdateExpense } from '@/partials/modals/expense/ModalUpdateExpense';
import { IHomeData } from '../homes';
import { useHomeManagement } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOption } from '@/auth';
import { useDepositManagement } from '@/hooks/useDepositManagement';
import { IDepositData } from '@/types/deposit';
import { useDeposit } from '@/hooks/useDeposit';
import { ModalCreateDeposit } from '@/partials/modals/deposit/ModalCreateDeposit';

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
        cell: (info) => {
          return <div>{info.row.index + 1}</div>;
        },
        meta: {
          className: 'min-w-[60px] text-center',
        },
      },
      {
        accessorFn: (row) => row.home_name,
        id: 'home_name',
        header: () => 'Tòa nhà',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.room_name,
        id: 'room_name',
        header: () => 'Phòng',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.deposit,
        id: 'deposit',
        header: () => 'Số tiền cọc',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[150px]',
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
        id: 'edit',
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
            onClick={() => handleOpenDeleteModal(row.original._id?.$oid || '')}
          >
            <KeenIcon icon="trash" />
          </button>
        ),
        meta: {
          className: 'w-[60px]'
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
        <div className="card-header flex justify-end">
          <div className='flex gap-4'>
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