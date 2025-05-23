import './Dashboard.css'
import React, { useState, useEffect } from 'react';
import { Link, useParams  } from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE_ASSET_URL = import.meta.env.VITE_API_ASSET_URL;

const Dashboard = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);
    const [error, setError] = useState(null);

    const handleLogin = () => {
        window.location.href = `${API_BASE_URL}/login/federated/google`;
    };
    const handleLogout = async () => {
        await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
        window.location.href = '/';
    };

    useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/analytics/${id}`,{ withCredentials: true });
        setAnalytics(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return (
  <div className="flex justify-center mt-5">
    <span className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-indigo-500 rounded-full" role="status" aria-label="loading"></span>
  </div>
    );

    if (error) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 text-center max-w-md mx-auto">
      {error}
      <Link
        to="/error"
        className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
      >
        Back to Generator
      </Link>
    </div>
  );
}


    const qrImageUrl = `${API_BASE_ASSET_URL}/assets/${id}.png`;

    const handleDownload = (e) => {
    e.preventDefault();
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', qrImageUrl, true);
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
      if (this.status === 200) {
        // Create a blob URL from the blob response
        const blob = new Blob([this.response], {type: 'image/png'});
        const url = window.URL.createObjectURL(blob);
        
        // Create a link element and trigger download
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `qrcode-${id}.png`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    };
    
    xhr.send();
  };

    return (
    <>
    <div className="app">
                <div className="navbar">
                <div className="navbar-start">
                    <a className="btn btn-ghost text-4xl bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent border-none shadow-none" style={{ color: '#9D93E6' }}>QR</a>
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
                        className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-80 h-35 p-2 shadow shadow flex flex-col items-center text-center">
                        <li><a href="/" className='text-lg '>Home</a></li>
                        <li><a href='/history' className='text-lg '>History</a></li>
                        <li><a href='/about' className='text-lg '>About</a></li>
                        <li><button type="button" onClick={handleLogout} className="btn btn-outline btn-error btn-sm w-24 mx-auto mt-2"
                                style={{ minWidth: '90px', fontSize: '0.95rem', padding: '0.55rem 0.6rem' }}>Logout</button></li>
                    </ul>
                    </div>
                </div>
            </div>
            <div className="headerC-dash">
                <a className="main1-dash">QR analytics</a>
                <h1 className="main2-dash">View analytics of a particular QR</h1>
            </div>
            <div className="main">
                <div className="card-main">
                    <div className="secondsection-dash flex flex-col items-center ">
                        <img 
                            src={qrImageUrl} 
                            alt="QR Code" 
                            className="max-w-[200px] w-full h-auto block" 
                            style={{ maxWidth: '200px' }}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f5f5f5'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='12' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3EQR Code%3C/text%3E%3C/svg%3E";
                                console.error("Failed to load QR code image");
                            }}
                        />
                        <button  
                            onClick={handleDownload}
                            className="btn btn-soft btn-lg btn-primary w-[320px] rounded-lg bg-[#1E6B38] text-white"  
                            style={{ marginTop : "20px"}}>Download QR Code
                        </button>
                        <div className='flex flex-col items-start text-left mt-4 space-y-3 sm : text-base md : text-base '>
                        <p><strong>ID:</strong> {analytics.qr.id}</p>
                        <p><strong>Target URL:</strong> <a href={analytics.qr.target_url} target="_blank" rel="noopener noreferrer">{analytics.qr.target_url}</a></p>
                        <p><strong>Created:</strong> {analytics.qr.created_at}</p>
                        <p><strong>Logo Included:</strong> {analytics.qr.with_logo ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                    <div className="firstsection-dash m-12 mb-15">
                        <div className="maincards-dash">
                            <div className="card bg-base-100 shadow-xl mb-4 rounded-lg maincard-custom" style={{backgroundColor : "#232D7F", borderRadius:"15px"}}>
                                <div className="card-body">
                                    <h2 className="card-title">Scan Statistics</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="stat bg-base-200 rounded-lg" style={{backgroundColor : "#1B2362" }}>
                                        <div className="stat-value text-primary">{analytics.stats.get_qr_analytics.total_scans}</div>
                                        <div className="stat-title">Total Scans</div>
                                    </div>
                                    <div className="stat bg-base-200 rounded-lg" style={{backgroundColor : "#1B2362"}}>
                                        <div className="stat-value text-success">{analytics.stats.get_qr_analytics.unique_visitors}</div>
                                        <div className="stat-title">Unique Visitors</div>
                                    </div>
                                    <div className="stat bg-base-200 rounded-lg" style={{backgroundColor : "#1B2362"}}>
                                        <div className="stat-value text-info break-words whitespace-normal">{analytics.stats.get_qr_analytics.last_scan || 'NA'}</div>
                                        <div className="stat-title">Last Scan</div>
                                    </div>
                                    </div>
                                </div>
                                </div>
                        </div>
                        <div className="table-analytics">
                            <div className="card bg-base-100 shadow-xl mb-12" style={{backgroundColor : "#232D7F" , borderRadius:"15px"}}>
                                <div className="card-body">
                                    <h2 className="card-title">Daily Scan Activity</h2>
                                    {analytics.dailyScans.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-base-content/60">No scan data available yet</p>
                                    </div>
                                    ) : (
                                    <div className="overflow-x-auto overflow-y-auto max-h-80">
                                        <table className="table">
                                        <thead>
                                            <tr>
                                            <th className='text-lg'>Date</th>
                                            <th className='text-lg'>Scans</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.dailyScans.map((day) => (
                                            <tr key={day.date} className="hover even:bg-[#1B2362] odd:bg-[#232D7F]">
                                                <td className='text-lg'>{new Date(day.date).toLocaleDateString()}</td>
                                                <td className='font-semibold text-lg'>
                                                    {day.scans}

                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                        </table>
                                    </div>
                                    )}
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            </div>
    </div>
    </>
)

}

export default Dashboard