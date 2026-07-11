import { Link } from 'react-router-dom';
import { MdVolunteerActivism, MdSmartToy, MdTrackChanges, MdDashboard, MdArrowForward } from 'react-icons/md';
import styles from './Landing.module.css';

const FEATURES = [
  {
    icon: <MdVolunteerActivism />,
    title: 'Smart Donation Matching',
    desc: 'AI automatically matches food donations with the nearest NGOs based on type, urgency, and location.',
  },
  {
    icon: <MdSmartToy />,
    title: 'AI Quality Prediction',
    desc: 'Our AI engine analyzes food safety scores in real-time — ensuring only quality food reaches people in need.',
  },
  {
    icon: <MdTrackChanges />,
    title: 'End-to-End Tracking',
    desc: 'Track every donation from listing to delivery with live status updates for donors and NGOs.',
  },
  {
    icon: <MdDashboard />,
    title: 'Role-Based Dashboards',
    desc: 'Dedicated dashboards for Donors, NGOs, and Admins with analytics and actionable insights.',
  },
];

const STATS = [
  { value: '10K+', label: 'Meals Donated' },
  { value: '200+', label: 'NGO Partners'  },
  { value: '95%',  label: 'Quality Score' },
  { value: '50+',  label: 'Cities Served' },
];

const Landing = () => {
  return (
    <div className={styles.page}>
      {/* ─── Navbar ─────────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <span>🍱</span>
          <span>FoodBridge</span>
        </div>
        <div className={styles.navLinks}>
          <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.heroBadgeDot} />
          AI-Powered Food Donation Platform
        </div>
        <h1 className={styles.heroTitle}>
          Bridging Surplus Food<br />
          <span className="gradient-text">to Those Who Need It Most</span>
        </h1>
        <p className={styles.heroDesc}>
          FoodBridge uses artificial intelligence to connect food donors with NGOs in real-time.
          Predict food quality, track donations, and make every meal count.
        </p>
        <div className={styles.heroCta}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start Donating Free <MdArrowForward />
          </Link>
          <Link to="/login" className="btn btn-secondary btn-lg">
            Sign In
          </Link>
        </div>

        {/* Floating blobs */}
        <div className={styles.blob1} aria-hidden="true" />
        <div className={styles.blob2} aria-hidden="true" />
      </section>

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <section className={styles.statsSection}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statItem}>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <h2>Why FoodBridge?</h2>
          <p>Built with cutting-edge AI to make food donation smarter, faster, and more impactful.</p>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────── */}
      <section className={styles.howSection}>
        <div className={styles.sectionHeader}>
          <h2>How It Works</h2>
          <p>Three simple steps to make a difference.</p>
        </div>
        <div className={styles.steps}>
          {[
            { n: '01', title: 'Donor Lists Food',     desc: 'Register and list surplus food with details. AI instantly scores the quality.' },
            { n: '02', title: 'NGO Gets Matched',     desc: 'Our AI recommends the best donations to NGOs based on preferences and urgency.' },
            { n: '03', title: 'Food Gets Delivered',  desc: 'NGO claims, picks up, and delivers. Both parties track progress in real-time.' },
          ].map((step) => (
            <div key={step.n} className={styles.step}>
              <div className={styles.stepNumber}>{step.n}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Banner ─────────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <h2>Ready to make a difference?</h2>
        <p>Join thousands of donors and NGOs already using FoodBridge to fight food waste.</p>
        <Link to="/register" className="btn btn-primary btn-lg">
          Join FoodBridge Today <MdArrowForward />
        </Link>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>🍱 FoodBridge</div>
        <p>© 2025 FoodBridge. Built with ❤️ to fight hunger.</p>
      </footer>
    </div>
  );
};

export default Landing;
