import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css";
import Home from './pages/Home';
import PollView from './pages/PollView';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import CreatePoll from './pages/CreatePoll';
import Auth from './pages/Auth';
import RootLayout from './components/RootLayout';
import Profile from './pages/Profile';
import BrowsePolls from './pages/BrowsePolls';
import { AuthProvider } from './context/AuthContext';
import { PollProvider } from './context/PollContext';
import ProtectedRoute from './utils/ProtectedRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout/>,
        children:[
        {
            index: true,
            element: <Home/>
        },
        {
            path: "polls",
            element: <BrowsePolls/>
        },
        {
            path: "polls/:pollId",
            element: <PollView/>
        },
        {
            path: "createPoll",
            element: <ProtectedRoute> <CreatePoll/> </ProtectedRoute>
        },
        {
            path:"auth",
            element: <Auth/>,
        },
        {
            path: "user/:username",
            element: <Profile/>,        
        },
    ],
        errorElement: <div>404 Not Found!</div>,
    },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));



root.render(
    <AuthProvider>
        <PollProvider>
            <RouterProvider router={router}/>
        </PollProvider>
    </AuthProvider>
);
