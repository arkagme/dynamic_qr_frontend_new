import './App.css'
import React, { useState, useRef , useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const QRGenerator = () =>  {
  const [url, setUrl] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [withLogo, setWithLogo] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const qrRef = useRef();
  const [qrRendered, setQrRendered] = useState(false);
  const [displayQrValue, setDisplayQrValue] = useState('https://example.com');
  const [isGenerated, setIsGenerated] = useState(false);
  const navigate = useNavigate();


  const handleLogin = () => {
  window.location.href = `${API_BASE_URL}/login/federated/google`;
    };

  const handleLogout = async () => {
  await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
  window.location.href = '/';
    };

  useEffect(() => {
    if (!isGenerated) {
      if (url.trim()) {
        setDisplayQrValue(url);
      } else {
        setDisplayQrValue('https://example.com'); // Default placeholder when empty
      }
    }
  }, [url, isGenerated]);

  useEffect(() => {
    const saveQRAfterRender = async () => {
      if (qrData && qrRef.current) {
        try {
          await saveQRCode(qrData.trackingId || 'qrcode');
        } catch (error) {
          console.error('Error saving QR code after render:', error);
        }
      }
    };

    if (qrData) {
      // delay to ensure the QR is fully rendered
      const timer = setTimeout(() => {
        setQrRendered(true);
        saveQRAfterRender();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [qrData]);

  const handleDynamicChange = async () => {
    try {
      await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });
      setIsDynamic(prev => !prev);
    } catch (err) {
      alert('Please log in to use dynamic QR codes.');
      setIsDynamic(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) return;
    
    setIsLoading(true);
    setQrRendered(false);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, {
        url,
        isDynamic,
        withLogo
      }, {withCredentials: true });
      
      setQrData(response.data);
      setDisplayQrValue(response.data.url);
      setIsGenerated(true); // Mark as generated for download ability

    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCodeImage = () => {
    return new Promise((resolve, reject) => {
      if (!qrRef.current) {
        console.error("QR ref state:", qrRef.current);
        reject(new Error('QR Code reference not available'));
        return;
      }
      const svg = qrRef.current;
      const svgData = new XMLSerializer().serializeToString(svg);

      const canvas = document.createElement("canvas");
      canvas.width = 400;  
      canvas.height = 400;
      
      const ctx = canvas.getContext("2d");
      

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const img = new Image();
      const logoImg = new Image();
      logoImg.crossOrigin = "anonymous";
      logoImg.src = "https://iili.io/39yM50u.md.png";
      
      Promise.all([
        new Promise((innerResolve) => {
          img.onload = innerResolve;
          img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
        }),
        withLogo ? new Promise((innerResolve) => {
          logoImg.onload = innerResolve;
        }) : Promise.resolve()
      ]).then(() => {
   
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        

        if (withLogo) {
          const logoSize = 70; 
          const centerX = (canvas.width - logoSize) / 2;
          const centerY = (canvas.height - logoSize) / 2;
          ctx.drawImage(logoImg, centerX, centerY, logoSize, logoSize);
        }
        
        const imageData = canvas.toDataURL("image/png", 1.0);
        resolve(imageData);
      }).catch((error) => {
        reject(error);
      });
    });
  };

  const saveQRCode = async (fileName) => {
    try {
      console.log('Attempting to save QR code...');
      const imageData = await generateQRCodeImage();
      console.log('QR code image generated successfully');
      
      
      const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
      
     
      const response = await axios.post(`${API_BASE_URL}/saveImage`, {
        imageData: base64Data,
        fileName: `${fileName}.png`
      });
      
      setImagePath(response.data.path);
      console.log('QR code saved successfully at:', response.data.path);
      
      return response.data.path;
    } catch (error) {
      console.error('Error saving QR code:', error);
      alert('Failed to save QR code image');
      throw error;
    }
  };

  const downloadQRCode = async () => {
    try {
      const imageData = await generateQRCodeImage();
      
      const a = document.createElement("a");
      a.download = "qrcode.png";
      a.href = imageData;
      a.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Failed to download QR code");
    }
  };

  const checkAuth = async () => {
  try {
    await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });
    return true;
  } catch (error) {
    alert('Please log in to access history.');
    return false;
    }
  };

  const handleHistoryClick = async (e) => {
  e.preventDefault();
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) {
    navigate('/history');
  }
};



  return (
    <>
    <div className="app">
      <div className="navbar">
      <div className="navbar-start">
        <a href='/' className="btn btn-ghost text-4xl bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent border-none shadow-none" style={{ color: '#9D93E6' }}>QR</a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a>
          <Link to="/history" onClick={handleHistoryClick} className="text-lg">
          History
          </Link>
          </a></li>
          <li><a href='/about'className='text-lg '>About</a></li>
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
            <li><a href='/history' className='text-lg '>History</a></li>
            <li><a href='/about'className='text-lg '>About</a></li>
            <li><button type="button" onClick={handleLogout} className="btn btn-outline btn-error btn-sm w-24 mx-auto mt-2"
                    style={{ minWidth: '90px', fontSize: '0.95rem', padding: '0.55rem 0.6rem' }}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
    <div className="headerC">
      <a className="main1">Dynamic <span className="qrcode">QR Code</span> Generator</a>
      <h1 className="main2">Smart QR Codes for a Smarter Tomorrow</h1>
      <h1 className="main2">Instantly Edit, Track, Optimize, and Elevate Your Engagement in Real-Time.</h1>
    </div>
    <div className="cardholder">
      <div className="mainsection">
      <div className="firstsection">
            <form onSubmit={handleSubmit}>
            <legend className="fieldset-legend"  style={{ fontSize : "17px" ,   color : "#DEDEDF" }}>Enter URL</legend>
            <input 
              type="url" 
              id="url" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="Type here" 
              class="input input-lg"  
              required/>
            <legend class="fieldset-legend" style={{ marginTop : "12px" , fontSize : "16px" ,   color : "#DEDEDF" }}>Dynamic QR</legend>
            <label class="label">
              <input 
                type="checkbox"  
                class="checkbox checkbox-primary" 
                id="dynamic" 
                checked={isDynamic}
                onChange={handleDynamicChange} />Add analytics to QR code
            </label>
            <legend class="fieldset-legend" style={{ marginTop : "9px" , fontSize : "16px" ,   color : "#DEDEDF" }}>Add logo to QR</legend>
            <label class="label">
              <input 
                type="checkbox"  
                class="checkbox  checkbox-primary" 
                id="logo" 
                checked={withLogo} 
                onChange={() => setWithLogo(!withLogo)}/>Add logo to QR Code
            </label><br></br>
            <button  
              type="submit" 
              disabled={isLoading || !url} 
              className="btn btn-soft btn-lg btn-primary w-[320px] rounded-lg bg-[#151937] text-white" 
               style={{ marginTop : "20px"}}>{isLoading ? 'Generating...' : 'Generate QR Code'}</button>
          </form>
      </div>
      <div className="secondsection flex flex-col items-center">
              <QRCodeSVG
                ref={qrRef}
                value={displayQrValue}
                size={200}
                level="H"
                marginSize={4}
                imageSettings={
                  withLogo ? {
                    src: "https://iili.io/39yM50u.md.png",
                    excavate: true,
                    height: 35,
                    width: 35,
                  } : undefined
                }
              />
            <button  
                onClick={downloadQRCode}
                disabled={!isGenerated}
                className="btn btn-soft btn-lg btn-primary w-[320px] rounded-lg bg-[#1E6B38] text-white"  
                style={{ marginTop : "20px"}}>Download QR Code</button>
            <Link
              to={`/dashboard/${qrData?.trackingId}`}
              className="custom-analytics-btn btn btn-soft btn-lg btn-primary w-[320px] rounded-lg bg-[#151937] text-white"
              style={{ marginTop: "20px", pointerEvents: (!isGenerated || !isDynamic) ? "none" : "auto", opacity: (!isGenerated || !isDynamic) ? 0.5 : 1 }}
              aria-disabled={!isGenerated || !isDynamic}
              tabIndex={(!isGenerated || !isDynamic) ? -1 : 0}
            >
              View Analytics
            </Link>
      </div>
      </div>
    </div>
    </div>
    </>
  )
}

export default QRGenerator
