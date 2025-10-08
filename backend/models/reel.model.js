import mongoose from "mongoose";

const reelSchema = new mongoose.Schema({
    caption:{type:String, default:''},
    videoUrl:{type:String, required:true},
    coverImage:{type:String, default:''},
    author:{type:mongoose.Schema.Types.ObjectId, ref:'User', required:true},
    likes:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
    views:[{type:mongoose.Schema.Types.ObjectId, ref:'User'}],
},{timestamps:true});

export const Reel = mongoose.model('Reel', reelSchema);
