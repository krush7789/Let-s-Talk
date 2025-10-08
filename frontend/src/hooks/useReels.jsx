import { useCallback, useEffect } from "react";
import apiClient from '@/lib/apiClient';
import { useDispatch } from "react-redux";
import { addReel, setReelLoading, setReels } from "@/redux/reelSlice";

const useReels = () => {
    const dispatch = useDispatch();

    const fetchReels = useCallback(async () => {
        try {
            dispatch(setReelLoading(true));
            const res = await apiClient.get('/reel');
            if (res.data.success) {
                dispatch(setReels(res.data.reels));
            }
        } catch (error) {
            console.error(error);
        } finally {
            dispatch(setReelLoading(false));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchReels();
    }, [fetchReels]);

    const prependReel = useCallback((reel) => {
        dispatch(addReel(reel));
    }, [dispatch]);

    return { refetchReels: fetchReels, prependReel };
};

export default useReels;
