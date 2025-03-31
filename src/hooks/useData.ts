import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useGetDataListQuery, useGetDataDetailQuery, useDeleteDataMutation } from '../store/api/apiSlice';
import { setSelectedItem, setDetailModalOpen } from '../store/slices/dataSlice';

export const useData = () => {
  const dispatch = useDispatch();
  const { data: dataList, isLoading: isLoadingList } = useGetDataListQuery();
  const [deleteData] = useDeleteDataMutation();

  const handleViewDetail = useCallback(
    (id: number) => {
      const { data: detailData } = useGetDataDetailQuery(id);
      dispatch(setSelectedItem(detailData || null));
      dispatch(setDetailModalOpen(true));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteData(id).unwrap();
      } catch (error) {
        console.error('Delete failed:', error);
        throw error;
      }
    },
    [deleteData]
  );

  const handleCloseDetail = useCallback(() => {
    dispatch(setDetailModalOpen(false));
    dispatch(setSelectedItem(null));
  }, [dispatch]);

  return {
    dataList,
    isLoadingList,
    handleViewDetail,
    handleDelete,
    handleCloseDetail,
  };
}; 