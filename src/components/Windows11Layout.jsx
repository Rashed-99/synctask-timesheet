import { 
  HomeFilled,
  AppsFilled,
  SettingsFilled,
  PeopleFilled,
  MailFilled,
  PowerFilled,
  SearchFilled,
  PersonFilled,
  PieChartFilled,
  CalendarFilled,
  TaskListFilled,
  CloudFilled
} from "@fluentui/react-icons";
import { 
  makeStyles,
  shorthands
} from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    display: "flex",
    minHeight: "100vh",
    backgroundColor: "#202020",
    color: "#ffffff",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif"
  },
  sidebar: {
    width: "240px",
    backgroundColor: "#2b2b2b",
    padding: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    display: "flex",
    flexDirection: "column"
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "4px",
    cursor: "pointer",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#383838"
    }
  },
  navItemActive: {
    backgroundColor: "#0078d4"
  },
  navIcon: {
    marginRight: "12px",
    fontSize: "16px"
  },
  mainContent: {
    flex: 1,
    padding: "24px"
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "20px"
  },
  card: {
    backgroundColor: "#2b2b2b",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    transition: "transform 0.2s",
    ":hover": {
      transform: "translateY(-4px)"
    }
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: "16px"
  },
  cardIcon: {
    fontSize: "24px",
    marginRight: "12px",
    color: "#0078d4"
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "600",
    margin: "0"
  },
  cardContent: {
    color: "#a0a0a0",
    fontSize: "14px"
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px"
  },
  searchBar: {
    backgroundColor: "#2b2b2b",
    borderRadius: "8px",
    padding: "8px 16px",
    display: "flex",
    alignItems: "center",
    width: "300px"
  },
  searchInput: {
    backgroundColor: "transparent",
    border: "none",
    color: "#ffffff",
    marginLeft: "8px",
    flex: 1,
    fontFamily: "inherit",
    ":focus": {
      outline: "none"
    }
  },
  userProfile: {
    display: "flex",
    alignItems: "center"
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#0078d4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "16px"
  }
});

export const Windows11Layout = () => {
  const styles = useStyles();
  const [activeNav, setActiveNav] = React.useState("home");

  return (
    <div className={styles.root}>
      <div className={styles.sidebar}>
        <div 
          className={`${styles.navItem} ${activeNav === "home" ? styles.navItemActive : ""}`}
          onClick={() => setActiveNav("home")}
        >
          <HomeFilled className={styles.navIcon} />
          <span>Home</span>
        </div>
        <div 
          className={`${styles.navItem} ${activeNav === "apps" ? styles.navItemActive : ""}`}
          onClick={() => setActiveNav("apps")}
        >
          <AppsFilled className={styles.navIcon} />
          <span>Applications</span>
        </div>
        <div 
          className={`${styles.navItem} ${activeNav === "settings" ? styles.navItemActive : ""}`}
          onClick={() => setActiveNav("settings")}
        >
          <SettingsFilled className={styles.navIcon} />
          <span>Settings</span>
        </div>
        <div 
          className={`${styles.navItem} ${activeNav === "people" ? styles.navItemActive : ""}`}
          onClick={() => setActiveNav("people")}
        >
          <PeopleFilled className={styles.navIcon} />
          <span>Contacts</span>
        </div>
        <div 
          className={`${styles.navItem} ${activeNav === "mail" ? styles.navItemActive : ""}`}
          onClick={() => setActiveNav("mail")}
        >
          <MailFilled className={styles.navIcon} />
          <span>Messages</span>
        </div>
        <div style={{ flex: 1 }}></div>
        <div className={styles.navItem}>
          <PowerFilled className={styles.navIcon} />
          <span>Logout</span>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.topBar}>
          <div className={styles.searchBar}>
            <SearchFilled />
            <input 
              type="text" 
              className={styles.searchInput} 
              placeholder="Search..." 
            />
          </div>
          <div className={styles.userProfile}>
            <span>John Doe</span>
            <div className={styles.avatar}>
              <PersonFilled style={{ fontSize: "16px" }} />
            </div>
          </div>
        </div>

        <h1>Dashboard</h1>
        
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <PieChartFilled className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Statistics</h3>
            </div>
            <div className={styles.cardContent}>
              View your application statistics and performance metrics.
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <CalendarFilled className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Calendar</h3>
            </div>
            <div className={styles.cardContent}>
              Check your upcoming events and schedule new meetings.
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <TaskListFilled className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Tasks</h3>
            </div>
            <div className={styles.cardContent}>
              Manage your to-do list and track completed items.
            </div>
          </div>
          
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <CloudFilled className={styles.cardIcon} />
              <h3 className={styles.cardTitle}>Storage</h3>
            </div>
            <div className={styles.cardContent}>
              45% of 1TB used. Upgrade plan for more storage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};