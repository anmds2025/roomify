import { useCallback, useState, useMemo } from 'react';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';
import { useInterior } from './useInterior';
import { InteriorData } from '@/api/interior';

export const useInteriorManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getInteriors, deleteInterior } = useInterior();
  const { currentUser } = useAuthContext();
  
  // Memoize currentUser email để tránh re-render không cần thiết
  const currentUserEmail = useMemo(() => currentUser?.email, [currentUser?.email]);
  
  // State management
  const [data, setData] = useState<InteriorData[]>([]);
  const [filteredData, setFilteredData] = useState<InteriorData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [interiorUpdate, setInteriorUpdate] = useState<InteriorData>({} as InteriorData);
  const [interiorId, setInteriorId] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Tạo emptyUser một lần duy nhất để tránh re-render
  const emptyInterior = useMemo(() => ({} as InteriorData), []);

  // Fetch users
  const fetchInteriors = useCallback(async () => {
    setIsLoading(true);
    try {
      const interiorsResponse = await getInteriors();
      const filteredInteriors = (interiorsResponse || [])
      setData(filteredInteriors);
      setFilteredData(filteredInteriors);
    } catch (error) {
      console.error('fetchInteriors error:', error);
      enqueueSnackbar('Failed to fetch Interiors', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getInteriors, currentUserEmail, enqueueSnackbar]);

  // Filter data
  const filterData = useCallback(() => {
    const filtered = data.filter((interior) => {
      const matchesSearch =
        interior.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interior.price?.toString().toLowerCase().includes(searchTerm.toLowerCase());

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

  const openDeleteModalHandler = useCallback((interior: InteriorData) => {
    setInteriorId(interior?._id?.$oid || '');
    setOpenDeleteModal(true);
  }, []);

  const closeDeleteModalHandler = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  const deleteInteriorHandler = useCallback(async () => {
    try {
      await deleteInterior(interiorId);
      closeDeleteModalHandler();
      fetchInteriors();
    } catch (error) {
      console.error('Failed to delete interior', error);
    }
  }, [deleteInterior, interiorId, closeDeleteModalHandler, fetchInteriors]);

  const openEditModalHandler = useCallback((interior: InteriorData) => {
    setInteriorId(interior._id?.$oid || "");
    setInteriorUpdate(interior);
    setOpenEditModal(true);
  }, []);

  const closeEditModalHandler = useCallback(() => {
    setInteriorId("");
    setInteriorUpdate(emptyInterior);
    setOpenEditModal(false);
  }, [emptyInterior]);

  const addNewInteriorHandler = useCallback(() => {
    openEditModalHandler(emptyInterior);
  }, [openEditModalHandler, emptyInterior]);

  const fnFilterCustom = (dataFiltered: InteriorData[]) => {
    setFilteredData(dataFiltered);
  };

  return {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    interiorUpdate,
    interiorId,
    openDeleteModal,
    openEditModal,
    emptyInterior,
    
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
    fnFilterCustom
  };
}; 