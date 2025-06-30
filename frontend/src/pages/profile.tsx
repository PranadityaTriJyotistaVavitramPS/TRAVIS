import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../style/profile.css"

function Profile(){
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [Name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [idDevice, setIdDevice] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [userEvidence, setUserEvidence] = useState<any[]>([]);
  
  const getToken = () => {
    return Cookies.get('token');  
  };

  // Fetch data pengguna
  const fetchUserData = async () => {
    const token = getToken(); 

    if (!token) {
      console.log("No token found");
      return;
    }

    const response = await fetch(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/infoUser`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (data && data.message === 'sukses') {
      setUserData(data.data);  

      setName(data.data.nama_lengkap || '');
      setMobile(data.data.nomor_telepon || '');
      setEmail(data.data.email || '');
      setIdDevice(data.data.device_id || '');
      setAddress(data.data.alamat || '');
      setState(data.data.kode_pos || '');
      setCountry(data.data.negara || '');
      setRegion(data.data.provinsi || '');
    }
  };

  const fetchUserEvidence = async () => {
    const token = getToken(); 

    if (!token) {
      console.log("No token found");
      return;
    }

    const response = await fetch(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/photos/takeuserEvidence`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (response.status === 200) {
      setUserEvidence(data.data);  
    }

    ;
  }

  // Memanggil fetchUserData saat komponen pertama kali dimuat
  useEffect(() => {
    const token = getToken();
    if (!token) {
        navigate("/dashboard"); 
        return;
    }

    fetchUserData();
    fetchUserEvidence();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    const token = getToken(); 

    if (!token) {
      console.log("No token found");
      return;
    }

    // Mengirim data untuk update
    const response = await fetch(`https://${import.meta.env.VITE_BACKEND_DOMAIN}/api/v1/users/updateProfile`, {
      method: 'PUT',  // Menggunakan PUT untuk memperbarui data
      headers: {
        'Authorization': `Bearer ${token}`,  // Mengirim token di header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nama_lengkap: Name,
        nomor_telepon: mobile,
        alamat: address,
        device_id: idDevice,
        kode_pos: state,
        email: email,
        negara: country,
        provinsi: region,
        token_data: token
      })
    });

    const data = await response.json();
    if (data.message === 'sukses') {
      // Setelah berhasil, kamu bisa memperbarui UI atau memberi tahu pengguna
      alert('Profile updated successfully!');
    } else {
      alert('Failed to update profile');
    }

  };


    return(
        <>
          <div className="profile-main-container">
            <div className="profile-container">
              <div className="profile-row">
                  <div className="profile-sidebar">
                    <div className="profile-picture-section">
                        <img
                        className="profile-picture"
                        src={
                            userData?.profile_picture ||
                            "https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
                        }
                        width="150px"
                        />
                        <span className="profile-name">{userData?.nama_lengkap || "Name"}</span>
                        <span className="profile-email">{userData?.email || "Email"}</span>
                    </div>
                    </div>

                    <div className="profile-content">
                      <div className="profile-header">
                          <h4>User Profile</h4>
                      </div>

                      <div className="profile-group">
                          <label className="profile-label">Name</label>
                          {isEditing ? (
                          <input type="text" className="profile-input" value={Name} onChange={(e) => setName(e.target.value)} />
                          ) : (
                          <p className="profile-value">{Name}</p>
                          )}
                      </div>

                      <div className="profile-group">
                          <label className="profile-label">Mobile Number</label>
                          {isEditing ? (
                          <input type="text" className="profile-input" value={mobile} onChange={(e) => setMobile(e.target.value)} />
                          ) : (
                          <p className="profile-value">{mobile}</p>
                          )}
                      </div>

                      <div className="profile-group">
                          <label className="profile-label">Device Id</label>
                          {isEditing ? (
                          <input type="text" className="profile-input" value={idDevice} onChange={(e) => setIdDevice(e.target.value)} />
                          ) : (
                          <p className="profile-value">{idDevice}</p>
                          )}
                      </div>

                      <div className="profile-group">
                          <label className="profile-label">Address Line</label>
                          {isEditing ? (
                          <input type="text" className="profile-input" value={address} onChange={(e) => setAddress(e.target.value)} />
                          ) : (
                          <p className="profile-value">{address}</p>
                          )}
                      </div>

                      <div className="profile-group">
                          <label className="profile-label">Postal Code</label>
                          {isEditing ? (
                          <input type="text" className="profile-input" value={state} onChange={(e) => setState(e.target.value)} />
                          ) : (
                          <p className="profile-value">{state}</p>
                          )}
                      </div>

                      <div className="profile-group">
                          <label className="profile-label">Email Address</label>
                          {isEditing ? (
                          <input type="text" className="profile-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                          ) : (
                          <p className="profile-value">{email}</p>
                          )}
                      </div>

                      <div className="profile-group-inline">
                          <div className="profile-group">
                          <label className="profile-label">Country</label>
                          {isEditing ? (
                              <input type="text" className="profile-input" value={country} onChange={(e) => setCountry(e.target.value)} />
                          ) : (
                              <p className="profile-value">{country}</p>
                          )}
                          </div>
                          <div className="profile-group">
                          <label className="profile-label">State/Region</label>
                          {isEditing ? (
                              <input type="text" className="profile-input" value={region} onChange={(e) => setRegion(e.target.value)} />
                          ) : (
                              <p className="profile-value">{region}</p>
                          )}
                          </div>
                      </div>

                      <div className="profile-button-wrapper">
                          {isEditing ? (
                          <button className="btn-save" onClick={handleSave}>
                              Save Profile
                          </button>
                          ) : (
                          <button className="btn-edit" onClick={() => setIsEditing(true)}>
                              Edit Profile
                          </button>
                          )}
                      </div>

                    <h2>Your Photo Evidence</h2>

                    <div className="photo-evidence-container">
                        {userEvidence.length > 0 ? (
                            userEvidence.map((evidence, index) => (
                                <div key={index} className="evidence-item">
                                    <img src={evidence.url} alt={`Evidence ${index + 1}`} className="evidence-image" />
                                    <p className="evidence-info">Lat: {evidence.latitude}, Lng: {evidence.longitude}</p>
                                    <p className="evidence-time">{new Date(evidence.date).toLocaleDateString('id-ID', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                            ))
                        ) : (
                            <p>No evidence found.</p>
                        )}
                    </div>

                  </div>
              </div>
            </div>
          </div>
        
        </>
    )
}


export default Profile