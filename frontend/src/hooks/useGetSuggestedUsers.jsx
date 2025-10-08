import { setSuggestedUsers } from "@/redux/authSlice";
import apiClient from '@/lib/apiClient';
import { useEffect } from "react";
import { useDispatch } from "react-redux";


const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await apiClient.get('/user/suggested');
                if (res.data.success) { 
                    dispatch(setSuggestedUsers(res.data.users));
                }
            } catch (error) {
                console.error(error);
            }
        }
        fetchSuggestedUsers();
    }, []);
};
export default useGetSuggestedUsers;
