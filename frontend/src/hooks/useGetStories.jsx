import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setStories } from "@/redux/storySlice";

const useGetStories = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let ignore = false;

    const fetchStories = async () => {
      try {
        const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/story/feed', { withCredentials: true });
        if (!ignore && res.data.success) {
          dispatch(setStories(res.data.stories));
        }
      } catch (error) {
        if (!ignore) {
          console.log(error);
        }
      }
    };

    fetchStories();
    const interval = setInterval(fetchStories, 60 * 1000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [dispatch]);
};

export default useGetStories;
