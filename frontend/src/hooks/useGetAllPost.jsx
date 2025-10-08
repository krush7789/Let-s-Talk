import { setPosts } from '@/redux/postSlice';
import apiClient from '@/lib/apiClient';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

const useGetAllPost = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchAllPost = async () => {
            try {
                const res = await apiClient.get('/post/all');
                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchAllPost();
    }, [dispatch]);
};

export default useGetAllPost;

