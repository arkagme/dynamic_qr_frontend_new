import './About.css'
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const About = () => {
    const handleLogin = () => {
        window.location.href = `${API_BASE_URL}/login/federated/google`;
    };
    const handleLogout = async () => {
        await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
        window.location.href = '/';
    };
    return (
        <>
        <div className="app-about">
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
                        className="menu menu-sm dropdown-content bg-base-200 rounded-box z-1 mt-3 w-80 h-45 p-2 shadow shadow flex flex-col items-center text-center">
                        <li><a href="/" className='text-lg '>Home</a></li>
                        <li><a href='/history' className='text-lg '>History</a></li>
                        <li><a href='/about' className='text-lg '>About</a></li>
                        <li><button type="button" onClick={handleLogout} className="btn btn-outline btn-error btn-sm w-24 mx-auto mt-2"
                                style={{ minWidth: '90px', fontSize: '0.95rem', padding: '0.55rem 0.6rem' }}>Logout</button></li>
                    </ul>
                    </div>
                </div>
            </div>
            <div className="headerC-about">
                <a className="main1-dash">About</a>
                <h1 className="main2-dash">Why need Dynamic QR & How to use it</h1>
            </div>
<div className="midcontent p-4 flex flex-col items-center gap-6 md:flex-row md:items-start md:justify-center">
  {/* Main Card */}
  <div className="card bg-base-100 w-full max-w-md rounded-2xl shadow-xl" style={{ backgroundColor: "#232D7F" }}>
    <div className="card-body">
      <h2 className="card-title sm:text-lg md:text-xl lg:text-2xl mb-4 text-left">Why Dynamic QR?</h2>
      <ul className="list-disc list-inside text-left space-y-4 sm:text-sm md:text-base lg:text-lg">
        <li>
          <span className="font-semibold">Real-time content updates without reprinting:</span>
          <span className="font-normal"> Change destination URLs and content instantly without reprinting physical codes.</span>
        </li>
        <li>
          <span className="font-semibold">Comprehensive tracking and analytics:</span>
          <span className="font-normal"> Get detailed scan metrics, user demographics, and engagement data for better campaign insights.</span>
        </li>
        <li>
          <span className="font-semibold">Centralized campaign management:</span>
          <span className="font-normal"> Control multiple QR campaigns from one dashboard with easy editing and organization tools.</span>
        </li>
      </ul>
    </div>
  </div>

  {/* Accordion (Collapse) */}
  <div className="collapse collapse-arrow bg-base-100 w-full max-w-md rounded-2xl shadow-lg" style={{ backgroundColor: "#232D7F" }}>
    <input type="radio" name="my-accordion-2" />
    <div className="collapse-title font-semibold sm:text-sm md:text-base lg:text-lg">
      How do I create an account?
    </div>
    <div className="collapse-content sm:text-sm md:text-base lg:text-lg text-left">
      Click the Login button in the top right corner and that should smoothly finish the process.
    </div>
  </div>
</div>

      
        </div>
        </>
    )

}

export default About