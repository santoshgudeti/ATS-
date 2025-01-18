import React, { useState,useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import "./ResponseDisplay.css";
import { FaExpand, FaCompress } from "react-icons/fa";
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
    if (duplicateCount !==undefined) {
      toast.info(`We have found "${duplicateCount}" Duplicate profiles check the history`, {
        position: "top-right",
      });
      
    }
  }, [duplicateCount]);

  if (!data || data.length === 0) {
    console.log("No data available to display.");

  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Process and sort the data
      const sortedData = data
        .map((result) => {
          const matchingResult = result.matchingResult?.[0]?.["Resume Data"] || {};
          const matchingPercentage = matchingResult?.["Matching Percentage"] || 0;
          console.log(`Processing result: ${JSON.stringify(result)}`);
          return { ...result, matchingResult, matchingPercentage };
        })
        .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

      console.log("Sorted data:", sortedData);

      // Update state with the processed data
      setMembers(sortedData);
      setFilteredMembers(sortedData); // Initially show all members
    }
  }, [data]); // Re-run if `data` prop changes
  // State for expanding/collapsing lists
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedDesignations, setExpandedDesignations] = useState({});

 
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
        const experienceStr = member.matchingResult?.total_experience || "0 years";
        console.log(experienceStr);
        const experienceYears = parseFloat(experienceStr); // Extract numeric value
  
        const isFresher = selectedFilters.jobType.includes("Fresher") && experienceYears === 0;
        const isExperienced = selectedFilters.jobType.includes("Experienced") && experienceYears > 0;
  
        return isFresher || isExperienced;
      });
    }
    if (selectedFilters.skills.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.skills.some((skills) =>
          member.matchingResult?.skills
            ?.join(", ")
            .toLowerCase()
            .includes(skills.toLowerCase())
        )
      );
    }
    if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.some((degree) =>
          member.matchingResult?.degree
            ?.join(", ")
            .toLowerCase()
            .includes(degree.toLowerCase())
        )
      );
    }
    if (selectedFilters.company_names.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.company_names.some((company_name) =>
          member.matchingResult?.company_names
            ?.join(", ")
            .toLowerCase()
            .includes(company_name.toLowerCase())
        )
      );
    }
    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.some((designation) =>
          member.matchingResult?.designation
            ?.join(", ")
            .toLowerCase()
            .includes(designation.toLowerCase())
        )
      );
    }
 
    
    setFilteredMembers(filtered);
  };
  const extractUniqueValues = (key) => {
    if (key === "jobType") {
      return ["Fresher", "Experienced"];
    }
    return [
      ...new Set(
        members.flatMap((member) =>
          member.matchingResult?.[key]?.flat() || []
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

  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const handleResumeLink = (resumeId) => {
    return `http://localhost:5000/api/resumes/${resumeId}`;
  };

  return (
    <div className={`table-container responsedisplay py-5 responsedisplay ${
        isFullScreen ? "fullscreen" : ""
      }`}
    >
      <ToastContainer/>
      <div className="table-header">
      <h3>Matching Results</h3>
      <div className="filter-buttons justify-content-center p-0 my-4 d-flex flex-wrap mb-3">
        {["skills", "designation","jobType", "degree", "company_names"].map((filter) => (
          <Button
            key={filter}
         variant="outline-fourth  mt-1 bg-white"
            className="me-2 filter-button"
            onClick={() => toggleModal(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
        <Button
                  variant="outline-danger mt-1 bg-danger text-white "
                  className="ms-2 filter-button"
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
            {filteredMembers.map((result, index) => {
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
                    {renderListWithExpand(
                      resumeData?.skills || ["N/A"],
                      expandedSkills[index],
                      () => toggleExpand(index, "skills")
                    )}
                  </td>
                  <td>
                    {renderListWithExpand(
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
                    
                     href={handleResumeLink(result.resumeId)}
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
import React, { useState,useEffect } from "react";
import { Button, Modal, Form } from "react-bootstrap";
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
    if (duplicateCount !==undefined) {
      toast.info(`We have found "${duplicateCount}" Duplicate profiles check the history`, {
        position: "top-right",
      });
      
    }
  }, [duplicateCount]);

  if (!data || data.length === 0) {
    console.log("No data available to display.");

  }

  useEffect(() => {
    if (data && Array.isArray(data)) {
      // Process and sort the data
      const sortedData = data
        .map((result) => {
          const matchingResult = result.matchingResult?.[0]?.["Resume Data"] || {};
          const matchingPercentage = matchingResult?.["Matching Percentage"] || 0;
          console.log(`Processing result: ${JSON.stringify(result)}`);
          return { ...result, matchingResult, matchingPercentage };
        })
        .sort((a, b) => b.matchingPercentage - a.matchingPercentage);

      console.log("Sorted data:", sortedData);

      // Update state with the processed data
      setMembers(sortedData);
      setFilteredMembers(sortedData); // Initially show all members
    }
  }, [data]); // Re-run if `data` prop changes
  // State for expanding/collapsing lists
  const [expandedSkills, setExpandedSkills] = useState({});
  const [expandedDesignations, setExpandedDesignations] = useState({});

 
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
        console.log(experienceStr);
        const experienceYears = parseFloat(experienceStr); // Extract numeric value
  
        const isFresher = selectedFilters.jobType.includes("Fresher") && experienceYears === 0;
        const isExperienced = selectedFilters.jobType.includes("Experienced") && experienceYears > 0;
  
        return isFresher || isExperienced;
      });
    }
    if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.some((degree) =>
          member.matchingResult[0]?.degree
            ?.join(", ")
            .toLowerCase()
            .includes(degree.toLowerCase())
        )
      );
    }
    if (selectedFilters.company_names.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.company_names.some((company_name) =>
          member.matchingResult[0]?.company_names
            ?.join(", ")
            .toLowerCase()
            .includes(company_name.toLowerCase())
        )
      );
    }
   
 
    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.some((designation) =>
          member.matchingResult[0]?.designation
            ?.join(", ")
            .toLowerCase()
            .includes(designation.toLowerCase())
        )
      );
    }

    setFilteredMembers(filtered);
  };
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

  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const handleResumeLink = (resumeId) => {
    return `http://localhost:5000/api/resumes/${resumeId}`;
  };

  return (
    <div className="table-container responsedisplay">
      <ToastContainer/>
      <h3 className="MR">Matching Results</h3>
      <div className="filter-buttons d-flex flex-wrap mb-3">
        {["skills", "designation","jobType", "degree", "company_names"].map((filter) => (
          <Button
            key={filter}
         variant="outline-fourth bg-white"
            className="me-2 filter-button"
            onClick={() => toggleModal(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
        <Button
                  variant="outline-danger bg-danger text-white "
                  className="ms-2 filter-button"
                  onClick={resetAllFilters}
                >
                  Reset All
                </Button>
                <Button
                  variant="outline-success bg-success text-white"
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
            {filteredMembers.map((result, index) => {
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
                    {renderListWithExpand(
                      resumeData?.skills || ["N/A"],
                      expandedSkills[index],
                      () => toggleExpand(index, "skills")
                    )}
                  </td>
                  <td>
                    {renderListWithExpand(
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
                    
                     href={handleResumeLink(result.resumeId)}
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

*/