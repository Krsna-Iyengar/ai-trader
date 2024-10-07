import './Account.css';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Account({ darkMode }) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Center the container on the screen when it first loads
  useEffect(() => {
    const container = containerRef.current;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Calculate center position
    const top = (screenHeight - containerHeight) / 2;
    const left = (screenWidth - containerWidth) / 2;

    // Set the initial position
    setPosition({ top, left });
  }, []);

  const handleMouseDown = (e) => {
    const container = containerRef.current;
    setIsDragging(true);
    setOffset({
      x: e.clientX - container.offsetLeft,
      y: e.clientY - container.offsetTop,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      top: e.clientY - offset.y,
      left: e.clientX - offset.x,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', email: '', profile_pic: '', bio: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      navigate('/login');
      return;
    }
  
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched user data:', data.profile_pic);  // Debugging log
          const proPic = data.profile_pic
          setUserData(data);
        } else {
          console.error('Failed to fetch user data:', response.status);
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };
  
    fetchUserData();
  }, [navigate]);
  

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setPasswords({ password: '', confirmPassword: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUserData({ ...userData, profile_pic: URL.createObjectURL(file) }); // Temporarily show the uploaded image
    }
  };

  const handleSave = async () => {
    if (passwords.password && passwords.password !== passwords.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    const token = localStorage.getItem('token');
    let profilePicPath = userData.profile_pic;

    if (selectedFile) {
      const formData = new FormData();
      formData.append('profile_pic', selectedFile);

      try {
        const response = await fetch('http://localhost:5000/api/users/me/profile-pic', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          profilePicPath = `http://localhost:5000${data.profile_pic}`;
          console.log('Profile picture uploaded:', data);  // Debugging log
        } else {
          console.error('Failed to upload profile picture:', response.status);
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }

    const updatedData = {
      ...userData,
      profile_pic: profilePicPath, // Use updated or existing profile pic
    };

    try {
      const response = await fetch('http://localhost:5000/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
        console.log('User data updated:', data);  // Debugging log
        setIsEditing(false);
      } else {
        console.error('Failed to update user data:', response.status);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  if (!userData || userData === "undefined") {
    return null;
  }

  return (
    <div className={`account-container mt-5 ${darkMode ? 'dark-mode' : ''}`}
      ref={containerRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      >
      <h1>Account Information</h1>
      {isEditing ? (
        <div className="account-edit-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={userData.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile_pic">Profile Picture</label>
            <input type="file" id="profile_pic" onChange={handleFileChange} />
            {userData.profile_pic && (
              <img
                src={userData.profilePic} 
                alt="Profile"
                className="profile-pic"
              />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={userData.bio}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={passwords.password}
              onChange={handlePasswordChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
            />
          </div>

          <button onClick={handleSave} className="btn btn-save">
            Save Changes
          </button>
          <button onClick={handleEditToggle} className="btn btn-cancel">
            Cancel
          </button>
        </div>
      ) : (
        <div className="account-details">
          {userData.profile_pic && (
            <img
              src={userData.profile_pic}
              alt="Profile"
              className="profile-pic"
            />
          )}
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>Bio:</strong> {userData.bio}</p>
          <button onClick={handleEditToggle} className="btn btn-edit">
            Edit
          </button>
        </div>
      )}
    </div>
  );
}

export default Account;
