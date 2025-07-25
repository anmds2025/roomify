/* eslint-disable prettier/prettier */
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { DataGrid, KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils';

import { VisitorsData, IVisitorsData } from '.';

const Visitors = () => {
  const columns = useMemo<ColumnDef<IVisitorsData>[]>(
    () => [
      {
        accessorFn: (row) => row.user,
        id: 'user',
        header: () => <span className="text-gray-700 font-normal">User</span>,
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-2.5">
            <div className="shrink-0">
              <img
                src={toAbsoluteUrl(`media/avatars/${info.row.original.user.avatar}`)}
                className="size-7 rounded-full"
                alt=""
              />
            </div>
            <a className="text-sm font-font-medium text-gray-900 hover:text-primary-active" href="#">
              {info.row.original.user.name}
            </a>
          </div>
        ),
        meta: {
          className: 'min-w-[200px]'
        },
      },
      {
        accessorFn: (row) => row.browser,
        id: 'browser',
        header: () => <span className="text-gray-700 font-normal">Browser</span>,
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-1.5 text-gray-800 font-normal">
            <KeenIcon icon="chrome" />
            <span>{info.row.original.browser}</span>
          </div>
        ),
        meta: {
          className: 'min-w-[250px]',
        },
      },
      {
        accessorFn: (row) => row.ipAddress,
        id: 'ipAddress',
        header: () => <span className="text-gray-800 font-normal">IP Address</span>,
        enableSorting: true,
        cell: (info) => {
          return info.row.original.ipAddress;
        },
        meta: {
          className: 'w-[190px]',
        },
      },
      {
        accessorFn: (row) => row.location,
        id: 'location',
        header: () => <span className="text-gray-700 font-normal">Location</span>,
        enableSorting: true,
        cell: (info) => (
          <div className="flex items-center gap-1.5">
            <img
              src={toAbsoluteUrl(`media/flags/${info.row.original.location.flag}`)}
              className="h-4 rounded-full"
              alt=""
            />
            <span className="leading-none text-gray-700">{info.row.original.location.name}</span>
          </div>
        ),
        meta: {
          className: 'w-[190px]',
        },
      },
      {
        accessorFn: (row) => row.activity,
        id: 'activity',
        header: () => 'Activity',
        enableSorting: true,
        cell: (info: any) => info.row.original.activity,
        meta: {
          className: 'w-[150px]',
          cellClassName: 'text-gray-800 font-normal',
        },
      },
      {
        id: 'click',
        header: () => '',
        enableSorting: false,
        cell: ({ row }) => (
          <button 
            className="btn btn-icon btn-light btn-clear btn-sm" 
            onClick={() => alert(`Clicked on action button for row ${row.original.user.name}`)}
          >
            <KeenIcon icon="dots-vertical" />
          </button>
        ),
        meta: {
          className: 'w-[60px]',
        },
      },
    ],
    []
  );

  const data: IVisitorsData[] = useMemo(() => VisitorsData, []);

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header py-5 flex-wrap gap-2">
        <h3 className="card-title">Showing 10 of 49,053 users</h3>

        <div className="flex flex-wrap gap-2 lg:gap-5">
          <div className="flex">
            <label className="input input-sm">
              <KeenIcon icon="magnifier" />
              <input placeholder="Search users" type="text" value="" />
            </label>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <select className="select select-sm w-28">
              <option value="1">Active</option>
              <option value="2">Disabled</option>
              <option value="3">Pending</option>
            </select>

            <select className="select select-sm w-28">
              <option value="1">Latest</option>
              <option value="2">Older</option>
              <option value="3">Oldest</option>
            </select>

            <button className="btn btn-sm btn-outline btn-primary">
              <KeenIcon icon="setting-4" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="card-body">
        <DataGrid 
          columns={columns} 
          data={data} 
          rowSelect={true} 
          paginationSize={10}
          initialSorting={[{ id: 'current-sessions', desc: false }]} 
          saveState={true} 
          saveStateId='current-sessions-grid'
        />
      </div>
    </div>
  );
};

export {Visitors };
