import { setUserProfile } from "@/redux/authSlice";
import apiClient from '@/lib/apiClient';
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    const fetchUserProfile = useCallback(async () => {
        if(!userId) return;
        try {
            const res = await apiClient.get(`/user/${userId}/profile`);
            if (res.data.success) {
                dispatch(setUserProfile({ user: res.data.user, meta: res.data.meta }));
            }
        } catch (error) {
            console.error(error);
        }
    }, [dispatch, userId]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return { refetch: fetchUserProfile };
};
export default useGetUserProfile;
