import { useCallback, useEffect } from "react";
import apiClient from '@/lib/apiClient';
import { useDispatch } from "react-redux";
import { setStoryLoading, setMyStories, setStories } from "@/redux/storySlice";

const useStoryFeed = () => {
    const dispatch = useDispatch();

    const fetchStories = useCallback(async () => {
        try {
            dispatch(setStoryLoading(true));
            const res = await apiClient.get('/story/feed');
            if (res.data.success) {
                dispatch(setMyStories(res.data.myStories));
                dispatch(setStories(res.data.feedStories));
            }
        } catch (error) {
            console.error(error);
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
