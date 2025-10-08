import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { createReel, getReels, likeReel, recordReelView, unlikeReel, getExploreReels } from "../controllers/reel.controller.js";

const router = express.Router();

router.route('/')
    .get(isAuthenticated, getReels)
    .post(isAuthenticated, upload.single('video'), createReel);

router.route('/explore')
    .get(isAuthenticated, getExploreReels);

router.route('/:id/like')
    .post(isAuthenticated, likeReel);

router.route('/:id/unlike')
    .post(isAuthenticated, unlikeReel);

router.route('/:id/view')
    .post(isAuthenticated, recordReelView);

export default router;

