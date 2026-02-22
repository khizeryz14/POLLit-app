import React from 'react';
import ReactDOM from 'react-dom/client';
import "./index.css";
import Home from './pages/Home';
import PollView from './pages/PollView';
import {createBrowserRouter, RouterProvider} from "react-router-dom"
import CreatePoll from './pages/CreatePoll';
import Auth from './pages/Auth';
import RootLayout from './components/RootLayout';

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
            path: "poll/:pollID",
            element: <PollView/>
        },
        {
            path: "createPoll",
            element: <CreatePoll/>
        },
        {
            path:"auth",
            element: <Auth/>,
        },
    ],
        errorElement: <div>404 Not Found!</div>,
    },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));



root.render(
    <RouterProvider router={router}/>
);


//need more work on Login <Navbar> situation, (FIXED)
//Footer on CreatePoll is miscolored (FIXED)
//Login/SignUp changing container size is annoying (Still there)
//Need to fix the <main> issue