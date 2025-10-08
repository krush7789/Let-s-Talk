import { useCallback, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addReel, setReelLoading, setReels } from "@/redux/reelSlice";

const useReels = () => {
    const dispatch = useDispatch();

    const fetchReels = useCallback(async () => {
        try {
            dispatch(setReelLoading(true));
            const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/reel', { withCredentials: true });
            if (res.data.success) {
                dispatch(setReels(res.data.reels));
            }
        } catch (error) {
            console.log(error);
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
