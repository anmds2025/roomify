/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { ServiceData, IServiceData } from '.';
import { toAbsoluteUrl } from '@/utils';
import { ModalAddService } from '@/partials/modals/service/ModalAddService';
import { useNavigate } from 'react-router';

const Service = () => {
  const { enqueueSnackbar } = useSnackbar();
  const storageFilterId = 'teams-filter';

  const columns = useMemo<ColumnDef<IServiceData>[]>(
    () => [
      {
        accessorFn: (row) => row.name,
        id: 'time',
        header: () => 'Tên dịch vụ',
        enableSorting: true,
        cell: (info) => {
          return info.row.original.name;
        },
        meta: {
          className: 'min-w-[120px]'
        }
      },
      {
        accessorFn: (row) => row.image,
        id: 'image',
        header: () => 'Hình ảnh',
        enableSorting: true,
        cell: (info) => {
          return (
            <div
              className="w-[170px] h-12 flex items-center justify-center overflow-hidden"
              style={{ background: '#f0f0f0' }} // Thêm màu nền nếu cần
            >
              <img
                src={toAbsoluteUrl(`media/avatars/${info.row.original.image}`)}
                className="h-full object-cover"
                alt=""
              />
            </div>
          );
        },
        meta: {
          className: 'min-w-[170px] max-w-[170px] max-h-12 ',
        }
      },
      {
        accessorFn: (row) => row.describe,
        id: 'describe',
        header: () => 'Mô tả',
        enableSorting: true,
        cell: (info) => {
          return <div className="min-w-[190px] max-h-[3rem] overflow-hidden text-ellipsis line-clamp-1">
            {info.row.original.describe}
          </div>
        },
        meta: {
          className: 'min-w-[477px]',
        }
      },
      {
        id: 'show',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => {
          const navigate = useNavigate();
      
          const handleClick = () => {
            const { image, name } = row.original; // Giả sử `row.original` có chứa `image` và `title`
            navigate("/detail-service", { state: { image, name } });
          };
      
          return (
            <button
              className="btn btn-sm btn-icon btn-clear btn-light"
              onClick={handleClick}
            >
              <KeenIcon icon="eye" />
            </button>
          );
        },
        meta: {
          className: 'w-[60px]',
        },
      }, 
      {
        id: 'delete',
        header: () => '',
        enableSorting: false,
        cell: ({
          row
        }) => <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => alert(`Clicked on delete for ${row.original.name}`)}>
                <KeenIcon icon="trash" />
              </button>,
        meta: {
          className: 'w-[60px]'
        }
      }
    ],
    []
  );

  // Memoize the team data
  const data: IServiceData[] = useMemo(() => ServiceData, []);

  // Initialize search term from localStorage if available
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem(storageFilterId) || '';
  });

  // Update localStorage whenever the search term changes
  useEffect(() => {
    localStorage.setItem(storageFilterId, searchTerm);
  }, [searchTerm]);

  // Filtered data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return data; // If no search term, return full data

    return data.filter(
      (team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.describe.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, data]);

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

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>('brelax');

  const [nameRoot, setNameRoot] = useState('');

  const handleOpenAdd = () => setAddModalOpen(true);
  const handleCloseAdd = () => {
    setAddModalOpen(false);
  };

  const handleSelect = (buttonName: string) => {
    setSelected(buttonName);
  };

  return (
    <div>
      <div className='flex mb-4'>
        <button
          onClick={() => handleSelect('brelax')}
          className={`py-2 px-3 text-base font-semibold min-w-[162px] ${
            selected === 'brelax' ? 'bg-[#404041] text-white' : 'bg-white text-[#404041]'
          }`}
        >
          Brelax
        </button>
        <button
          onClick={() => handleSelect('bremiere')}
          className={`py-2 px-3 text-base font-semibold min-w-[162px] ${
            selected === 'bremiere' ? 'bg-[#404041] text-white' : 'bg-white text-[#404041]'
          }`}
        >
          Bremiere
        </button>
      </div>
      <div className="card card-grid h-full min-w-full">
        {/* <ModalAddService open={addModalOpen} onClose={handleCloseAdd} /> */}
        <div className="card-header">
          <h3 className="card-title">Danh sách dịch vụ</h3>
          <div className='flex gap-2'>
            <div className="input input-sm w-[334px]">
              <KeenIcon icon="magnifier" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
              />
            </div>
            {/* <a onClick={handleOpenAdd} href="#" className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg">
              <KeenIcon icon="add-notepad" />
              Thêm mới
            </a> */}
          </div>
        </div>

        <div className="card-body">
          <DataGrid 
            cellsBorder={true}
            columns={columns} 
            data={filteredData} 
            rowSelect={true} 
            onRowsSelectChange={handleRowsSelectChange}
            initialSorting={[{ id: 'team', desc: false }]} 
            saveState={true} 
            saveStateId='teams-grid'
            onPaginationChange={handlePaginationChange}
          />
        </div>
      </div>
    </div>
  );
};

export { Service };