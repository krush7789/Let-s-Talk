import { createSlice } from "@reduxjs/toolkit";

const reelSlice = createSlice({
    name: 'reel',
    initialState: {
        reels: [],
        isLoading: false
    },
    reducers: {
        setReelLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setReels: (state, action) => {
            state.reels = action.payload || [];
        },
        addReel: (state, action) => {
            state.reels = [action.payload, ...state.reels];
        },
        toggleReelLike: (state, action) => {
            const { reelId, userId, liked } = action.payload;
            state.reels = state.reels.map(reel => {
                if (reel._id === reelId) {
                    let likes = Array.isArray(reel.likes) ? [...reel.likes] : [];
                    if (liked) {
                        if (!likes.includes(userId)) likes.push(userId);
                    } else {
                        likes = likes.filter(id => id !== userId);
                    }
                    return { ...reel, likes };
                }
                return reel;
            });
        }
    }
});

export const { setReelLoading, setReels, addReel, toggleReelLike } = reelSlice.actions;
export default reelSlice.reducer;
