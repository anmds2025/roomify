import { useCallback, useState, useMemo } from 'react';
import { IUserData } from '@/pages/dashboards/light-sidebar/blocks/users/UsersData';
import { useAuthContext } from '@/auth';
import { useSnackbar } from 'notistack';
import { useExpense } from './useExpense';
import { IExpenseData } from '@/api/expense';

export const useExpenseManagement = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { getExpenses, deleteExpense } = useExpense();
  const { currentUser } = useAuthContext();
  
  // Memoize currentUser email để tránh re-render không cần thiết
  const currentUserEmail = useMemo(() => currentUser?.email, [currentUser?.email]);
  
  // State management
  const [data, setData] = useState<IExpenseData[]>([]);
  const [filteredData, setFilteredData] = useState<IExpenseData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 5 });
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [expenseUpdate, setExpenseUpdate] = useState<IExpenseData>({} as IExpenseData);
  const [expenseId, setExpenseId] = useState<string>('');
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  
  // Tạo emptyUser một lần duy nhất để tránh re-render
  const emptyExpense = useMemo(() => ({} as IExpenseData), []);

  // Fetch users
  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const expensesResponse = await getExpenses();
      const filteredExpenses = (expensesResponse || [])
      setData(filteredExpenses);
      setFilteredData(filteredExpenses);
    } catch (error) {
      console.error('fetchExpenses error:', error);
      enqueueSnackbar('Failed to fetch Expenses', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  }, [getExpenses, currentUserEmail, enqueueSnackbar]);

  // Filter data
  const filterData = useCallback(() => {
    const filtered = data.filter((expense) => {
      const matchesSearch =
        expense.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.month?.toLowerCase().includes(searchTerm.toLowerCase());

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

  const openDeleteModalHandler = useCallback((expense: IExpenseData) => {
    setExpenseId(expense?._id?.$oid || '');
    setOpenDeleteModal(true);
  }, []);

  const closeDeleteModalHandler = useCallback(() => {
    setOpenDeleteModal(false);
  }, []);

  const deleteExpenseHandler = useCallback(async () => {
    try {
      await deleteExpense(expenseId);
      closeDeleteModalHandler();
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  }, [deleteExpense, expenseId, closeDeleteModalHandler, fetchExpenses]);

  const openEditModalHandler = useCallback((expense: IExpenseData) => {
    setExpenseId(expense._id?.$oid || "");
    setExpenseUpdate(expense);
    setOpenEditModal(true);
  }, []);

  const closeEditModalHandler = useCallback(() => {
    setExpenseId("");
    setExpenseUpdate(emptyExpense);
    setOpenEditModal(false);
  }, [emptyExpense]);

  const addNewExpenseHandler = useCallback(() => {
    openEditModalHandler(emptyExpense);
  }, [openEditModalHandler, emptyExpense]);

  const fnFilterCustom = (dataFiltered: IExpenseData[]) => {
    setFilteredData(dataFiltered);
  };

  return {
    // State
    data,
    filteredData,
    searchTerm,
    pagination,
    isLoading,
    expenseUpdate,
    expenseId,
    openDeleteModal,
    openEditModal,
    emptyExpense,
    
    // Actions
    fetchExpenses,
    filterData,
    updateSearchTerm,
    updatePagination,
    
    // Modal handlers
    openDeleteModalHandler,
    closeDeleteModalHandler,
    deleteExpenseHandler,
    openEditModalHandler,
    closeEditModalHandler,
    addNewExpenseHandler,
    fnFilterCustom
  };
}; 