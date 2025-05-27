import './App.css'
import React, { useState, useRef , useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link , useNavigate} from 'react-router-dom';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const predefinedLogos = [
  {
    name: 'Google (Transparent)',
    url: 'https://logo.arkagme.biz/api/shares/logo-1748280593119-urax1yn9/files/22675f81-6959-41ad-bd13-1c74aa31b9ce?display=true'
  },
  {
    name: 'Instagram',
    url: 'https://logo.arkagme.biz/api/shares/logo-1748281069815-cjcucz5x/files/91d2d57e-8098-4766-bcba-c4a44af5c68a?display=true'
  },
  {
    name: 'X (Twitter)',
    url: 'https://logo.arkagme.biz/api/shares/logo-1748281316345-f7s469iu/files/a88604c0-cb67-4457-a65e-abc1fe7bbcd5?display=true'
  },
  {
    name: 'Facebook',
    url: 'https://logo.arkagme.biz/api/shares/logo-1748281584570-jnykwep8/files/ecd8e16e-b6ad-4a16-8ee7-96881e49bc67?display=true'
  }
];

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
  const [userLogos, setUserLogos] = useState([]);
  const [selectedLogo, setSelectedLogo] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [authChecking, setAuthChecking] = useState(false);
  const [showLogoPopup, setShowLogoPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedUserLogo, setSelectedUserLogo] = useState(null);
  const allLogos = [...predefinedLogos, ...userLogos];

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
      if (qrData && qrData.isDynamic && qrRef.current) {
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

  // Fetch user logos when component mounts or when withLogo changes
  useEffect(() => {
    if (authStatus && withLogo) {
      fetchUserLogos();
    }
  }, [authStatus,withLogo]);

  useEffect(() => {
  checkAuth(false); // Pass false to avoid login prompt
}, []);

  const fetchUserLogos = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/userlogos`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const formattedLogos = response.data.logos.map((logo, index) => ({
          name: `My Logo ${index + 1}`,
          url: logo.url,
          share_id: logo.share_id,
          isUserUploaded: true
        }));
        setUserLogos(formattedLogos);
      }
    } catch (error) {
      console.error('Error fetching user logos:', error);
    }
  };

  const deleteUserLogo = async (shareId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/userlogos/${shareId}`, {
        withCredentials: true
      });
      
      if (response.status === 200) {
        // Remove the deleted logo from state
        setUserLogos(prev => prev.filter(logo => logo.share_id !== shareId));
        
        // If the deleted logo was selected, clear the selection
        if (selectedLogo === selectedUserLogo?.url) {
          setSelectedLogo('');
        }
        
        setShowLogoPopup(false);
        setSelectedUserLogo(null);
        alert('Logo deleted successfully!');
      }
    } catch (error) {
      console.error('Error deleting logo:', error);
      alert('Failed to delete logo');
    }
  };

const handleLogoClick = (logo, event) => {
  if (logo.isUserUploaded) {
    const rect = event.target.getBoundingClientRect();
    const popupWidth = 160; // Set to your popup's width (in px)
    const popupHeight = 80; // Set to your popup's height (in px)
    const gap = 10; // Space between logo and popup

    // Center popup horizontally over the logo
    let x = rect.left + rect.width / 2 - popupWidth / 2 + window.scrollX;

    // Make sure popup doesn't go off the screen horizontally
    x = Math.max(8, Math.min(x, window.innerWidth - popupWidth - 8));

    // Always position above the logo
    const y = rect.top - popupHeight - gap + window.scrollY;

    setPopupPosition({ x, y, popupWidth, logoCenter: rect.left + rect.width / 2 + window.scrollX });
    setSelectedUserLogo(logo);
    setShowLogoPopup(true);
  } else {
    setSelectedLogo(logo.url);
  }
};


  const handleAcceptLogo = () => {
    if (selectedUserLogo) {
      setSelectedLogo(selectedUserLogo.url);
    }
    setShowLogoPopup(false);
    setSelectedUserLogo(null);
  };

  const handleDeleteLogo = () => {
    if (selectedUserLogo && selectedUserLogo.share_id) {
      deleteUserLogo(selectedUserLogo.share_id);
    }
  };

