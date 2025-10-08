import { useCallback, useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setStoryLoading, setMyStories, setStories } from "@/redux/storySlice";

const useStoryFeed = () => {
    const dispatch = useDispatch();

    const fetchStories = useCallback(async () => {
        try {
            dispatch(setStoryLoading(true));
            const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/story/feed', { withCredentials: true });
            if (res.data.success) {
                dispatch(setMyStories(res.data.myStories));
                dispatch(setStories(res.data.feedStories));
            }
        } catch (error) {
            console.log(error);
        } finally {
            dispatch(setStoryLoading(false));
        }
    }, [dispatch]);

    useEffect(() => {
        fetchStories();
    }, [fetchStories]);

    return { refetchStories: fetchStories };
};

export default useStoryFeed;
