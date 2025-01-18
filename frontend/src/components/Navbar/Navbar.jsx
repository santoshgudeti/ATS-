import React, { useRef,useEffect, useState } from "react";
import SMlogo from "../../assets/SMlogo.png";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Navbar.css";
import axios from "axios";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBriefcase, faUser } from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ setResponseData , userDetails }) => {
  console.log("userdetails",userDetails);

 useEffect(() => {
  if (userDetails !==undefined) {
    console.log("UserDetails are :",userDetails);
      
    }
  }, [userDetails]);

  const fileInputRef = useRef(null);
  const jobFileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedJobFiles, setSelectedJobFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showJDButtons, setShowJDButtons] = useState(true); // State to toggle button sets


  const handleToggleSwitch = () => setShowJDButtons(!showJDButtons); // Toggle the button set
  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log("Selected resumes:", files.map((file) => file.name));
    setSelectedFiles(files);
  };
 
  const handleJobFileSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log("Selected job descriptions:", files.map((file) => file.name));
    setSelectedJobFiles(files);
  };

  const handleUploadClick = () => {
    console.log("Opening file selection dialog for resumes.");
    fileInputRef.current.click();
  };

  const handleJobUploadClick = () => {
    console.log("Opening file selection dialog for job descriptions.");
    jobFileInputRef.current.click();
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
    console.log("Toggling profile menu. Now:", !showProfileMenu);
  };

  
  
