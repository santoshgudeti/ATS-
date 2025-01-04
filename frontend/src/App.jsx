import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Mainpage from "./components/Mainpage/Mainpage";
import Sidebar from "./components/Mainpage/Sidebar/Sidebar";
import CandidateFiltering from "./components/CandidateFiltering/CandidateFiltering";
import ResponseDisplay from "./components/Navbar/ResponseDisplay";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";
import "./App.css";

export default function App() {
const [token, setToken] = useState(null);
const handleSignIn = (userToken) => {
setToken(userToken);
};

const [activeComponent, setActiveComponent] = useState("main"); // Track the active page/component
const [resumeData, setResumeData] = useState([]); // State to store resume data
const [responseData, setResponseData] = useState(null); // State to store API response data

const handleComponentChange = (component) => setActiveComponent(component);

// Update ResponseData based on filtered results or processing
const updateCandidatesData = (newData) => {
setResponseData(newData);
};
return (
  <Router>
    {!token ? (
      <div className="auth-portal">
        <div className="container mt-1">
          <div className="p-4">
            <ul className="nav nav-tabs justify-content-center" id="auth-tabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link active"
                  id="signin-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#signin"
                  type="button"
                  role="tab"
                  aria-controls="signin"
                  aria-selected="true"
                >
                  Sign In
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className="nav-link"
                  id="signup-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#signup"
                  type="button"
                  role="tab"
                  aria-controls="signup"
                  aria-selected="false"
                >
                  Sign Up
                </button>
              </li>
            </ul>
            <div className="tab-content mt-3" id="auth-tabs-content">
              <div
                className="tab-pane fade show active"
                id="signin"
                role="tabpanel"
                aria-labelledby="signin-tab"
              >
                <SignIn onSignIn={handleSignIn} />
              </div>
              <div
                className="tab-pane fade"
                id="signup"
                role="tabpanel"
                aria-labelledby="signup-tab"
              >
                <SignUp />
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="APPA">
        <Navbar setResponseData={setResponseData} />
        <Sidebar 
          onComponentChange={handleComponentChange} 
          activeComponent={activeComponent} 
        />
        <div className="main-content">
          {activeComponent === "candidateFiltering" && (
            <CandidateFiltering 
              data={resumeData} 
              updateCandidatesData={updateCandidatesData} 
            />
          )}
          {activeComponent === "main" && <Mainpage />}
          {responseData && (
            <ResponseDisplay 
              data={responseData.results} 
              duplicateCount={responseData.duplicateCount} 
            />
          )}
        </div>
      </div>
    )}
  </Router>
);
};