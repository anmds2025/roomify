import { useCallback, useState, useMemo } from 'react';
import { IUserData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useUser } from './useUser';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';

export const useUserManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getUsers, deleteUser } = useUser();
  const { currentUser } = useAuthContext();
  
  // Memoize currentUser email để tránh re-render không cần thiết
  const currentUserEmail = useMemo(() => currentUser?.email, [currentUser?.email]);
  
  // State management
  const [data, setData] = useState<IUserData[]>([]);
  const [filteredData, setFilteredData] = useState<IUserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('Tất cả');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [userUpdate, setUserUpdate] = useState<IUserData>({} as IUserData);
  const [userId, setUserId] = useState<string>('');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openActiveModal, setOpenActiveModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Tạo emptyUser một lần duy nhất để tránh re-render
  const emptyUser = useMemo(() => ({} as IUserData), []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersResponse = await getUsers();
      console.log('fetchUsers response:', usersResponse);
      
      const filteredUsers = (usersResponse || []).filter(
        (user) => user.email !== currentUserEmail && user.level !== 'Root'
      );
      
      console.log('filteredUsers:', filteredUsers);

      setData(filteredUsers);
      setFilteredData(filteredUsers);
    } catch (error) {
      console.error('fetchUsers error:', error);
      enqueueSnackbar('Failed to fetch users', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getUsers, currentUserEmail, enqueueSnackbar]);

  // Filter data
  const filterData = useCallback(() => {
    console.log('Filtering data:', { searchTerm, levelFilter, dataLength: data.length });
    
    const filtered = data.filter((user) => {
      const matchesSearch =
        user.fullname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter === 'Tất cả' || user.level === levelFilter;

      return matchesSearch && matchesLevel;
    });

    console.log('Filtered result:', { filteredLength: filtered.length, filtered });
    setFilteredData(filtered);
  }, [searchTerm, levelFilter, data]);

  // Update search term
  const updateSearchTerm = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // Update level filter
  const updateLevelFilter = useCallback((level: string) => {
    setLevelFilter(level);
  }, []);

  // Update pagination
  const updatePagination = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination);
  }, []);

  // Modal handlers
  const openActiveModalHandler = useCallback((user: IUserData, status: string) => {
    setUserUpdate(user);
    setStatusUpdate(status);
    setOpenActiveModal(true);
  }, []);

  const closeActiveModalHandler = useCallback(() => {
    setOpenActiveModal(false);
    setUserUpdate(emptyUser);
    setStatusUpdate('');
  }, [emptyUser]);

  const openDeleteModalHandler = useCallback((user: IUserData) => {
    setUserId(user?._id?.$oid || '');
    setOpenDeleteModal(true);
  }, []);

  const closeDeleteModalHandler = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  const deleteUserHandler = useCallback(async () => {
    try {
      await deleteUser(userId);
      closeDeleteModalHandler();
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user', error);
    }
  }, [deleteUser, userId, closeDeleteModalHandler, fetchUsers]);

  const openEditModalHandler = useCallback((user: IUserData) => {
    setUserId(user._id?.$oid || "");
    setUserUpdate(user);
    setOpenEditModal(true);
  }, []);

  const closeEditModalHandler = useCallback(() => {
    setUserId("");
    setUserUpdate(emptyUser);
    setOpenEditModal(false);
  }, [emptyUser]);

  const addNewUserHandler = useCallback(() => {
    openEditModalHandler(emptyUser);
  }, [openEditModalHandler, emptyUser]);

  return {
    // State
    data,
    filteredData,
    searchTerm,
    levelFilter,
    pagination,
    isLoading,
    userUpdate,
    userId,
    statusUpdate,
    openDeleteModal,
    openActiveModal,
    openEditModal,
    emptyUser,
    
    // Actions
    fetchUsers,
    filterData,
    updateSearchTerm,
    updateLevelFilter,
    updatePagination,
    
    // Modal handlers
    openActiveModalHandler,
    closeActiveModalHandler,
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteUserHandler,
    openEditModalHandler,
    closeEditModalHandler,
    addNewUserHandler,
  };
}; 