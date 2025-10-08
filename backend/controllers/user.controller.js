import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post.model.js";
import mongoose from "mongoose";
const sanitizeUserForClient = (userDoc) => {
    if(!userDoc) return null;
    const user = userDoc.toObject({ getters: true });
    delete user.password;
    return user;
};

export const register = async (req, res) => {
    try {
        const { username, email, password, accountType } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Try different email",
                success: false,
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword,
            accountType: accountType === 'private' ? 'private' : 'public'
        });
        return res.status(201).json({
            message: "Account created successfully.",
            success: true,
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing, please check!",
                success: false,
            });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Incorrect email or password",
                success: false,
            });
        };

        const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

        // populate each post if in the posts array
        const populatedPosts = await Promise.all(
            user.posts.map( async (postId) => {
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        const sanitizedUser = {
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture,
            bio: user.bio,
            gender: user.gender,
            accountType: user.accountType,
            followers: user.followers,
            following: user.following,
            followRequests: user.followRequests,
            sentFollowRequests: user.sentFollowRequests,
            posts: populatedPosts.filter(Boolean),
            bookmarks: user.bookmarks
        };
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 1 * 24 * 60 * 60 * 1000 }).json({
            message: `Welcome back ${user.username}`,
            success: true,
            user: sanitizedUser
        });

    } catch (error) {
        console.log(error);
    }
};
export const logout = async (_, res) => {
    try {
        return res.cookie("token", "", { maxAge: 0 }).json({
            message: 'Logged out successfully.',
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};
export const getProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const viewerId = req.id;

        let user = await User.findById(userId)
            .select('-password')
            .populate({path:'posts', options:{ sort:{ createdAt:-1 }}})
            .populate('bookmarks');

        if(!user){
            return res.status(404).json({ success:false, message:'User not found' });
        }

        const isOwner = user._id.equals(viewerId);
        const isFollowing = user.followers.some(followerId => followerId.equals(viewerId));
        const hasPendingRequest = user.followRequests.some(requestId => requestId.equals(viewerId));
        const canViewFullProfile = user.accountType === 'public' || isOwner || isFollowing;

        const sanitizedUser = sanitizeUserForClient(user);
        if(!isOwner){
            sanitizedUser.bookmarks = [];
            delete sanitizedUser.followRequests;
            delete sanitizedUser.sentFollowRequests;
        }
        if(!canViewFullProfile){
            sanitizedUser.posts = [];
            sanitizedUser.bookmarks = [];
        }
        sanitizedUser.bookmarks = sanitizedUser.bookmarks || [];

        return res.status(200).json({
            user: sanitizedUser,
            meta: {
                canViewFullProfile,
                isOwner,
                isFollowing,
                hasPendingRequest,
                isPrivate: user.accountType === 'private',
                totalPendingRequests: user.followRequests.length
            },
            success: true
        });
    } catch (error) {
        console.log(error);
    }
};

export const editProfile = async (req, res) => {
    try {
        const userId = req.id;
        const { bio, gender, accountType } = req.body;
        const profilePicture = req.file;
        let cloudResponse;

        if (profilePicture) {
            const fileUri = getDataUri(profilePicture);
            cloudResponse = await cloudinary.uploader.upload(fileUri);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found.',
                success: false
            });
        };
        if (bio !== undefined) user.bio = bio;
        if (gender) user.gender = gender;
        if (profilePicture) user.profilePicture = cloudResponse.secure_url;
        if(accountType && ['public','private'].includes(accountType)){
            const previousType = user.accountType;
            user.accountType = accountType;
            if(previousType === 'private' && accountType === 'public'){
                // auto approve pending requests when switching to public
                const pendingFollowerIds = user.followRequests.map(id => id.toString());
                if(pendingFollowerIds.length){
                    await User.updateMany(
                        { _id: { $in: pendingFollowerIds } },
                        { $addToSet: { following: user._id }, $pull: { sentFollowRequests: user._id } }
                    );
                    const combinedFollowers = [...user.followers, ...user.followRequests];
                    const uniqueFollowerIds = [...new Set(combinedFollowers.map(id => id.toString()))];
                    user.followers = uniqueFollowerIds.map(id => new mongoose.Types.ObjectId(id));
                    user.followRequests = [];
                }
            }
        }

        await user.save();

        return res.status(200).json({
            message: 'Profile updated.',
            success: true,
            user
        });

    } catch (error) {
        console.log(error);
    }
};
export const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
        if (!suggestedUsers) {
            return res.status(400).json({
                message: 'Currently do not have any users',
            })
        };
        return res.status(200).json({
            success: true,
            users: suggestedUsers
        })
    } catch (error) {
        console.log(error);
    }
};
export const followOrUnfollow = async (req, res) => {
    try {
        const followKrneWala = req.id; // patel
        const jiskoFollowKrunga = req.params.id; // shivani
        if (followKrneWala === jiskoFollowKrunga) {
            return res.status(400).json({
                message: 'You cannot follow/unfollow yourself',
                success: false
            });
        }

        const user = await User.findById(followKrneWala);
        const targetUser = await User.findById(jiskoFollowKrunga);

        if (!user || !targetUser) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }
        // mai check krunga ki follow krna hai ya unfollow
        const isFollowing = user.following.some(id => id.equals(jiskoFollowKrunga));
        const hasPendingRequest = targetUser.followRequests.some(id => id.equals(followKrneWala));

        if (isFollowing) {
            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $pull: { following: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followers: followKrneWala } })
            ]);
            return res.status(200).json({ message: 'Unfollowed successfully', success: true, status:'unfollowed' });
        }

        if(targetUser.accountType === 'private'){
            if(hasPendingRequest){
                await Promise.all([
                    User.updateOne({ _id: followKrneWala }, { $pull: { sentFollowRequests: jiskoFollowKrunga } }),
                    User.updateOne({ _id: jiskoFollowKrunga }, { $pull: { followRequests: followKrneWala } })
                ]);
                return res.status(200).json({ message:'Follow request cancelled', success:true, status:'request_cancelled' });
            }

            await Promise.all([
                User.updateOne({ _id: followKrneWala }, { $addToSet: { sentFollowRequests: jiskoFollowKrunga } }),
                User.updateOne({ _id: jiskoFollowKrunga }, { $addToSet: { followRequests: followKrneWala } })
            ]);

            return res.status(200).json({ message:'Follow request sent', success:true, status:'requested' });
        }

        await Promise.all([
            User.updateOne({ _id: followKrneWala }, { $addToSet: { following: jiskoFollowKrunga }, $pull: { sentFollowRequests: jiskoFollowKrunga } }),
            User.updateOne({ _id: jiskoFollowKrunga }, { $addToSet: { followers: followKrneWala }, $pull: { followRequests: followKrneWala } })
        ]);
        return res.status(200).json({ message: 'followed successfully', success: true, status:'followed' });
    } catch (error) {
        console.log(error);
    }
}

