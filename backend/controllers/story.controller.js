import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Story } from "../models/story.model.js";
import { User } from "../models/user.model.js";

const isImage = (mimetype = "") => mimetype.startsWith('image/');

const canViewerSeeUser = (userDoc, viewerId) => {
    if(!userDoc) return false;
    if(userDoc.accountType === 'public') return true;
    if(userDoc._id.equals(viewerId)) return true;
    return userDoc.followers.some(followerId => followerId.equals(viewerId));
}

export const createStory = async (req, res) => {
    try {
        const media = req.file;
        const ownerId = req.id;
        const { caption } = req.body;

        if(!media){
            return res.status(400).json({ success:false, message:'Story media is required' });
        }

        let optimizedBuffer = media.buffer;
        if(isImage(media.mimetype)){
            optimizedBuffer = await sharp(media.buffer)
                .resize({ width: 1080, height: 1920, fit: 'cover' })
                .toFormat('jpeg', { quality: 80 })
                .toBuffer();
        }

        const fileUri = `data:${media.mimetype};base64,${optimizedBuffer.toString('base64')}`;
        const uploadResponse = await cloudinary.uploader.upload(fileUri, { resource_type: 'auto' });

        let story = await Story.create({
            owner: ownerId,
            caption,
            mediaUrl: uploadResponse.secure_url,
            mediaType: isImage(media.mimetype) ? 'image' : 'video'
        });

        story = await story.populate({ path: 'owner', select: 'username profilePicture accountType followers' });

        return res.status(201).json({ success:true, story });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to create story' });
    }
};

export const getStoryFeed = async (req, res) => {
    try {
        const viewerId = req.id;
        const viewer = await User.findById(viewerId).select('following');
        const followings = viewer?.following?.map(id => id.toString()) || [];
        const candidateIds = [...new Set([viewerId, ...followings])];

        const activeStories = await Story.find({
            owner: { $in: candidateIds },
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 }).populate({ path: 'owner', select: 'username profilePicture accountType followers' });

        const visibleStories = activeStories.filter(story => canViewerSeeUser(story.owner, viewerId));
        const myStories = visibleStories.filter(story => story.owner._id.equals(viewerId));
        const feedStories = visibleStories.filter(story => !story.owner._id.equals(viewerId));

        return res.status(200).json({ success:true, myStories, feedStories });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to fetch stories' });
    }
};

export const getUserStories = async (req, res) => {
    try {
        const viewerId = req.id;
        const { id: userId } = req.params;

        const user = await User.findById(userId).select('accountType followers');
        if(!user){
            return res.status(404).json({ success:false, message:'User not found' });
        }

        if(!canViewerSeeUser(user, viewerId)){
            return res.status(403).json({ success:false, message:'This account is private' });
        }

        const stories = await Story.find({
            owner: userId,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 }).populate({ path: 'owner', select: 'username profilePicture accountType followers' });

        return res.status(200).json({ success:true, stories });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to fetch stories' });
    }
};

export const markStoryViewed = async (req, res) => {
    try {
        const storyId = req.params.id;
        const viewerId = req.id;

        const story = await Story.findById(storyId);
        if(!story){
            return res.status(404).json({ success:false, message:'Story not found' });
        }

        if(!story.viewers.some(id => id.equals(viewerId))){
            story.viewers.push(viewerId);
            await story.save();
        }

        return res.status(200).json({ success:true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success:false, message:'Unable to update story view' });
    }
};
