import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name:"auth",
    initialState:{
        user:null,
        suggestedUsers:[],
        userProfile:null,
        userProfileMeta:null,
        followRequests:[],
        selectedUser:null,
    },
    reducers:{
        // actions
        setAuthUser:(state,action) => {
            state.user = action.payload;
            state.followRequests = action.payload?.followRequests || [];
        },
        setSuggestedUsers:(state,action) => {
            state.suggestedUsers = action.payload;
        },
        setUserProfile:(state,action) => {
            state.userProfile = action.payload?.user ?? null;
            state.userProfileMeta = action.payload?.meta ?? null;
        },
        setFollowRequests:(state,action) => {
            state.followRequests = action.payload ?? [];
        },
        setSelectedUser:(state,action) => {
            state.selectedUser = action.payload;
        }
    }
});
export const {
    setAuthUser,
    setSuggestedUsers,
    setUserProfile,
    setFollowRequests,
    setSelectedUser,
} = authSlice.actions;
export default authSlice.reducer;