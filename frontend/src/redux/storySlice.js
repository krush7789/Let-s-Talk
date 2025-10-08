import { createSlice } from "@reduxjs/toolkit";

const storySlice = createSlice({
  name: 'story',
  initialState: {
    stories: []
  },
  reducers: {
    setStories: (state, action) => {
      state.stories = action.payload || [];
    },
    addStory: (state, action) => {
      const story = action.payload;
      if (!story?.author?._id) return;
      const authorId = story.author._id;
      const existingGroup = state.stories.find(group => group.author._id === authorId);
      if (existingGroup) {
        existingGroup.stories = [story, ...(existingGroup.stories || [])];
      } else {
        state.stories = [{ author: story.author, stories: [story] }, ...state.stories];
      }
    }
  }
});

export const { setStories, addStory } = storySlice.actions;
export default storySlice.reducer;
