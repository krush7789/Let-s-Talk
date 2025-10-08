import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setStories } from "@/redux/storySlice";

const useGetStories = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get('https://let-s-talk-lq7h.onrender.com/api/v1/story/feed', { withCredentials: true });
        if (res.data.success) {
          dispatch(setStories(res.data.stories));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchStories();
  }, [dispatch]);
};

export default useGetStories;
