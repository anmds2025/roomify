/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useCallback, Fragment, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import moment from 'moment';
import { ModalConfirmDelete } from '@/partials/modals/confirm/ModalConfirmDelete';
import { IHomeData } from '../homes';
import { useHomeManagement } from '@/hooks';
import { IOption } from '@/auth';
import { useInteriorManagement } from '@/hooks/useInteriorManagement';
import { InteriorData } from '@/api/interior';
import { ModalUpdateInterior } from '@/partials/modals/interior/ModalUpdateInterior';

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


const Interior = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [homes, setHomes] = useState<IHomeData[]>([]);
  const [homeOptions, setHomeOptions] = useState<IOption[]>([]);
  const {
    // State
    data,
    filteredData,
    searchTerm,
    isLoading,
    interiorUpdate,
    openDeleteModal,
    openEditModal,
    
    // Actions
    fetchInteriors,
    filterData,
    updateSearchTerm,
    updatePagination,
    
    // Modal handlers
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteInteriorHandler,
    openEditModalHandler,
    closeEditModalHandler,
    addNewInteriorHandler,
  } = useInteriorManagement();

  // Table columns với useMemo để tối ưu performance
  const columns = useMemo<ColumnDef<InteriorData>[]>(
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
        accessorFn: (row) => row.name,
        id: 'name',
        header: () => 'Tên nội thất',
        enableSorting: true,
        cell: (info) => info.getValue(),
        meta: {
          className: 'min-w-[200px]',
        }
      },
      {
        accessorFn: (row) => row.price,
        id: 'price',
        header: () => 'Giá',
        enableSorting: true,
        cell: (info) => info.getValue() + 'VND',
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
              onAddNew={addNewInteriorHandler} 
              onRefresh={fetchInteriors}
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
                <div className="text-gray-500 mb-2">Không có dữ liệu nội thất</div>
                <div className="text-sm text-gray-400">
                  {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy thêm nội thất'}
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
        onConfirm={deleteInteriorHandler}
        title="Xóa nội thất"
        message="Bạn có muốn nội thất này không. Khi xác nhận thì sẽ không thể quay lại"
      />
      
      <ModalUpdateInterior
        open={openEditModal} 
        onClose={closeEditModalHandler} 
        interior={interiorUpdate} 
        fetchInterior={fetchInteriors}
      />
    </Fragment>
  );
};

export { Interior };