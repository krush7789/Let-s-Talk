import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import { createReel, getReels, likeReel, unlikeReel, recordReelView } from "../controllers/reel.controller.js";

const router = express.Router();

router.route('/')
    .post(isAuthenticated, upload.single('video'), createReel)
    .get(isAuthenticated, getReels);

router.route('/:id/like')
    .post(isAuthenticated, likeReel);

router.route('/:id/unlike')
    .post(isAuthenticated, unlikeReel);

router.route('/:id/view')
    .post(isAuthenticated, recordReelView);

export default router;
