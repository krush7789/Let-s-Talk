import express from "express";
import { editProfile, followOrUnfollow, getProfile, getSuggestedUsers, login, logout, register, getFollowRequests, respondToFollowRequest, getUserFollowersList, getUserFollowingList } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/followers').get(isAuthenticated, getUserFollowersList);
router.route('/:id/following').get(isAuthenticated, getUserFollowingList);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(isAuthenticated, upload.single('profilePhoto'), editProfile);
router.route('/suggested').get(isAuthenticated, getSuggestedUsers);
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);
router.route('/follow-requests').get(isAuthenticated, getFollowRequests);
router.route('/follow-requests/respond').post(isAuthenticated, respondToFollowRequest);

export default router;