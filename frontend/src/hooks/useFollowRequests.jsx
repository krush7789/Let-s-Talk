import { useCallback, useEffect } from "react";
import apiClient from '@/lib/apiClient';
import { useDispatch } from "react-redux";
import { setFollowRequests, setAuthUser } from "@/redux/authSlice";

const useFollowRequests = () => {
    const dispatch = useDispatch();

    const fetchFollowRequests = useCallback(async () => {
        try {
            const res = await apiClient.get('/user/follow-requests');
            if (res.data.success) {
                dispatch(setFollowRequests(res.data.requests));
            }
        } catch (error) {
            console.error(error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchFollowRequests();
    }, [fetchFollowRequests]);

    const respondToRequest = useCallback(async ({ requesterId, action }) => {
        try {
            const res = await apiClient.post('/user/follow-requests/respond', {
                requesterId,
                action
            });
            if(res.data.success){
                dispatch(setFollowRequests(res.data.requests));
                if(res.data.user){
                    dispatch(setAuthUser(res.data.user));
                }
            }
            return res.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }, [dispatch]);

    return { fetchFollowRequests, respondToRequest };
};

export default useFollowRequests;
