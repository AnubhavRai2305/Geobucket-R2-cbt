const Sidebar = ({ currentView, onViewChange, role, name, onLogout }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>GeoBucket CBT</h3>
        <div className="staff-info">
          <p className="staff-name">{name}</p>
          <span className={`role-badge role-${role}`}>{role}</span>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          {role !== 'counsellor' && (
            <>
              <li>
                <button
                  className={`nav-btn ${currentView === 'test-builder' ? 'active' : ''}`}
                  onClick={() => onViewChange('test-builder')}
                >
                  Test Builder
                </button>
              </li>
              <li>
                <button
                  className={`nav-btn ${currentView === 'student-manager' ? 'active' : ''}`}
                  onClick={() => onViewChange('student-manager')}
                >
                  Student Management
                </button>
              </li>
            </>
          )}
          <li>
            <button
              className={`nav-btn ${currentView === 'proctor' ? 'active' : ''}`}
              onClick={() => onViewChange('proctor')}
            >
              Proctor Panel
            </button>
          </li>
          <li>
            <button
              className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`}
              onClick={() => onViewChange('reports')}
            >
              Reports & Analytics
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-logout" onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
