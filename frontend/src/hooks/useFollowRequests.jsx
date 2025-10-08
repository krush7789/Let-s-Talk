import { useCallback, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setFollowRequests, setAuthUser } from "@/redux/authSlice";

const useFollowRequests = () => {
    const dispatch = useDispatch();

    const fetchFollowRequests = useCallback(async () => {
        try {
            const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/user/follow-requests', { withCredentials: true });
            if (res.data.success) {
                dispatch(setFollowRequests(res.data.requests));
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchFollowRequests();
    }, [fetchFollowRequests]);

    const respondToRequest = useCallback(async ({ requesterId, action }) => {
        try {
            const res = await axios.post('https://let-s-talk-lq7h.onrender.com/api/v1/user/follow-requests/respond', {
                requesterId,
                action
            }, { withCredentials: true });
            if(res.data.success){
                dispatch(setFollowRequests(res.data.requests));
                if(res.data.user){
                    dispatch(setAuthUser(res.data.user));
                }
            }
            return res.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }, [dispatch]);

    return { fetchFollowRequests, respondToRequest };
};

export default useFollowRequests;
