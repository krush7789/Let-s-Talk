import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import apiClient from '@/lib/apiClient';
import { Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setAuthUser } from '@/redux/authSlice';

const EditProfile = () => {
    const imageRef = useRef();
    const { user } = useSelector((store) => store.auth);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState({
        profilePhoto: null,
        bio: user?.bio || '',
        gender: user?.gender || '',
        accountType: user?.accountType || 'public',
    });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) setInput((prev) => ({ ...prev, profilePhoto: file }));
    };

    const selectChangeHandler = (value) => {
        setInput((prev) => ({ ...prev, gender: value }));
    };

    const editProfileHandler = async () => {
        const formData = new FormData();
        formData.append('bio', input.bio ?? '');
        formData.append('gender', input.gender ?? '');
        formData.append('accountType', input.accountType);
        if (input.profilePhoto) {
            formData.append('profilePhoto', input.profilePhoto);
        }
        try {
            setLoading(true);
            const res = await apiClient.post('/user/profile/edit', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (res.data.success) {
                const updatedUserData = {
                    ...user,
                    bio: res.data.user?.bio,
                    profilePicture: res.data.user?.profilePicture,
                    gender: res.data.user?.gender,
                    accountType: res.data.user?.accountType,
                };
                dispatch(setAuthUser(updatedUserData));
                navigate(`/profile/${user?._id}`);
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.message || error.response?.data?.message || 'Unable to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='mx-auto flex w-full max-w-3xl justify-center px-2 py-10 md:px-0'>
            <section className='w-full rounded-3xl border border-slate-200/70 bg-white/90 p-8 shadow-[0_35px_90px_-50px_rgba(30,64,175,0.45)] backdrop-blur'>
                <div className='flex flex-col gap-8'>
                    <div className='flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-4'>
                        <div className='flex items-center gap-3'>
                            <Avatar className='h-16 w-16 border border-indigo-100'>
                                <AvatarImage src={input.profilePhoto ? URL.createObjectURL(input.profilePhoto) : user?.profilePicture} alt={user?.username} />
                                <AvatarFallback>YOU</AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className='text-base font-semibold text-slate-900'>{user?.username}</h1>
                                <span className='text-sm text-slate-500'>{user?.bio || 'Craft a short tagline about you.'}</span>
                            </div>
                        </div>
                        <div>
                            <input ref={imageRef} onChange={fileChangeHandler} type='file' accept='image/*' className='hidden' />
                            <Button
                                onClick={() => imageRef?.current?.click()}
                                variant='outline'
                                className='rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50'
                            >
                                <Upload className='mr-2 h-4 w-4' />
                                Change photo
                            </Button>
                        </div>
                    </div>

                    <div className='grid gap-6 md:grid-cols-2'>
                        <div className='md:col-span-2'>
                            <h2 className='mb-2 text-sm font-semibold text-slate-900'>Bio</h2>
                            <Textarea
                                value={input.bio}
                                onChange={(e) => setInput({ ...input, bio: e.target.value })}
                                name='bio'
                                className='min-h-[110px] rounded-2xl border-slate-200 bg-white/80 text-sm text-slate-700 focus-visible:border-indigo-300 focus-visible:ring-indigo-100'
                                placeholder='Share what fuels you, your story, or what people should know.'
                            />
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-sm font-semibold text-slate-900'>Gender</h2>
                            <Select defaultValue={input.gender} onValueChange={selectChangeHandler}>
                                <SelectTrigger className='w-full rounded-2xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:ring-indigo-100'>
                                    <SelectValue placeholder='Select gender' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value='male'>Male</SelectItem>
                                        <SelectItem value='female'>Female</SelectItem>
                                        <SelectItem value='other'>Other</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className='space-y-2'>
                            <h2 className='text-sm font-semibold text-slate-900'>Account privacy</h2>
                            <Select value={input.accountType} onValueChange={(value) => setInput((prev) => ({ ...prev, accountType: value }))}>
                                <SelectTrigger className='w-full rounded-2xl border border-slate-200 bg-white/80 text-sm text-slate-700 focus:ring-indigo-100'>
                                    <SelectValue placeholder='Select account type' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value='public'>Public</SelectItem>
                                        <SelectItem value='private'>Private</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className='flex justify-end'>
                        {loading ? (
                            <Button className='rounded-full bg-indigo-500 px-6 text-sm text-white hover:bg-indigo-600'>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Updating
                            </Button>
                        ) : (
                            <Button onClick={editProfileHandler} className='rounded-full bg-indigo-600 px-6 text-sm text-white hover:bg-indigo-700'>
                                Save changes
                            </Button>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default EditProfile;
