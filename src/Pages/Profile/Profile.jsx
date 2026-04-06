import { useState, useEffect } from "react";
import "./Profile.css";

function Profile() {
  const [profileData, setProfileData] = useState({
    profilePicture: "",
    phoneNo: "",
    college: "",
    department: "",
    role: "",
  });

  const [preview, setPreview] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("profileData");
    if (savedData) {
      const data = JSON.parse(savedData);
      setProfileData(data);
      setPreview(data.profilePicture);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
    setIsSaved(false);
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({
          ...profileData,
          profilePicture: reader.result,
        });
        setPreview(reader.result);
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    // Validate fields
    if (!profileData.phoneNo || !profileData.college || !profileData.department || !profileData.role) {
      alert("Please fill in all fields");
      return;
    }

    // Save to localStorage
    localStorage.setItem("profileData", JSON.stringify(profileData));
    setIsSaved(true);

    // Show success message for 3 seconds
    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  return (
    <div className="profile-page">
      <h2>User Profile</h2>
      <p className="subtitle">Manage your profile information</p>

      <div className="profile-container">
        <div className="profile-card">
          {/* Profile Picture Section */}
          <div className="profile-picture-section">
            <div className="picture-frame">
              {preview ? (
                <img src={preview} alt="Profile" className="profile-pic" />
              ) : (
                <div className="no-pic">📷</div>
              )}
            </div>
            <label htmlFor="pic-input" className="upload-btn">
              Upload Photo
              <input
                id="pic-input"
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                disabled={false}
                style={{ display: "none" }}
              />
            </label>
            <p className="pic-hint">JPG, PNG or GIF (Max 5MB)</p>
          </div>

          {/* Form Section */}
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="phoneNo">Phone Number</label>
              <input
                type="tel"
                id="phoneNo"
                name="phoneNo"
                placeholder="Enter your phone number"
                value={profileData.phoneNo}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="college">College/University</label>
              <input
                type="text"
                id="college"
                name="college"
                placeholder="Enter your college name"
                value={profileData.college}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                type="text"
                id="department"
                name="department"
                placeholder="Enter your department"
                value={profileData.department}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                name="role"
                value={profileData.role}
                onChange={handleInputChange}
              >
                <option value="">Select a role</option>
                <option value="Student">Student</option>
                <option value="Researcher">Researcher</option>
                <option value="Professor">Professor</option>
                <option value="Lab Technician">Lab Technician</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="button-section">
          <button className="save-btn" onClick={handleSaveProfile}>
            Save Profile
          </button>
          {isSaved && <p className="success-msg">Profile saved successfully</p>}
        </div>
      </div>
    </div>
  );
}

export default Profile;
