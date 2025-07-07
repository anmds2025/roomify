/* eslint-disable prettier/prettier */
import React, { useEffect, useMemo, useState } from 'react';
import { useSnackbar } from 'notistack';
import { ColumnDef, PaginationState } from '@tanstack/react-table';
import { DataGrid, KeenIcon, TDataGridSelectedRowIds } from '@/components';
import { DetailServiceData, IDetailService } from '.';
import { toAbsoluteUrl } from '@/utils';
import { ModalAddService } from '@/partials/modals/service/ModalAddService';
import { useLocation } from 'react-router';

interface DetailServiceProps {
    image?: string;
    name?: string;
  }
  
const DetailService: React.FC<DetailServiceProps> = () => {
    const location = useLocation();
    const [serviceData, setServiceData] = useState<DetailServiceProps>(location.state || {});

  const { image, name } = serviceData;  // Sử dụng tên khác cho biến
    const { enqueueSnackbar } = useSnackbar();
    const storageFilterId = 'teams-filter';

    const columns = useMemo<ColumnDef<IDetailService>[]>(
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
            accessorFn: (row) => row.treatment,
            id: 'treatment',
            header: () => 'Liệu trình',
            enableSorting: true,
            cell: (info) => {
            return info.row.original.treatment;
            },
            meta: {
                className: 'min-w-[120px]'
            }
        },
        {
            accessorFn: (row) => row.price,
            id: 'price',
            header: () => 'Giá tiền',
            enableSorting: true,
            cell: (info) => {
                return info.row.original.price;
            },
            meta: {
                className: 'min-w-[120px]'
            }
        },
        {
            accessorFn: (row) => row.describe,
            id: 'describe',
            header: () => 'Mô tả',
            enableSorting: true,
            cell: (info) => {
              return <div className="min-w-[190px] max-h-[3rem] overflow-hidden text-ellipsis line-clamp-2">
                {info.row.original.describe}
              </div>
            },
            meta: {
              className: 'min-w-[477px]',
            }
          },
        {
            id: 'edit',
            header: () => '',
            enableSorting: false,
            cell: ({
            row
            }) => <button className="btn btn-sm btn-icon btn-clear btn-light" onClick={() => alert(`Clicked on show for ${row.original.name}`)}>
                    <KeenIcon icon="notepad-edit" />
                </button>,
            meta: {
            className: 'w-[60px]'
            }
        }, {
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
    const data: IDetailService[] = useMemo(() => DetailServiceData, []);

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
    <div className='container-fixed relative'>
        <div className='flex w-full justify-end gap-1'>
            <div className='cursor-pointer font-base text-black'>Edit</div> /
            <div className='cursor-pointer font-base text-black'>Save</div>
        </div>
        <div className='w-full flex justify-center pb-24'>
            <div className='w-[278px] h-[150px] rounded-lg overflow-hidden'>
                <img
                    src={toAbsoluteUrl(`media/avatars/${image}`)}
                    className="h-full object-cover w-full"
                    alt=""
                />
            </div>  
        </div>
        <div className="card card-grid h-full min-w-full">
            <ModalAddService open={addModalOpen} onClose={handleCloseAdd} />
            <div className="card-header">
            <h3 className="card-title">{name}</h3>
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
                <a onClick={handleOpenAdd} href="#" className="btn btn-sm btn-primary badge badge-outline badge-primary gap-1 items-center rounded-lg">
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

export { DetailService };