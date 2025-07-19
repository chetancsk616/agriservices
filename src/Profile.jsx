import React, { useState ,useEffect} from 'react';
import { data, useNavigate } from 'react-router-dom';
import './style.css';
import supabase from '/src/supabaseClient';

const Popup = ({ message, onClose, navigateTo }) => {
  const navigate = useNavigate();

  if (!message) return null;

  const handleClose = () => {
    onClose();
    if (navigateTo) {
      setTimeout(() => {
        navigate(navigateTo);
      }, 100);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-box">
        <p>{message}</p>
        <button onClick={handleClose}>OK</button>
      </div>
    </div>
  );
};



const Profile = () => {
  const navigate = useNavigate();
  const [popupMessage, setPopupMessage] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(localStorage.getItem('selectedPage') || "0");
  const [popupNav, setPopupNav] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ phone: '', role: '', display_name: '' });
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setPopupMessage('Please login to view your Profile.');
        setPopupNav("/main/3");
        setLoading(false);
        return;
      }      
      if (authError) setPopupMessage('Error fetching user:', error.message);
      else {
        setUser(user);
        setFormData({
          phone: user.user_metadata.phone || '',
          role: user.user_metadata.role || '',
          display_name: user.user_metadata.display_name || '',
        });
        setLoading(false);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedPage', selectedPage);
  }, [selectedPage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = async () => {
    if (isEditing) {
      const { error } = await supabase.auth.updateUser({
        data: {
          phone: formData.phone,
          role: formData.role,
          display_name: formData.display_name
        }
      });
    
      if (error) {
        setPopupMessage("Failed to update: " + error.message);
      } else {
        setPopupMessage("Updated successfully!");
      }
    }
    setIsEditing(!isEditing);    
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setPopupMessage('Logout error: ' + error.message);
    } else {
      setPopupMessage('Logged out successfully');
      setPopupNav("/main/0");
    }
  };

  if (loading) return <div>Loading user...</div>;

  const renderContent = () => {
    switch (selectedPage) {
      case "1":
        return(
        <div className="card2">
          
        </div>
      );
      case "2":
        return(
        <div className="card2">
          <a href='#'>link</a>
        </div>
      );
      case "3":
        return(
        <div className="card2">
          <iframe className='card2' src="https://docs.google.com/forms/d/e/1FAIpQLSdZggXPk6MsmU4cDaUjHLWMH2Pwg8lw1MFHtvd56DROLL0Xfw/viewform?usp=header"></iframe>
        </div>
      );
      case "4":
        return(
        <div className="card2">
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded">
            Logout
          </button>
        </div>
      );
      default:
        return (
          <div className="card2">
            <input type="text" value={user.email} readOnly />
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <input
              type="text"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              readOnly={!isEditing}
            />
            <button onClick={handleEditToggle}>
              {isEditing ? 'Submit' : 'Edit'}
            </button>
          </div>
        );
    }
  };

  return (
    <div className='profile'>
      <div className="sidebar">
        <button
          type="button"
          style={{ width: "fit-content", backgroundColor: "rgba(255, 255, 255, 0)" }}
          onClick={() => navigate("/main/0")}
        >
          <span style={{ color:"#e0e0e0" }}>&larr;</span>
        </button>
        <button value="0" onClick={(e) => setSelectedPage(e.target.value)} id="1">Personal Info</button>
        <button value="1" onClick={(e) => setSelectedPage(e.target.value)} id="2">Privacy Settings</button>
        <button value="2" onClick={(e) => setSelectedPage(e.target.value)} id="3">Reset Password</button>
        <button value="3" onClick={(e) => setSelectedPage(e.target.value)} id="4">Feedback/ Review</button>
        <button value="4" onClick={(e) => setSelectedPage(e.target.value)} id="5">LogOut</button>
      </div>
      <div id="app">
        {renderContent()}
      </div>
      <Popup
        message={popupMessage}
        onClose={() => {
          setPopupMessage('');
          setPopupNav(null);
        }}
        navigateTo={popupNav}
      />

    </div>
  );
};

export default Profile;
