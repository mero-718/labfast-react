import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DataItem } from '@/store/api/apiSlice';

interface DataState {
  selectedItem: DataItem | null;
  isDetailModalOpen: boolean;
}

const initialState: DataState = {
  selectedItem: null,
  isDetailModalOpen: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setSelectedItem: (state, action: PayloadAction<DataItem | null>) => {
      state.selectedItem = action.payload;
    },
    setDetailModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isDetailModalOpen = action.payload;
    },
  },
});

export const { setSelectedItem, setDetailModalOpen } = dataSlice.actions;
export default dataSlice.reducer; 