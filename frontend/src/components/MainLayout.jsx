import React from 'react';
import { Outlet } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';

const MainLayout = () => {
  return (
    <div className='flex bg-gray-50 min-h-screen'>
      <LeftSidebar />
      <div className='flex-1 ml-[16%]'>
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;

