import React from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KeenIcon } from '@/components';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';

interface RoomActionDropdownProps {
  room: IRoomData;
  onViewTenants: (room: IRoomData) => void;
  onViewContracts: (room: IRoomData) => void;
}

export const RoomActionDropdown: React.FC<RoomActionDropdownProps> = ({
  room,
  onViewTenants,
  onViewContracts,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className="btn btn-sm btn-icon btn-light btn-clear"
          aria-label="Thao tác"
        >
          <KeenIcon icon="dots-vertical" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => onViewTenants(room)}
          className="flex items-center gap-2 cursor-pointer bg-white"
        >
          <KeenIcon icon="profile-circle" className="text-base" />
          <span>Người thuê</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onViewContracts(room)}
          className="flex items-center gap-2 cursor-pointer bg-white"
        >
          <KeenIcon icon="document" className="text-base" />
          <span>Hợp đồng</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 