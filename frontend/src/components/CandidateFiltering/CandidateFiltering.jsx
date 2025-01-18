import React, { useState, useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { io } from "socket.io-client";
import { FaExpand, FaCompress } from "react-icons/fa";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilter, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faMicrosoft} from '@fortawesome/free-brands-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import "./CandidateFiltering.css";

const CandidateFiltering = () => {
  const [members, setMembers] = useState([]); // Store fetched members
  const [filteredMembers, setFilteredMembers] = useState([]); // Store filtered results
  const [expandedLists, setExpandedLists] = useState({});
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [allSelected, setAllSelected] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    skills: [],
    designation: [],
    degree: [],
    company_names: [],
    jobType: [],
  });
  const [showModal, setShowModal] = useState({});

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("apiResponseUpdated", (newResponse) => {
      setCandidates((prevCandidates) => {
        const exists = prevCandidates.some(
          (candidate) =>
            candidate.resumeId === newResponse.resumeId &&
            candidate.jobDescriptionId === newResponse.jobDescriptionId
        );

        if (exists) {
          console.log("Duplicate record detected and ignored:", newResponse);
          return prevCandidates;
        }

        return [newResponse, ...prevCandidates];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/candidate-filtering"
        );
        const data = await response.json();

        const uniqueCandidates = data.filter((member, index, self) => {
          return (
            index ===
            self.findIndex(
              (c) =>
                c.resumeId === member.resumeId &&
                c.jobDescriptionId === member.jobDescriptionId
            )
          );
        });

        console.log("Fetched candidates:", uniqueCandidates);
        setMembers(uniqueCandidates);
        setFilteredMembers(uniqueCandidates); // Initially show all members
      } catch (error) {
        console.error("Error fetching candidate data:", error.message);
      }
    };

    fetchCandidates();
  }, []);

  const toggleModal = (filter) => {
    setShowModal((prev) => ({ ...prev, [filter]: !prev[filter] }));
  };

  const handleFilterChange = (filterCategory, value) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filterCategory]: value,
    }));
  };
  const applyFilters = () => {
    let filtered = members;

    if (selectedFilters.jobType.length) {
      filtered = filtered.filter((member) => {
        const experienceStr = member.matchingResult[0]?.["Resume Data"]?.total_experience || "0 years";
        const experienceYears = parseFloat(experienceStr); // Extract numeric value
  
        const isFresher = selectedFilters.jobType.includes("Fresher") && experienceYears === 0;
        const isExperienced = selectedFilters.jobType.includes("Experienced") && experienceYears > 0;
  
        return isFresher || isExperienced;
      });
    }
    if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.some((degree) =>
          member.matchingResult[0]?.["Resume Data"]?.degree
            ?.join(", ")
            .toLowerCase()
            .includes(degree.toLowerCase())
        )
      );
    }
    if (selectedFilters.company_names.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.company_names.some((company_name) =>
          member.matchingResult[0]?.["Resume Data"]?.company_names
            ?.join(", ")
            .toLowerCase()
            .includes(company_name.toLowerCase())
        )
      );
    }
    if (selectedFilters.skills.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.skills.some((skills) =>
          member.matchingResult[0]?.["Resume Data"]?.skills
            ?.join(", ")
            .toLowerCase()
            .includes(skills.toLowerCase())
        )
      );
    }
   
 
    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.some((designation) =>
          member.matchingResult[0]?.["Resume Data"]?.designation
            ?.join(", ")
            .toLowerCase()
            .includes(designation.toLowerCase())
        )
      );
    }


    setFilteredMembers(filtered);
  };
  const sortedFilteredMembers = [...filteredMembers].sort((a, b) => {
    const aMatch = a.matchingResult?.[0]?.["Resume Data"]?.["Matching Percentage"] || 0;
    const bMatch = b.matchingResult?.[0]?.["Resume Data"]?.["Matching Percentage"] || 0;
    return bMatch - aMatch; // Descending order
  });
  const extractUniqueValues = (key) => {
    if (key === "jobType") {
      return ["Fresher", "Experienced"];
    }
    return [
      ...new Set(
        members.flatMap((member) =>
          member.matchingResult[0]?.["Resume Data"]?.[key]?.flat() || []
        )
      ),
    ];
  };

  const resetFilters = (filterCategory) => {
    handleFilterChange(filterCategory, []);
    setAllSelected((prev) => ({ ...prev, [filterCategory]: false }));
  };

  const resetAllFilters = () => {
    setSelectedFilters({
      skills: [],
      designation: [],
      degree: [],
      company_names: [],
      jobType: [],
    });
    setAllSelected({});
    setFilteredMembers(members);
  };

  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const handleResumeLink = (resumeId) => {
    return `http://localhost:5000/api/resumes/${resumeId}`;
  };

  const sortedCandidates = members
    .map((member) => ({
      ...member,
      matchingPercentage:
      member.matchingResult?.[0]?.["Resume Data"]?.["Matching Percentage"] ||
        0,
    }))
    .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

  const toggleExpand = (index, type) => {
    setExpandedLists((prev) => ({
      ...prev,
      [`${index}-${type}`]: !prev[`${index}-${type}`],
    }));
  };

  const renderListWithExpand = (items, index, type) => {
    const maxItems = 3;
    const isExpanded = expandedLists[`${index}-${type}`];
    const visibleItems = isExpanded ? items : items.slice(0, maxItems);

    return (
      <>
        <ul className="bullet-list">
          {visibleItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {items.length > maxItems && (
          <span
            className="toggle-link"
            onClick={() => toggleExpand(index, type)}
          >
            {isExpanded ? "Show Less" : "More..."}
          </span>
        )}
      </>
    );
  };

  return (
    <div className={`table-container responsedisplay py-5 CandidateFiltering ${
        isFullScreen ? "fullscreen" : ""
      }`}
    >
      <div className="table-header">
        <h3>History</h3>
        <div className="filter-buttons justify-content-center p-0 my-4 d-flex flex-wrap mb-3">
        {["skills", "designation","jobType", "degree", "company_names"].map((filter) => (
          <Button
            key={filter}
         variant="outline-fourth mt-1 bg-white"
            className="me-2 filter-button"
            onClick={() => toggleModal(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
        <Button
                  variant="outline-danger mt-1 bg-danger text-white "
                  className="ms-2  filter-button"
                  onClick={resetAllFilters}
                >
                  Reset All
                </Button>
                <Button
                  variant="outline-success mt-1 bg-success text-white"
                  className="ms-2 filter-button"
                  onClick={applyFilters}
                >
                  Search
                </Button>
      </div>

      {["skills", "designation","jobType", "degree", "company_names"].map((filter) => (
        <Modal
          key={filter}
          show={showModal[filter] || false}
          onHide={() => toggleModal(filter)}
        >
          <Modal.Header closeButton>
            <Modal.Title>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Check
                type="checkbox"
                label="Select All"
                checked={allSelected[filter] || false}
                onChange={(e) => {
                  const isSelected = e.target.checked;
                  const allValues = extractUniqueValues(filter);
                  setAllSelected((prev) => ({ ...prev, [filter]: isSelected }));
                  handleFilterChange(filter, isSelected ? allValues : []);
                }}
              />
              {extractUniqueValues(filter).map((value, index) => (
                <Form.Check
                  key={index}
                  type="checkbox"
                  label={value}
                  checked={selectedFilters[filter]?.includes(value) || false}
                  onChange={(e) => {
                    const selected = e.target.checked
                      ? [...(selectedFilters[filter] || []), value]
                      : selectedFilters[filter].filter((v) => v !== value);
                    handleFilterChange(filter, selected);
                  }}
                />
              ))}
             </Form>
                        </Modal.Body>
                        <Modal.Footer>
                          <Button variant="secondary" onClick={() => resetFilters(filter)}>
                            Reset
                          </Button>
                          <Button variant="primary" onClick={applyFilters}>
                            Apply
                          </Button>
                        </Modal.Footer>
                      </Modal>
      ))}
        <div className="controls">
        <input 
                type="text" 
                className="form-control" 
                placeholder="Ask something you'd like to know about your candidates"
                style={{ 
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  paddingLeft: '36px',
                  paddingRight: '16px',
                  height: '38px'
                }}
              />
          <button
            className="screen-toggle py-1 "
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            {isFullScreen ? (
              <>
                <FaCompress style={{ marginRight: "1px" }} />
                Exit Full Screen
              </>
            ) : (
              <>
                <FaExpand style={{ marginRight: "5px" }} />
                Full Screen
              </>
            )}
          </button>
        </div>
      </div>
      <div className="table-responsive cf1">
        <table className="table table-hover table-dark cf2">
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
          {sortedFilteredMembers.map((member, index) => {
              const resumeData = member.matchingResult?.[0]?.["Resume Data"] || {};
              return (
                <tr key={member._id || index}>
                  <td>{index + 1}</td>
                  <td>{resumeData?.["Job Title"] || "N/A"}</td>
                  <td>{resumeData.name || "N/A"}</td>
                  <td>{resumeData.email || "N/A"}</td>
                  <td>{resumeData.total_experience || "0"} years</td>
                  <td>{resumeData.mobile_number || "N/A"}</td>
                  <td>
                    {resumeData.skills?.length
                      ? renderListWithExpand(resumeData.skills, index, "skills")
                      : "N/A"}
                  </td>
                  <td>
                    {resumeData.designation?.length
                      ? renderListWithExpand(resumeData.designation, index, "designation")
                      : "N/A"}
                  </td>
                  <td>{resumeData.degree?.join(", ") || "N/A"}</td>
                  <td>{resumeData.company_names?.join(", ") || "N/A"}</td>
                  <td>{resumeData["Matching Percentage"] || "0"}%</td>
                  <td>
                    <a 
                      href={handleResumeLink(member.resumeId?._id)} 
                      target="_blank"
                      className="view-link"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                    <a 
                      href={`${handleResumeLink(member.resumeId?._id)}?download=true`} 
                      target="_blank"
                      className="download-link"
                      rel="noopener noreferrer"
                    >
                      Download
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
                                onClick={() => handleOpenLink(
                                  `https://calendar.google.com/calendar/render?action=TEMPLATE&add=${encodeURIComponent(resumeData.email || 'no mailfound')}&text=${encodeURIComponent(`Job Title - ${resumeData["Job Title"] || 'Job Title'}`)}`

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

export default CandidateFiltering;




/* import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { FaExpand, FaCompress } from "react-icons/fa";
import "./CandidateFiltering.css";

const CandidateFiltering = () => {
  const [candidates, setCandidates] = useState([]);
  const [expandedLists, setExpandedLists] = useState({});
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [userDefinedTop, setUserDefinedTop] = useState("");
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("apiResponseUpdated", (newResponse) => {
      setCandidates((prevCandidates) => {
        const exists = prevCandidates.some(
          (candidate) =>
            candidate.resumeId === newResponse.resumeId &&
            candidate.jobDescriptionId === newResponse.jobDescriptionId
        );

        if (exists) {
          console.log("Duplicate record detected and ignored:", newResponse);
          return prevCandidates;
        }

        return [newResponse, ...prevCandidates];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/api/candidate-filtering"
        );
        const data = await response.json();

        const uniqueCandidates = data.filter((candidate, index, self) => {
          return (
            index ===
            self.findIndex(
              (c) =>
                c.resumeId === candidate.resumeId &&
                c.jobDescriptionId === candidate.jobDescriptionId
            )
          );
        });

        console.log("Fetched candidates:", uniqueCandidates);

        setCandidates(uniqueCandidates);
      } catch (error) {
        console.error("Error fetching candidate data:", error.message);
      }
    };

    fetchCandidates();
  }, []);

  const handleResumeLink = (resumeId) => {
    return `http://localhost:5000/api/resumes/${resumeId}`;
  };

  const sortedCandidates = candidates
    .map((candidate) => ({
      ...candidate,
      matchingPercentage:
        candidate.matchingResult?.[0]?.["Resume Data"]?.["Matching Percentage"] ||
        0,
    }))
    .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

  const toggleExpand = (index, type) => {
    setExpandedLists((prev) => ({
      ...prev,
      [`${index}-${type}`]: !prev[`${index}-${type}`],
    }));
  };

  const renderListWithExpand = (items, index, type) => {
    const maxItems = 3;
    const isExpanded = expandedLists[`${index}-${type}`];
    const visibleItems = isExpanded ? items : items.slice(0, maxItems);

    return (
      <>
        <ul className="bullet-list">
          {visibleItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        {items.length > maxItems && (
          <span
            className="toggle-link"
            onClick={() => toggleExpand(index, type)}
          >
            {isExpanded ? "Show Less" : "More..."}
          </span>
        )}
      </>
    );
  };

  const isCandidateSelected = (id) =>
    selectedCandidates.some((candidate) => candidate._id === id);

  const toggleCandidateSelection = (id) => {
    setSelectedCandidates((prev) => {
      const exists = prev.some((candidate) => candidate._id === id);
      if (exists) {
        return prev.filter((candidate) => candidate._id !== id);
      } else {
        const candidate = candidates.find((c) => c._id === id);
        return candidate ? [...prev, candidate] : prev;
      }
    });
  };

  const selectTop = (count) => {
    const topCandidates = sortedCandidates.slice(0, count);
    const alreadySelected = topCandidates.every((candidate) =>
      isCandidateSelected(candidate._id)
    );

    if (alreadySelected) {
      setSelectedCandidates((prev) =>
        prev.filter(
          (candidate) =>
            !topCandidates.some((topCandidate) => topCandidate._id === candidate._id)
        )
      );
    } else {
      setSelectedCandidates((prev) => [
        ...prev,
        ...topCandidates.filter(
          (topCandidate) =>
            !prev.some((candidate) => candidate._id === topCandidate._id)
        ),
      ]);
    }
  };

  const handleUserDefinedSelection = () => {
    const count = parseInt(userDefinedTop, 10);
    if (!isNaN(count) && count > 0 && count <= sortedCandidates.length) {
      selectTop(count);
    }
  };

  const handleDownload = () => {
    const selectedResumes = selectedCandidates.map(
      (candidate) => handleResumeLink(candidate._id)
    );

    if (selectedResumes.length === 0) {
      console.log("No resumes selected for download.");
      return;
    }

    selectedResumes.forEach((url) => {
      if (url) {
        const newTab = window.open(url, "_blank", "noopener,noreferrer");
        if (!newTab) {
          console.error("Failed to open a new tab. Please check browser settings.");
        }
      }
    });

    console.log("Resumes opened in new tabs:", selectedResumes);
  };

  return (
    <div
      className={`table-container CandidateFiltering ${
        isFullScreen ? "fullscreen" : ""
      }`}
    >
      <div className="table-header">
        <h3>All Candidates Results</h3>
        <div className="controls">
          <button
            className="Selection"
            onClick={() => setIsSelectionMode(!isSelectionMode)}
          >
            {isSelectionMode ? "Cancel Selection" : "Select Resumes"}
          </button>
          {isSelectionMode && (
            <>
              <button className="Select10" onClick={() => selectTop(10)}>
                {sortedCandidates
                  .slice(0, 10)
                  .every((candidate) => isCandidateSelected(candidate._id))
                  ? "Unselect Top 10"
                  : "Select Top 10"}
              </button>
              <input
                className="NUMBER"
                type="number"
                placeholder="Enter number"
                value={userDefinedTop}
                onChange={(e) => setUserDefinedTop(e.target.value)}
              />
              <button className="select-topN" onClick={handleUserDefinedSelection}>
                Submit {userDefinedTop || ""}
              </button>
              <button
                className="downloadselected"
                onClick={handleDownload}
                disabled={selectedCandidates.length === 0}
              >
                Download Resumes
              </button>
            </>
          )}
          <button
            className="screen-toggle"
            onClick={() => setIsFullScreen(!isFullScreen)}
          >
            {isFullScreen ? (
              <>
                <FaCompress style={{ marginRight: "5px" }} />
                Exit Full Screen
              </>
            ) : (
              <>
                <FaExpand style={{ marginRight: "5px" }} />
                Full Screen
              </>
            )}
          </button>
        </div>
      </div>
      <div className="table-responsive cf1">
        <table className="table table-hover table-dark cf2">
          <thead>
            <tr>
              {isSelectionMode && <th>Select</th>}
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
            </tr>
          </thead>
          <tbody>
            {sortedCandidates.map((candidate, index) => {
              const resumeData = candidate.matchingResult?.[0]?.["Resume Data"] || {};
              return (
                <tr key={candidate._id || index}>
                  {isSelectionMode && (
                    <td>
                      <input
                        type="checkbox"
                        checked={isCandidateSelected(candidate._id)}
                        onChange={() => toggleCandidateSelection(candidate._id)}
                      />
                    </td>
                  )}
                  <td>{index + 1}</td>
                  <td>{resumeData.name || "N/A"}</td>
                  <td>{resumeData.email || "N/A"}</td>
                  <td>{resumeData.total_experience || "0"} years</td>
                  <td>{resumeData.mobile_number || "N/A"}</td>
                  <td>
                    {resumeData.skills?.length
                      ? renderListWithExpand(resumeData.skills, index, "skills")
                      : "N/A"}
                  </td>
                  <td>
                    {resumeData.designation?.length
                      ? renderListWithExpand(resumeData.designation, index, "designation")
                      : "N/A"}
                  </td>
                  <td>{resumeData.degree?.join(", ") || "N/A"}</td>
                  <td>{resumeData.company_names?.join(", ") || "N/A"}</td>
                  <td>{resumeData["Matching Percentage"] || "0"}%</td>
                  <td>
                    <a
                      href={handleResumeLink(candidate.resumeId?._id)} // Use resumeId._id
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Resume
                    </a>
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

export default CandidateFiltering;
*/