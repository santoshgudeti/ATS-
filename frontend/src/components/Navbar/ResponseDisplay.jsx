import React, { useState,useEffect } from "react";
import "./ResponseDisplay.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faMicrosoft} from '@fortawesome/free-brands-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ResponseDisplay = ({ data, duplicateCount }) => {
  console.log("Received data:", data);
  console.log("Duplicate count:", duplicateCount);  

  useEffect(() => {
    if (duplicateCount !==undefined) {
      toast.info(`We have found "${duplicateCount}" Duplicate profiles check the history`, {
        position: "top-right",
      });
      
    }
  }, [duplicateCount]);

  if (!data || data.length === 0) {
    console.log("No data available to display.");

  }

  const sortedData = data
    .map((result) => {
      const matchingResult = result.matchingResult?.[0]?.["Resume Data"] || {};
      const matchingPercentage = matchingResult?.["Matching Percentage"] || 0;
      console.log(`Processing result: ${JSON.stringify(result)}`);
      return { ...result, matchingResult, matchingPercentage };
    })
    .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

  console.log("Sorted data:", sortedData);
// Check for duplicates


  // State for expanding/collapsing lists
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedDesignations, setExpandedDesignations] = useState({});

  const toggleExpand = (index, type) => {
    if (type === "skills") {
      setExpandedSkills((prev) => ({ ...prev, [index]: !prev[index] }));
    } else if (type === "designations") {
      setExpandedDesignations((prev) => ({ ...prev, [index]: !prev[index] }));
    }
  };
  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const renderList = (items = [], isExpanded, toggle) => {
    const maxItems = 5;
    const displayItems = isExpanded ? items : items.slice(0, maxItems);
    return (
      <>
        <ul className="bullet-list">
          {displayItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {items.length > maxItems && !isExpanded && (
          <span className="more-link" onClick={toggle}>
            More...
          </span>
        )}
        {isExpanded && (
          <span className="less-link" onClick={toggle}>
            Show Less
          </span>
        )}
      </>
    );
  };

  return (
    <div className="table-container responsedisplay">
      <ToastContainer/>
      <h3 className="MR">Matching Results</h3>
      <div className="table-responsive rd1">
        <table className="table table-hover table-dark rd2">
          <thead>
            <tr>
             
              <th>Rank</th>
              <th>Job Title</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Experience</th>
              <th>Mobile Number</th>
              <th>Skills</th>
              <th>Designation</th>
              <th>Degree</th>
              <th>Company Names</th>
              <th>Matching Percentage</th>
              <th>Resume</th>
              <th>Interview</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((result, index) => {
              const resumeData = result.matchingResult || {};
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{resumeData?.["Job Title"] || "N/A"}</td>
                  <td>{resumeData?.name || "N/A"}</td>
                  <td className="email-column">{resumeData?.email || "N/A"}</td>
                  <td>{resumeData?.total_experience || "0"} years</td>
                  <td>{resumeData?.mobile_number || "N/A"}</td>
                  <td>
                    {renderList(
                      resumeData?.skills || ["N/A"],
                      expandedSkills[index],
                      () => toggleExpand(index, "skills")
                    )}
                  </td>
                  <td>
                    {renderList(
                      resumeData?.designation || ["N/A"],
                      expandedDesignations[index],
                      () => toggleExpand(index, "designations")
                    )}
                  </td>
                  <td>{resumeData?.degree?.join(", ") || "N/A"}</td>
                  <td>{resumeData?.company_names?.join(", ") || "N/A"}</td>
                  <td>{result.matchingPercentage || "0"}%</td>
                  <td>
                    <a
                      href={`http://localhost:5000${resumeData.path || `/uploads/resumes/${result.resume}`}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                  <td>
                <div className="icon-wrapper">
                  <div className="sidebar-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span className="icon-label scheduletext">Schedule Meeting</span>
                  </div>
                  {/* Dropdown Icons */}
                  <div className="dropdown-icons">
                    <div
                      className="dropdown-icon google-icon"
                      onClick={() => handleOpenLink( `https://calendar.google.com/calendar/render?action=TEMPLATE&add=${encodeURIComponent(resumeData.email || 'no mailfound')}&text=${encodeURIComponent(`Job Title - ${resumeData["Job Title"] || 'Job Title'}`)}`
                      ) }
                    >
                      <FontAwesomeIcon icon={faGoogle} />
                      <span className="dropdown-label dropdowntext">Google Calendar</span>
                    </div>
                    <div
                      className="dropdown-icon microsoft-icon"
                      onClick={() =>
                        handleOpenLink(
                           `https://outlook.office.com/calendar/0/deeplink/compose?to=${encodeURIComponent(resumeData.email || 'email@example.com')}&subject=${encodeURIComponent(`Job Title - ${resumeData["Job Title"] || 'Job Title'}`)}`
                        )
                      }
                      >
                      <FontAwesomeIcon icon={faMicrosoft} />
                      <span className="dropdown-label dropdowntext">Microsoft Teams</span>
                    </div>
                    <div
                      className="dropdown-icon zoom-icon"
                      onClick={() =>
                        handleOpenLink(
                           `https://zoom.us/schedule?email=${encodeURIComponent(resumeData.email || 'email@example.com')}&topic=${encodeURIComponent(`Job Title -${resumeData["Job Title"] || 'Job Title'}`)}`
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faVideo} />
                      <span className="dropdown-label dropdowntext">Zoom</span>
                    </div>
                    
                  </div>
                </div>
              </td>
              </tr>
                    );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponseDisplay;


/*
import React, { useState } from "react";
import "./ResponseDisplay.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faMicrosoft} from '@fortawesome/free-brands-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom';

const ResponseDisplay = ({ data }) => {
  console.log("Received data:", data);
         
  if (!data || data.length === 0) {
    console.log("No data available to display.");
    return <p>No data available. Upload files to see the results.</p>;
  }

  const sortedData = data
    .map((result) => {
      const matchingResult = result.matchingResult?.[0]?.["Resume Data"] || {};
      const matchingPercentage = matchingResult?.["Matching Percentage"] || 0;
      console.log(`Processing result: ${JSON.stringify(result)}`);
      return { ...result, matchingResult, matchingPercentage };
    })
    .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

  console.log("Sorted data:", sortedData);

  // State for expanding/collapsing lists
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedDesignations, setExpandedDesignations] = useState({});

  const toggleExpand = (index, type) => {
    if (type === "skills") {
      setExpandedSkills((prev) => ({ ...prev, [index]: !prev[index] }));
    } else if (type === "designations") {
      setExpandedDesignations((prev) => ({ ...prev, [index]: !prev[index] }));
    }
  };
  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const renderList = (items = [], isExpanded, toggle) => {
    const maxItems = 5;
    const displayItems = isExpanded ? items : items.slice(0, maxItems);
    return (
      <>
        <ul className="bullet-list">
          {displayItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {items.length > maxItems && !isExpanded && (
          <span className="more-link" onClick={toggle}>
            More...
          </span>
        )}
        {isExpanded && (
          <span className="less-link" onClick={toggle}>
            Show Less
          </span>
        )}
      </>
    );
  };

  return (
    <div className="table-container responsedisplay">
      <h3 className="MR">Matching Results</h3>
      <div className="table-responsive rd1">
        <table className="table table-hover table-dark rd2">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Email</th>
              <th>Total Experience</th>
              <th>Mobile Number</th>
              <th>Skills</th>
              <th>Designation</th>
              <th>Degree</th>
              <th>Company Names</th>
              <th>Matching Percentage</th>
              <th>Resume</th>
              <th>Interview</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((result, index) => {
              const resumeData = result.matchingResult || {};
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{resumeData?.name || "N/A"}</td>
                  <td className="email-column">{resumeData?.email || "N/A"}</td>
                  <td>{resumeData?.total_experience || "0"} years</td>
                  <td>{resumeData?.mobile_number || "N/A"}</td>
                  <td>
                    {renderList(
                      resumeData?.skills || ["N/A"],
                      expandedSkills[index],
                      () => toggleExpand(index, "skills")
                    )}
                  </td>
                  <td>
                    {renderList(
                      resumeData?.designation || ["N/A"],
                      expandedDesignations[index],
                      () => toggleExpand(index, "designations")
                    )}
                  </td>
                  <td>{resumeData?.degree?.join(", ") || "N/A"}</td>
                  <td>{resumeData?.company_names?.join(", ") || "N/A"}</td>
                  <td>{result.matchingPercentage || "0"}%</td>
                  <td>
                    <a
                      href={`http://localhost:5000${resumeData.path || `/uploads/resumes/${result.resume}`}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  </td>
                  <td>
                <div className="icon-wrapper">
                  <div className="sidebar-icon">
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <span className="icon-label scheduletext">Schedule Meeting</span>
                  </div>
                 
                  <div className="dropdown-icons">
                    <div
                      className="dropdown-icon google-icon"
                      onClick={() => handleOpenLink(`https://calendar.google.com/calendar/render?action=TEMPLATE&add=${encodeURIComponent(resumeData.email || 'no mailfound')}`
                      ) }
                    >
                      <FontAwesomeIcon icon={faGoogle} />
                      <span className="dropdown-label dropdowntext">Google Calendar</span>
                    </div>
                    <div
                      className="dropdown-icon microsoft-icon"
                      onClick={() =>
                        handleOpenLink(
                          `https://outlook.office.com/calendar/0/deeplink/compose?to=${encodeURIComponent(resumeData.email || 'email@example.com')}`
                        )
                      }
                      >
                      <FontAwesomeIcon icon={faMicrosoft} />
                      <span className="dropdown-label dropdowntext">Microsoft Teams</span>
                    </div>
                    <div
                      className="dropdown-icon zoom-icon"
                      onClick={() =>
                        handleOpenLink(
                          `https://zoom.us/schedule?email=${encodeURIComponent(resumeData.email || 'email@example.com')}`
                        )
                      }
                    >
                      <FontAwesomeIcon icon={faVideo} />
                      <span className="dropdown-label dropdowntext">Zoom</span>
                    </div>
                    
                  </div>
                </div>
              </td>
              </tr>
                    );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResponseDisplay;
*/