const checkAuth = async (requireAuth = true) => {
  setAuthChecking(true);
  try {
    await axios.get(`${API_BASE_URL}/me`, { 
      withCredentials: true 
    });
    setAuthStatus(true);
    return true;
  } catch (error) {
    setAuthStatus(false);
    if (requireAuth) {
      alert('Please log in to access this feature.');
    }
    return false;
  } finally {
    setAuthChecking(false);
  }
};


  const handleDynamicChange = async () => {
  const isAuthenticated = await checkAuth(true);
  if (isAuthenticated) {
    setIsDynamic(prev => !prev);
  } else {
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
      logoImg.src = selectedLogo || predefinedLogos[0].url;
      //https://iili.io/39yM50u.md.png
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


  const handleHistoryClick = async (e) => {
  e.preventDefault();
  const isAuthenticated = await checkAuth(true);
  if (isAuthenticated) {
    navigate('/history');
  }
};

 const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file
    if (file.type !== 'image/png') {
      alert('Only PNG files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    e.target.value = '';

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post(
        `${API_BASE_URL}/uploadlogo`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        await fetchUserLogos();
        alert('Logo uploaded successfully!');
    }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Logo upload failed');
    } finally {
      setIsUploading(false);
    }
  };

 useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLogoPopup && !event.target.closest('.logo-popup')) {
        setShowLogoPopup(false);
        setSelectedUserLogo(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLogoPopup]);



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
            <li>
            <Link to="/history" onClick={handleHistoryClick} className="text-lg">
              History
            </Link></li>
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
            {withLogo && (
                  <div className="logo-selection-panel mt-4 p-4 border rounded-lg relative">
                      <h3 className="text-md font-semibold mb-2">Select Logo:</h3>
      
                      <div className="logo-grid grid grid-cols-5 gap-4 mb-4 max-h-40 overflow-y-auto">
                        {allLogos.map((logo, index) => (
                          <div 
                            key={index}
                            className={`logo-item p-1 border-2 cursor-pointer relative ${
                            selectedLogo === logo.url ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={(event) => handleLogoClick(logo, event)}
                    >
                      <img 
                        src={logo.url} 
                        alt={logo.name} 
                        className="w-full h-12 object-contain"
                        crossOrigin="anonymous"
                      />
                      {/* User logo indicator */}
                      {logo.isUserUploaded && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                  </div>

                <input 
                    type="file"
                    id="logo-upload"
                    accept="image/png"
                    className="hidden"
                    onChange={handleLogoUpload}
                />
      
                <button
                type="button"
                  onClick={async () => {
                  const isAuthenticated = await checkAuth(true);
                  if (isAuthenticated) {
                    document.getElementById('logo-upload').click();
                  }
              }}
                className="btn btn-outline btn-sm w-full"
                disabled={isUploading}
                >
                {isUploading ? 'Uploading...' : 'Upload Own Logo (PNG <5MB)'}
              </button>

              {/* Logo Popup */}
              {showLogoPopup && selectedUserLogo && (
                <div
                  className="logo-popup fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-3"
                  style={{
                    left: `${popupPosition.x}px`,
                    top: `${popupPosition.y}px`,
                    width: `${popupPosition.popupWidth}px`,
                    minWidth: '120px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <button onClick={handleAcceptLogo} className="btn btn-sm btn-primary w-full text-xs py-1">Accept</button>
                    <button onClick={handleDeleteLogo} className="btn btn-sm btn-error w-full text-xs py-1">Delete</button>
                  </div>
                  {/* Arrow at the bottom center */}
                  <div
                    className="logo-popup-arrow"
                    style={{
                      position: 'absolute',
                      left: '50%',
                      bottom: '-10px',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '10px solid transparent',
                      borderRight: '10px solid transparent',
                      borderTop: '10px solid #fff', // match popup background
                      filter: 'drop-shadow(0 1px 2px #d1d5db)', // subtle shadow
                    }}
                  />
                </div>
              )}

              </div>
              )}
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
                    src: selectedLogo || predefinedLogos[0].url,
                    //https://iili.io/39yM50u.md.png
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
