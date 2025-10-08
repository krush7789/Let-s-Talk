import { setMessages } from '@/redux/chatSlice';
import apiClient from '@/lib/apiClient';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const { selectedUser } = useSelector((store) => store.auth);

    useEffect(() => {
        const fetchAllMessage = async () => {
            if (!selectedUser?._id) {
                dispatch(setMessages([]));
                return;
            }
            try {
                const res = await apiClient.get(`/message/all/${selectedUser._id}`);
                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAllMessage();
    }, [dispatch, selectedUser]);
};
export default useGetAllMessage;
