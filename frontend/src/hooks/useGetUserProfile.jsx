import { setUserProfile } from "@/redux/authSlice";
import axios from "axios";
import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    // const [userProfile, setUserProfile] = useState(null);
    const fetchUserProfile = useCallback(async () => {
        if(!userId) return;
        try {
            const res = await axios.get(`https://let-s-talk-lq7h.onrender.com/api/v1/user/${userId}/profile`, { withCredentials: true });
            if (res.data.success) {
                dispatch(setUserProfile({ user: res.data.user, meta: res.data.meta }));
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch, userId]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    return { refetch: fetchUserProfile };
};
export default useGetUserProfile;