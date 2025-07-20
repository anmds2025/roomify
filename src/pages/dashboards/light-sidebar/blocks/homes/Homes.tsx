/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { IHomeData } from './HomesData';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { ModalUpdateHome } from '@/partials/modals/home/ModalUpdateHome';
import { useHomeManagement } from '@/hooks/useHomeManagement';

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
const ActionButtons = React.memo(({ onAddNew }: { onAddNew: () => void }) => (
  <button 
    onClick={onAddNew} 
    className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg"
    style={{minWidth: "90px"}}
  >
    <KeenIcon icon="add-notepad" />
    Thêm mới
  </button>
));

const Homes = () => {
  const { enqueueSnackbar } = useSnackbar();
  const {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    homeUpdate,
    homeId,
    openDeleteModal,
    openEditModal,
    emptyHome,
    
    // Actions
    fetchHomes,
    filterData,
    updateSearchTerm,
    updatePagination,
    
    // Modal handlers
    // openDeleteModalHandler,
    // closeDeleteModalHandler,
    // deleteHomeHandler,
    openEditModalHandler,
    closeEditModalHandler,
    addNewHomeHandler,
  } = useHomeManagement();

  useEffect(() => {
    fetchHomes();
  }, []); // Chỉ chạy 1 lần khi component mount

  useEffect(() => {
    filterData();
  }, [searchTerm, data, filterData]); // Chạy khi searchTerm, data hoặc filterData thay đổi

  // Table columns với useMemo để tối ưu performance
  const columns = useMemo<ColumnDef<IHomeData>[]>(
    () => [
      {
        accessorFn: (row) => row.home_name,
        id: 'home_name',
        header: () => 'Tên tòa nhà',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.user_name,
        id: 'user_name',
        header: () => 'Chủ tòa nhà',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[150px]',
        }
      },
      {
        accessorFn: (row) => row.user_phone,
        id: 'user_phone',
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
        cell: (info) => info.getValue() || '-',
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.electricity_price,
        id: 'electricity_price',
        header: () => 'Giá điện',
        enableSorting: true,
        cell: (info) => info.getValue() ? `${info.getValue()} VNĐ/kWh` : '-',
        meta: {
          className: 'min-w-[120px]',
        }
      },
      {
        accessorFn: (row) => row.water_price,
        id: 'water_price',
        header: () => 'Giá nước',
        enableSorting: true,
        cell: (info) => info.getValue() ? `${info.getValue()} VNĐ/m³` : '-',
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
      // Tạm thời ẩn chức năng delete vì backend chưa có endpoint
      // {
      //   id: 'delete',
      //   header: () => '',
      //   enableSorting: false,
      //   cell: ({ row }) => (
      //     <button 
      //       className="btn btn-sm btn-icon btn-clear btn-light" 
      //       onClick={() => openDeleteModalHandler(row.original)}
      //     >
      //       <KeenIcon icon="trash" />
      //     </button>
      //   ),
      //   meta: {
      //     className: 'w-[60px]'
      //   }
      // }
    ],
    [openEditModalHandler]
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
            <ActionButtons onAddNew={addNewHomeHandler} />
          </div>
        </div>

        {/* DataGrid */}
        <div className="card-body">
          <DataGrid
            columns={columns}
            data={filteredData}
            rowSelect={true}
            paginationSize={20}
            paginationSizes={[5, 10, 20, 50, 100]}
            initialSorting={[{ id: 'home_name', desc: false }]}
            saveState={true}
            saveStateId="Homes-grid"
            onRowsSelectChange={handleRowsSelectChange}
            onPaginationChange={handlePaginationChange}
          />
        </div>
      </div>

      {/* Modals */}
      {/* Tạm thời ẩn modal delete vì backend chưa có endpoint */}
      {/* <ModalConfirmDelete
        open={openDeleteModal}
        onClose={closeDeleteModalHandler}
        onConfirm={deleteHomeHandler}
        title="Xóa"
        message="Bạn có muốn xoá tòa nhà này. Khi xác nhận thì sẽ không thể quay lại"
      /> */}
      
      <ModalUpdateHome 
        open={openEditModal} 
        onClose={closeEditModalHandler} 
        home={homeUpdate} 
        fetchHomes={fetchHomes}
      />
    </Fragment>
  );
};

export { Homes }; 