const handleSubmitFile= async () =>{
  if (selectedFiles.length === 0 )  {
    toast.error("Please select resumes", {
           position: "top-center",
    });
  
   console.log("Submission failed: Missing files.");
   return;
 }

 console.log("Submitting files. Resumes:", selectedFiles);

}
  const handleSubmitFiles = async () => {
    if (!selectedFiles.length || !selectedJobFiles.length) {
       toast.error("Please select both resumes and job descriptions.", {
              position: "top-center",
       });
     
      console.log("Submission failed: Missing files.");
      return;
    }

    setLoading(true);
    console.log("Submitting files. Resumes:", selectedFiles, "Job Descriptions:", selectedJobFiles);
    try {
      const formData = new FormData();

      // Append all selected resumes and job descriptions directly
      selectedFiles.forEach((file) => formData.append("resumes", file));
      selectedJobFiles.forEach((file) =>
        formData.append("job_description", file)
      );

      // Make API request
      const response = await axios.post(
        "http://localhost:5000/api/submit",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Response received from server:", response.data);

      // Update response data if valid results are returned
      setResponseData({ results: response.data?.results || [], duplicateCount: response.data?.duplicateCount || 0 });

      console.log("responseDATA is", response.data);
    } catch (error) {
      console.error("Error submitting files:", error.message);
      toast.error(`An error occurred during submission. Please try again.`, {
              position: "top-center",
            });
    } finally {
      setLoading(false);
      console.log("File submission process completed.");
    }
  };

 
  return (
      <nav className="navbar navbar-expand-lg navbar-light">
        <ToastContainer/>
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={SMlogo} alt="Logo" className="navbar-logo" />
          </a>
  
          <div className="navbar-collapse justify-content-center">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            
                
            
               {/* JD Buttons */}
            {showJDButtons && (
              <>
              <li className="nav-item">
                <button className="upload-job-button" onClick={handleJobUploadClick}>
                  Upload Job Description
                </button>
              </li>
              <button className="upload-resume-button" onClick={handleUploadClick}>
                  Upload Resumes
                </button>
              <li className="nav-item">
                
                <button
                  className="submit-job-button "
                  onClick={handleSubmitFiles}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Loading...
                    </>
                  ) : (
                    "Submit Job"
                  )}
                </button>
              </li>
              <li className="nav-item">
               
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf"
                />
                <input
                  type="file"
                  ref={jobFileInputRef}
                  style={{ display: "none" }}
                  onChange={handleJobFileSelect}
                  
                  accept=".pdf"
                />
              </li>
              </>
            )}
              {/* No JD Buttons */}
            {!showJDButtons && (
              <>
                <button className="upload-resume-button" onClick={handleUploadClick}>
                  Upload Resumes
                </button>
              <li className="nav-item">
                
                <button
                  className="submit-job-button "
                  onClick={handleSubmitFile}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Loading...
                    </>
                  ) : (
                    "Submit Job"
                  )}
                </button>
              </li>
              <li className="nav-item">
               
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf"
                />
              </li>
              </>
            )}
            {/* Right: Toggle Switch */}
        <div className="d-flex toggleswitch ">
        <span className="ms-1">
            {showJDButtons ? (
              <>
                <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                JD Mode
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUser} className="me-1" />
                No JD Mode
              </>
            )}
          </span>
        <label className="form-check px-5 form-switch mb-0">
        
          <input
            className="form-check-input"
            type="checkbox"
            checked={!showJDButtons}
            onChange={handleToggleSwitch}
            style={{ cursor: "pointer" }}
          />
          
        </label>
      </div>
            </ul>
            
          </div>
          
          <div className="profile-container" onClick={toggleProfileMenu}>
            <span className="profile">
              <FaUser style={{ marginRight: "10px" }} />
              Profile
            </span>
            {showProfileMenu && (
              <div className="profile-menu">
                <ul>
                  <li>
                  <FaUser /> Name: {userDetails?.name || "N/A"}
                  </li>
                  <li>
                  <FaEnvelope /> Email: {userDetails?.email || "N/A"}
                  </li>
                  <li>
                    <FaPhone /> Contact: +1234567890
                  </li>
                  <li>
                    <FaBuilding /> Company: Example Inc.
                  </li>
                  <li>
                    <FaCog /> Settings
                  </li>
                  <li onClick={handleSignOut}>
                <FaSignOutAlt /> Sign Out
              </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  };
  
  
  export default Navbar;
  




/*   
This code is working dont disturb it 
import React, { useRef, useState } from "react";
import SMlogo from "../../assets/SMlogo.png";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Navbar.css";
import axios from "axios";

const Navbar = ({ setResponseData }) => {
  const fileInputRef = useRef(null);
  const jobFileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedJobFiles, setSelectedJobFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log("Selected resumes:", files.map((file) => file.name));
    setSelectedFiles(files);
  };

  const handleJobFileSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log("Selected job descriptions:", files.map((file) => file.name));
    setSelectedJobFiles(files);
  };

  const handleUploadClick = () => {
    console.log("Opening file selection dialog for resumes.");
    fileInputRef.current.click();
  };

  const handleJobUploadClick = () => {
    console.log("Opening file selection dialog for job descriptions.");
    jobFileInputRef.current.click();
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
    console.log("Toggling profile menu. Now:", !showProfileMenu);
  };

  const handleSubmitFiles = async () => {
    if (!selectedFiles.length || !selectedJobFiles.length) {
      alert("Please select both resumes and job descriptions.");
      console.log("Submission failed: Missing files.");
      return;
    }

    setLoading(true);
    console.log("Submitting files. Resumes:", selectedFiles, "Job Descriptions:", selectedJobFiles);
    try {
      const formData = new FormData();

      // Append all selected resumes and job descriptions directly
      selectedFiles.forEach((file) => formData.append("resumes", file));
      selectedJobFiles.forEach((file) =>
        formData.append("job_description", file)
      );

      // Make API request
      const response = await axios.post(
        "http://localhost:5000/api/submit",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("Response received from server:", response.data);

      // Update response data if valid results are returned
      setResponseData(response.data?.results || []);
    } catch (error) {
      console.error("Error submitting files:", error.message);
      alert("An error occurred during submission. Please try again.");
    } finally {
      setLoading(false);
      console.log("File submission process completed.");
    }
  };
 const [userDetails, setUserDetails] = useState({ name: '', email: '' });
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log("Retrieved token:", token); // Debugging token
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get("http://localhost:5000/api/user", config);
          console.log("User Details:", response.data);

          console.log("User details API response:", response.data); // Debugging response
          setUserDetails({ name: response.data.name, email: response.data.email });
        } else {
          console.log("No token found in localStorage.");
        }
      } catch (error) {
        
        console.error("Error fetching user details:", error);
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem('token');
          alert("Session expired. Please sign in again.");
        }
        
       
      }
    };
    fetchUserDetails();
  }, []);
  

  return (
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <img src={SMlogo} alt="Logo" className="navbar-logo" />
          </a>
  
          <div className="navbar-collapse">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button className="upload-job-button" onClick={handleJobUploadClick}>
                  Upload Job Description
                </button>
              </li>
              <button className="upload-resume-button" onClick={handleUploadClick}>
                  Upload Resumes
                </button>
              <li className="nav-item">
                <button
                  className="submit-job-button "
                  onClick={handleSubmitFiles}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>
                      Loading...
                    </>
                  ) : (
                    "Submit Job"
                  )}
                </button>
              </li>
              <li className="nav-item">
               
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                  multiple
                  accept=".pdf"
                />
                <input
                  type="file"
                  ref={jobFileInputRef}
                  style={{ display: "none" }}
                  onChange={handleJobFileSelect}
                  
                  accept=".pdf"
                />
              </li>
            </ul>
          </div>
  
          <div className="profile-container" onClick={toggleProfileMenu}>
            <span className="profile">
              <FaUser style={{ marginRight: "10px" }} />
              Profile
            </span>
            {showProfileMenu && (
              <div className="profile-menu">
                <ul>
                  <li>
                    <FaUser /> Name: Ganga
                  </li>
                  <li>
                    <FaEnvelope /> Email: ganga@example.com
                  </li>
                  <li>
                    <FaPhone /> Contact: +1234567890
                  </li>
                  <li>
                    <FaBuilding /> Company: Example Inc.
                  </li>
                  <li>
                    <FaCog /> Settings
                  </li>
                  <li>
                    <FaSignOutAlt /> Sign Out
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </nav>
    );
  };
  
  export default Navbar;
  



*/