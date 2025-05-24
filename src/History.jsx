import './History.css'
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash, BarChart3, ExternalLink } from 'lucide-react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const History = () =>{
    const [history, setHistory] = useState([]);
    const [userset, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        window.location.href = `${API_BASE_URL}/login/federated/google`;
    };
    const handleLogout = async () => {
        await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
        window.location.href = '/';
    };

    const fetchHistory = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/history`, { withCredentials: true });
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setHistory([]);
        }
        setIsLoading(false);
    };

    useEffect ( () => {
    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });
            setUser(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setUser(null);
        }
    };
    fetchUser(); })

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this QR code?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
            setHistory((prev) => prev.filter((item) => item.id !== id));
        } catch (error) {
            console.error("Error deleting QR code:", error);
        }
    };

    const handleViewAnalytics = (id) => {
        navigate(`/dashboard/${id}`);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateUrl = (url, maxLength = 50) => {
        return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
    };

    useEffect(() => {
        fetchHistory();
    }, []);


    return (
        <>
        <div className="app">
            <div className="navbar">
                <div className="navbar-start">
                    <a href='/' className="btn btn-ghost text-4xl bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent border-none shadow-none" style={{ color: '#9D93E6' }}>QR</a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                    <li><a href="/" className='text-lg '>Home</a></li>
                    <li><a href='/history' className='text-lg '>History</a></li>
                    <li><a href='/about' className='text-lg '>About</a></li>
                    </ul>
                </div>
                <div className="navbar-end">
                    <button onClick={handleLogin} class="btn bg-white text-black border-[#e5e5e5] mx-4 pt-3 pb-3">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                        Login
                    </button>
                    <button type="button" onClick={handleLogout} className="btn btn-outline btn-error hidden lg:inline-flex pt-3 pb-3">Logout</button>
                    <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-outline btn-primary lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                    </div>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-80 h-45 p-2 shadow shadow flex flex-col items-center text-center">
                        <li><a href="/" className='text-lg '>Home</a></li>
                        <li><a href="/history" className='text-lg '>History</a></li>
                        <li><a href="/about" className='text-lg '>About</a></li>
                        <li><button type="button" onClick={handleLogout} className="btn btn-outline btn-error btn-sm w-24 mx-auto mt-2"
                                style={{ minWidth: '90px', fontSize: '0.95rem', padding: '0.55rem 0.6rem' }}>Logout</button></li>
                    </ul>
                    </div>
                </div>
            </div>
            <div className="headerC-dash">
                <a className="main1-dash">History</a>
                <h1 className="main2-dash">Welcome {userset?.user?.name || 'User'} Check the previous QR codes you have created</h1>
            </div>
            <div className='dashboard'>
            <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 mt-10 mx-4 lg:mx-10 xl:mx-20" 
                    style={{backgroundColor:"#232D7F"}}>
                <table className="table  text-xs md:text-base lg:text-lg">
                    {/* head */}
                    <thead>
                        <tr>
                            <th></th>
                            <th className="text-xs md:text-base lg:text-lg">QR Code ID</th>
                            <th className="text-xs md:text-base lg:text-lg">Original Link</th>
                            <th className="text-xs md:text-base lg:text-lg">Created At</th>
                            <th className="text-xs md:text-base lg:text-lg">Analytics</th>
                            <th className="text-xs md:text-base lg:text-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8">
                                    <span className="loading loading-spinner loading-md"></span>
                                    <div className="ml-2">Loading history...</div>
                                </td>
                            </tr>
                        ) : history.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-400">
                                    No dynamic QR codes generated yet
                                </td>
                            </tr>
                        ) : (
                            history.map((item, index) => (
                            <tr key={item.id} className="hover:bg-base-200/10">
                                <th className="text-xs md:text-base lg:text-lg">{index + 1}</th>
                                    <td className="font-mono text-xs md:text-sm lg:text-base">
                                        {item.id}
                                    </td>
                                    <td className="text-xs md:text-sm lg:text-base">
                                        <div className="flex items-center gap-2">
                                            <span title={item.target_url}>
                                                {truncateUrl(item.target_url)}
                                            </span>
                                            <a 
                                            href={item.target_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300"
                                            >
                                            <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                                            </a>
                                            </div>
                                    </td>
                                    <td className="text-xs md:text-sm lg:text-base">
                                        {formatDate(item.created_at)}
                                    </td>
                                    <td className="text-xs md:text-sm lg:text-base">
                                        <button
                                        onClick={() => handleViewAnalytics(item.id)}
                                        className="btn btn-sm btn-ghost text-blue-400 hover:text-blue-300 hover:bg-blue-600"
                                        >
                                        <BarChart3 className="w-4 h-4" />
                                            View
                                        </button>
                                    </td>
                                    <td className="text-xs md:text-sm lg:text-base">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="btn btn-sm btn-ghost text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                            title="Delete QR Code"
                                        >
                                        <Trash className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
        </>
    )

}

export default History