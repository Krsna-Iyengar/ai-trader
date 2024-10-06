import './Account.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Account() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({ name: '', email: '', profilePic: '', bio: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });

  useEffect(() => {
    // Fetch user data from backend
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

  const [selectedFile, setSelectedFile] = useState(null);

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setSelectedFile(file); // Store the file temporarily
    setUserData({ ...userData, profilePic: URL.createObjectURL(file) }); // Display the preview
  }
};

  
  

const handleSave = async () => {
    if (passwords.password && passwords.password !== passwords.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    const token = localStorage.getItem('token');
    let profilePicPath = userData.profilePic;
  
    if (selectedFile) {
      const formData = new FormData();
      formData.append('profilePic', selectedFile);
  
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
          profilePicPath = data.profile_pic; // Update the profile picture path
        } else {
          console.error('Failed to upload profile picture:', response.status);
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  
    const updatedData = {
      ...userData,
      profilePic: profilePicPath,
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
        setUserData(data); // Update state with new user data
        setIsEditing(false);
      } else {
        console.error('Failed to update user data:', response.status);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };
  

  if (!userData || userData === "undefined") {
    return null; // Render nothing if user data is not available
  }

  return (
    <div className="account-container">
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
            <label htmlFor="profilePic">Profile Picture</label>
            <input type="file" id="profilePic" onChange={handleFileChange} />
            {userData.profilePic && (
                <img
                    src={`http://localhost:5000${userData.profilePic}`} // Make sure this path is correct
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
          {userData.profilePic && (
            <img
              src={userData.profilePic}
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
