import { useCallback, useState, useMemo } from 'react';
import { IRoomData } from '@/pages/dashboards/light-sidebar/blocks/rooms/RoomsData';
import { useRoom } from './useRoom';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes';

export const useRoomManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getRooms, updateRoom, deleteRoom, getRoomsByHome } = useRoom();
  const { currentUser } = useAuthContext();
  
  // State management
  const [data, setData] = useState<IRoomData[]>([]);
  const [filteredData, setFilteredData] = useState<IRoomData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [roomUpdate, setRoomUpdate] = useState<IRoomData>({} as IRoomData);
  const [homeSelect, setHomeSelect] = useState<IHomeData>({} as IHomeData);
  const [roomId, setRoomId] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openCreateContractModal, setOpenCreateContractModal] = useState(false);
  
  // Tạo emptyRoom một lần duy nhất để tránh re-render
  const emptyRoom = useMemo(() => ({} as IRoomData), []);
  const emptyHome = useMemo(() => ({} as IHomeData), []);

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const roomsResponse = await getRooms();
      const data = roomsResponse || [];

      setData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      enqueueSnackbar('Failed to fetch rooms', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getRooms, enqueueSnackbar]);

  const fetchRoomsByHome = useCallback(async (home_pk: string) => {
    setIsLoading(true);
    try {
      const roomsResponse = await getRoomsByHome(home_pk);
      const data = roomsResponse || [];

      setData(data);
      setFilteredData(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      enqueueSnackbar('Failed to fetch rooms', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getRoomsByHome, enqueueSnackbar]);

  // Filter data
  const filterData = useCallback(() => {
    const filtered = data.filter((room) => {
      const matchesSearch =
        room.room_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.user_name?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    setFilteredData(filtered);
  }, [searchTerm, data]);
  

  // Update search term
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination);
  }, []);

  // Modal handlers
  const openDeleteModalHandler = useCallback((room: IRoomData) => {
    setRoomId(room?._id?.$oid || '');
    setOpenDeleteModal(true);
  }, []);

  const closeDeleteModalHandler = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  const deleteRoomHandler = useCallback(async () => {
    try {
      await deleteRoom(roomId);
      closeDeleteModalHandler();
      fetchRooms();
      enqueueSnackbar('Xóa phòng thành công', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Có lỗi khi xóa phòng', { variant: 'error' });
    }
  }, [roomId, closeDeleteModalHandler, fetchRooms, enqueueSnackbar, deleteRoom]);

  const openEditModalHandler = useCallback((room: IRoomData) => {
    setRoomId(room._id?.$oid || "");
    setRoomUpdate(room);
    setOpenEditModal(true);
  }, []);

  const closeEditModalHandler = useCallback(() => {
    setRoomId("");
    setRoomUpdate(emptyRoom);
    setOpenEditModal(false);
  }, [emptyRoom]);

  const openCreateContractModalHandler = useCallback((room: IRoomData, home: IHomeData) => {
    setRoomId(room._id?.$oid || "");
    setRoomUpdate(room);
    setHomeSelect(home);
    setOpenCreateContractModal(true);
  }, []);

  const closeCreateContractModalHandler = useCallback(() => {
    setRoomId("");
    setRoomUpdate(emptyRoom);
    setHomeSelect(emptyHome)
    setOpenCreateContractModal(false);
  }, [emptyRoom]);

  const addNewRoomHandler = useCallback(() => {
    openEditModalHandler(emptyRoom);
  }, [openEditModalHandler, emptyRoom]);

  const fnFilterCustom = (dataFiltered: IRoomData[]) => {
    setFilteredData(dataFiltered);
  };

  return {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    roomUpdate,
    homeSelect,
    roomId,
    openDeleteModal,
    openEditModal,
    openCreateContractModal,
    emptyRoom,
    emptyHome,
    
    // Actions
    fetchRooms,
    fetchRoomsByHome,
    filterData,
    updateSearchTerm,
    updatePagination,
    
    // Modal handlers
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteRoomHandler,
    openEditModalHandler,
    closeEditModalHandler,
    openCreateContractModalHandler,
    closeCreateContractModalHandler,
    addNewRoomHandler,
    fnFilterCustom
  };
}; 