import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faFilter, faCalendarAlt,faHistory } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faMicrosoft, faSlack } from '@fortawesome/free-brands-svg-icons';
import { faVideo } from '@fortawesome/free-solid-svg-icons'; 
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ onComponentChange, activeComponent }) => {
  const navigate = useNavigate();

  const handleOpenLink = (url) => {
    window.open(url, '_blank'); // Opens the link in a new tab
  };
  const handleChatBotClick = () => {
    if (activeComponent === 'ChatBot') {
      navigate('/'); 
      onComponentChange('main'); 
    } else {
      navigate('/ChatBot'); 
      onComponentChange('ChatBot'); 
    }
  };

  const handleCandidateFilteringClick = () => {
    if (activeComponent === 'candidateFiltering') {
      navigate('/'); 
      onComponentChange('main'); 
    } else {
      navigate('/candidateFiltering'); 
      onComponentChange('candidateFiltering'); 
    }
  };
  return (
    <div className="sidebar">
      {/* Menu Icon */}
      <div className="icon-wrapper">
        <div className="sidebar-icon" onClick={() => onComponentChange('main')}>
          <FontAwesomeIcon icon={faBars} />
          <span className="icon-label">Menu</span>
        </div>
      </div>

      {/* Candidate Filtering Icon */}
      <div className="icon-wrapper">
        <div className="sidebar-icon" onClick={handleCandidateFilteringClick}>
          <FontAwesomeIcon icon={faFilter} />
          <span className="icon-label">Skill History</span>
        </div>
      </div>
      <div>
      {/* History Button */}
      <div className="icon-wrapper">
      <div className="sidebar-icon" onClick={handleChatBotClick}>
        <FontAwesomeIcon icon={faHistory}  />
        <span className="icon-label">ChatBot History</span>
        </div>
      </div>
    </div>
      {/* Schedule Meeting Icon */}
      <div className="icon-wrapper">
        <div className="sidebar-icon">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span className="icon-label">Schedule Meeting</span>
        </div>
        {/* Dropdown Icons */}
        <div className="dropdown-icons">
          <div
            className="dropdown-icon google-icon"
            onClick={() => handleOpenLink('https://calendar.google.com')}
          >
            <FontAwesomeIcon icon={faGoogle} />
            <span className="dropdown-label">Google Calendar</span>
          </div>
          <div
            className="dropdown-icon microsoft-icon"
            onClick={() => handleOpenLink('https://teams.microsoft.com')}
          >
            <FontAwesomeIcon icon={faMicrosoft} />
            <span className="dropdown-label">Microsoft Teams</span>
          </div>
          <div
            className="dropdown-icon zoom-icon"
            onClick={() => handleOpenLink('https://zoom.us')}
          >
            <FontAwesomeIcon icon={faVideo} />
            <span className="dropdown-label">Zoom</span>
          </div>
          <div
            className="dropdown-icon slack-icon"
            onClick={() => handleOpenLink('https://slack.com')}
          >
            <FontAwesomeIcon icon={faSlack} />
            <span className="dropdown-label">Slack</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;