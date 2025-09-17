import { useCallback, useState, useMemo } from 'react';
import { IUserData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';
import { useDeposit } from './useDeposit';
import { IDepositData } from '@/types/deposit';
import { deleteDeposit } from '@/api/deposit';

export const useDepositManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { fetchDeposit } = useDeposit();
  const { currentUser } = useAuthContext();
  
  const currentUserEmail = useMemo(() => currentUser?.email, [currentUser?.email]);
  
  // State management
  const [data, setData] = useState<IDepositData[]>([]);
  const [filteredData, setFilteredData] = useState<IDepositData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);
  
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);

  // Fetch users
  const fetchDeposits = useCallback(async (hoom_pk?: string) => {
    setIsLoading(true);
    try {
      const depositResponse = await fetchDeposit(hoom_pk);
      const filteredDeposit = (depositResponse.objects || [])
      setData(filteredDeposit);
      setFilteredData(filteredDeposit);
    } catch (error) {
      console.error('fetchDeposits error:', error);
      enqueueSnackbar('Failed to fetch Deposits', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [fetchDeposit, currentUserEmail, enqueueSnackbar]);

  // Update pagination
  const updatePagination = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination);
  }, []);

  return {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    updatePagination,
    fetchDeposits,
  };
}; 