export const getFollowRequests = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId)
            .select('followRequests')
            .populate({ path:'followRequests', select:'username profilePicture bio accountType' });

        if(!user){
            return res.status(404).json({ success:false, message:'User not found' });
        }

        return res.status(200).json({ success:true, requests:user.followRequests });
    } catch (error) {
        console.log(error);
    }
};

export const respondToFollowRequest = async (req, res) => {
    try {
        const userId = req.id;
        const { requesterId, action } = req.body;

        if(!requesterId || !['accept','decline'].includes(action)){
            return res.status(400).json({ success:false, message:'Invalid request' });
        }

        const [user, requester] = await Promise.all([
            User.findById(userId),
            User.findById(requesterId)
        ]);

        if(!user || !requester){
            return res.status(404).json({ success:false, message:'User not found' });
        }

        const hasRequest = user.followRequests.some(id => id.equals(requesterId));
        if(!hasRequest){
            return res.status(400).json({ success:false, message:'Follow request not found' });
        }

        let message = 'Request declined';

        if(action === 'accept'){
            await Promise.all([
                User.updateOne({ _id: userId }, { $addToSet: { followers: requesterId }, $pull: { followRequests: requesterId } }),
                User.updateOne({ _id: requesterId }, { $addToSet: { following: userId }, $pull: { sentFollowRequests: userId } })
            ]);
            message = 'Request accepted';
        }else{
            await Promise.all([
                User.updateOne({ _id: userId }, { $pull: { followRequests: requesterId } }),
                User.updateOne({ _id: requesterId }, { $pull: { sentFollowRequests: userId } })
            ]);
        }

        const updatedUser = await User.findById(userId)
            .select('-password')
            .populate({ path:'followRequests', select:'username profilePicture bio accountType' });

        return res.status(200).json({ success:true, message, user: sanitizeUserForClient(updatedUser), requests: updatedUser.followRequests });
    } catch (error) {
        console.log(error);
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { q = "" } = req.query;
        const query = q.trim();

        if (!query) {
            return res.status(200).json({ success: true, users: [] });
        }

        const regex = new RegExp(query, 'i');
        const users = await User.find({
            username: regex
        }).select('username profilePicture accountType followers bio');

        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Unable to search users' });
    }
};