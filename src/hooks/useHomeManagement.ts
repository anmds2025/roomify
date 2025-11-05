import { useCallback, useState, useMemo } from 'react';
import { IHomeData } from '@/pages/dashboards/light-sidebar/blocks/homes/HomesData';
import { useHome } from './useHome';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';

export const useHomeManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getHomes } = useHome();
  const { currentUser } = useAuthContext();
  
  // State management
  const [data, setData] = useState<IHomeData[]>([]);
  const [filteredData, setFilteredData] = useState<IHomeData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [homeUpdate, setHomeUpdate] = useState<IHomeData>({} as IHomeData);
  const [homeId, setHomeId] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Tạo emptyHome một lần duy nhất để tránh re-render
  const emptyHome = useMemo(() => ({} as IHomeData), []);

  // Fetch homes
  const fetchHomes = useCallback(async () => {
    setIsLoading(true);
    try {
      const homesResponse = await getHomes();
      setData(homesResponse || []);
      setFilteredData(homesResponse || []);
    } catch (error) {
      enqueueSnackbar('Failed to fetch homes', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getHomes, enqueueSnackbar]);

  // Filter data
  const filterData = useCallback(() => {
    const filtered = data.filter((home) => {
      const matchesSearch =
        home.home_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        home.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        home.user_name.toLowerCase().includes(searchTerm.toLowerCase());

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

  const openEditModalHandler = useCallback((home: IHomeData) => {
    setHomeId(home._id?.$oid || "");
    setHomeUpdate(home);
    setOpenEditModal(true);
  }, []);

  const closeEditModalHandler = useCallback(() => {
    setHomeId("");
    setHomeUpdate(emptyHome);
    setOpenEditModal(false);
  }, [emptyHome]);

  const addNewHomeHandler = useCallback(() => {
    openEditModalHandler(emptyHome);
  }, [openEditModalHandler, emptyHome]);

  return {
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
  };
}; 