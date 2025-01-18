import React, { useState, useEffect } from "react";
import { Button, Dropdown, Modal, Form } from "react-bootstrap";
import "./ChatBot.css";

const ChatBot = () => {
  const members = [
    { rank: 1, name: "John Doe", email: "john.doe@example.com", totalExperience: "5 years", mobileNumber: "+91 9876543210", skills: "React, Node.js", designation: "Software Engineer", degree: "B.Tech", companyNames: "Google, Amazon", resume: "View Resume", interview: "Scheduled" },
    { rank: 2, name: "Jane Smith", email: "jane.smith@example.com", totalExperience: "3 years", mobileNumber: "+91 9876543221", skills: "Python, Flask", designation: "Data Analyst", degree: "M.Sc", companyNames: "Microsoft", resume: "View Resume", interview: "Not Scheduled" },
    { rank: 3, name: "Alice Johnson", email: "alice.johnson@example.com", totalExperience: "7 years", mobileNumber: "+91 9876543232", skills: "Java, Spring", designation: "Backend Developer", degree: "B.Tech", companyNames: "Facebook, IBM", resume: "View Resume", interview: "Scheduled" },
    { rank: 4, name: "Robert Brown", email: "robert.brown@example.com", totalExperience: "10 years", mobileNumber: "+91 9876543243", skills: "C#", designation: "Project Manager", degree: "MBA", companyNames: "Oracle, Intel", resume: "View Resume", interview: "Scheduled" },
    { rank: 5, name: "Emily Davis", email: "emily.davis@example.com", totalExperience: "6 years", mobileNumber: "+91 9876543254", skills: "HTML, CSS, Bootstrap", designation: "Frontend Developer", degree: "B.Sc", companyNames: "Apple", resume: "View Resume", interview: "Not Scheduled" },
    { rank: 6, name: "shuks", email: "shukas@example.com", totalExperience: "0 years", mobileNumber: "+91 985654654", skills: "HTML, CSS, Bootstrap", designation: "Frontend Developer and mern develeoper", degree: "B.Tech", companyNames: "tata", resume: "View Resume", interview: "Not Scheduled" },
  ];
  const [showModal, setShowModal] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({
    jobType: [],
    skills: [],


    degree: [],
    companyNames:[],
    language: "",
    designation: [],
  });
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [allSelected, setAllSelected] = useState({}); // Track "Select All" state
 

  
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

    if (selectedFilters.skills.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.skills.some((skill) =>
          member.skills.toLowerCase().includes(skill.toLowerCase())
        )
      );
    }  if (selectedFilters.degree.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.degree.some((degree) =>
          member.degree.toLowerCase().includes(degree.toLowerCase())
        )
      );
    }
    if (selectedFilters.companyNames.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.companyNames.some((companyNames) =>
          member.companyNames.toLowerCase().includes(companyNames.toLowerCase())
        )
      );
    }

    if (selectedFilters.jobType.length) {
      filtered = filtered.filter((member) => {
        const isFresher = selectedFilters.jobType.includes("Fresher") && member.totalExperience === "0 years";
        const isExperienced =
          selectedFilters.jobType.includes("Experienced") && member.totalExperience !== "0 years";
        return isFresher || isExperienced;
      });
    }

    if (selectedFilters.designation.length) {
      filtered = filtered.filter((member) =>
        selectedFilters.designation.some((designation) =>
          member.designation.toLowerCase().includes(designation.toLowerCase())
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
        members
          .flatMap((member) =>
            key === "skills" || key === "designation" || key === "degree" || key === "companyNames" 
              ? member[key]?.split(", ")
              : member[key]
          )
          .filter(Boolean)
      ),
    ];
  };

  const resetFilters = (filterCategory) => {
    handleFilterChange(filterCategory, []);
    setAllSelected((prev) => ({ ...prev, [filterCategory]: false }));
  };

  const resetAllFilters = () => {
    setSelectedFilters({
      jobType: [],
      skills: [],
      location: "",
      pay: "",
      distance: "",
      degree: [],
      companyNames: [],
      language: "",
      designation: [],
    });
    setAllSelected({});
    setFilteredMembers(members);
  };

  useEffect(() => {
    setFilteredMembers(members);
  }, []);


  return (
    <div className="filterable-table">
   
    {/* Table */}
    <div className="table-container responsedisplay">
      <div className="table-header d-flex justify-content-center align-items-center text-center">
        <h3>ChatBot History</h3>
      </div>
      <div className="filter-buttons d-flex flex-wrap mb-3">
        {["skills", "designation","jobType","degree","companyNames"].map((filter) => (
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

      {["skills", "designation","jobType","degree","companyNames"].map((filter) => (
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


      <div className="table-responsive cf1">
        <table className="table table-hover table-dark cf2">
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
              <th>Resume</th>
              <th>Interview</th>
            </tr>
          </thead>
          <tbody>
          {filteredMembers.map((member, index) => (
                <tr key={index}>
                  <td>{member.rank}</td>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.totalExperience}</td>
                  <td>{member.mobileNumber}</td>
                  <td>{member.skills}</td>
                  <td>{member.designation}</td>
                  <td>{member.degree}</td>
                  <td>{member.companyNames}</td>
                  <td>
                    <a href="#">{member.resume}</a>
                  </td>
                  <td>{member.interview}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
};
export default ChatBot;
