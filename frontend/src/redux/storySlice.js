import { createSlice } from "@reduxjs/toolkit";

const storySlice = createSlice({
    name: 'story',
    initialState: {
        myStories: [],
        stories: [],
        isLoading: false
    },
    reducers: {
        setStoryLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setMyStories: (state, action) => {
            state.myStories = action.payload || [];
        },
        setStories: (state, action) => {
            state.stories = action.payload || [];
        },
        addStory: (state, action) => {
            state.myStories = [action.payload, ...state.myStories];
        },
        updateStoryViewers: (state, action) => {
            const { storyId, viewerId } = action.payload;
            const updateViewerList = (story) => {
                if (story._id === storyId && !story.viewers?.includes(viewerId)) {
                    story.viewers = [...(story.viewers || []), viewerId];
                }
                return story;
            };
            state.myStories = state.myStories.map(updateViewerList);
            state.stories = state.stories.map(updateViewerList);
        }
    }
});

export const { setStoryLoading, setMyStories, setStories, addStory, updateStoryViewers } = storySlice.actions;
export default storySlice.reducer;
