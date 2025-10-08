import cloudinary from "../utils/cloudinary.js";
import { Reel } from "../models/reel.model.js";
import { User } from "../models/user.model.js";

const canViewerSeeUser = (userDoc, viewerId) => {
    if(!userDoc) return false;
    if(userDoc.accountType === 'public') return true;
    if(userDoc._id.equals(viewerId)) return true;
    return userDoc.followers.some(followerId => followerId.equals(viewerId));
};

export const createReel = async (req, res) => {
    try {
        const { caption } = req.body;
        const video = req.file;
        const authorId = req.id;

        if(!video){
            return res.status(400).json({ success:false, message:'Video is required to create a reel' });
        }

        const fileUri = `data:${video.mimetype};base64,${video.buffer.toString('base64')}`;
        const uploadResponse = await cloudinary.uploader.upload(fileUri, { resource_type:'video' });

        let reel = await Reel.create({
            caption,
            videoUrl: uploadResponse.secure_url,
            author: authorId
        });

        reel = await reel.populate({ path: 'author', select: 'username profilePicture accountType followers' });

        return res.status(201).json({ success:true, reel, message:'Reel shared' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to create reel' });
    }
};

export const getReels = async (req, res) => {
    try {
        const viewerId = req.id;
        const viewer = await User.findById(viewerId).select('following');
        const followings = viewer?.following?.map(id => id.toString()) || [];
        const candidateIds = [...new Set([viewerId, ...followings])];

        const reels = await Reel.find({ author: { $in: candidateIds } }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture accountType followers'
        });

        const visibleReels = reels.filter(reel => canViewerSeeUser(reel.author, viewerId));

        return res.status(200).json({ success:true, reels: visibleReels });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to fetch reels' });
    }
};

export const likeReel = async (req, res) => {
    try {
        const reelId = req.params.id;
        const viewerId = req.id;

        const reel = await Reel.findById(reelId).populate({ path:'author', select:'accountType followers' });
        if(!reel){
            return res.status(404).json({ success:false, message:'Reel not found' });
        }

        if(!canViewerSeeUser(reel.author, viewerId)){
            return res.status(403).json({ success:false, message:'You are not allowed to interact with this reel' });
        }

        if(!reel.likes.some(id => id.equals(viewerId))){
            reel.likes.push(viewerId);
            await reel.save();
        }

        return res.status(200).json({ success:true, message:'Reel liked', reelId });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to like reel' });
    }
};

export const unlikeReel = async (req, res) => {
    try {
        const reelId = req.params.id;
        const viewerId = req.id;

        const reel = await Reel.findById(reelId);
        if(!reel){
            return res.status(404).json({ success:false, message:'Reel not found' });
        }

        reel.likes = reel.likes.filter(id => !id.equals(viewerId));
        await reel.save();

        return res.status(200).json({ success:true, message:'Reel unliked', reelId });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to unlike reel' });
    }
};

export const recordReelView = async (req, res) => {
    try {
        const reelId = req.params.id;
        const viewerId = req.id;

        const reel = await Reel.findById(reelId);
        if(!reel){
            return res.status(404).json({ success:false, message:'Reel not found' });
        }

        if(!reel.views.some(id => id.equals(viewerId))){
            reel.views.push(viewerId);
            await reel.save();
        }

        return res.status(200).json({ success:true, reelId });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to record reel view' });
    }
};

export const getExploreReels = async (req, res) => {
    try {
        const viewerId = req.id;

        const reels = await Reel.find()
            .populate({ path: 'author', select: 'username profilePicture accountType followers' })
            .sort({ createdAt: -1 });

        const visibleReels = reels.filter(reel => canViewerSeeUser(reel.author, viewerId));

        visibleReels.sort((a, b) => (b.views?.length || 0) - (a.views?.length || 0));

        return res.status(200).json({ success: true, reels: visibleReels.slice(0, 50) });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch explore reels' });
    }
};
