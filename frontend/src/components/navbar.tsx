import { Link } from "react-router-dom"
import { GoogleLogin } from '@react-oauth/google';
import '../style/navbar.css'; // Import the CSS file
import logoProduct from "../assets/images/logo-product.png"
import brandName from "../assets/images/brandname.png"
import Cookies from "js-cookie";
import axios from "axios";
import { useState,useEffect } from "react";


function Navbar() {
  const [isLoggedIn,setIsLoggedIn] = useState(false)
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (CredentialResponse: any) => {
    try {
      const response = await axios.post(
        `https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/signUpGoogle`,
        { token: CredentialResponse.credential },
        { withCredentials: true }
      );

      Cookies.set('token', response.data.token_jwt, { path: '/' });
      setIsLoggedIn(true);
      console.log("Login successful:", response);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    setIsLoggedIn(false);
    console.log("Logged out");
  };

  console.log(setIsLoggedIn)
  return (
    <nav className="navbar-main-container">
      <div className='navbar-container'>
        <div className="page-nav">
            <div className="logo-container">    
                <img className="logo-product" src={logoProduct}/>
                <img className="brand-name" src={brandName}/>
            </div>
            <Link className="nav" to={"/"}>Home</Link>
            <Link className="nav" to={"/dashboard"}>Dashboard</Link>
            <Link className="nav" to={"/profile"}>Profile</Link>
        </div>
        <div className="auth-nav"> 

            {
                isLoggedIn?(
                    <button className="log-out-button" onClick={handleLogout}>
                        Log Out
                    </button>
                ):(        
                    <GoogleLogin
                        onSuccess={handleLogin}
                        onError={() => console.log("Login Failed")}
                    />
                )
            }
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
