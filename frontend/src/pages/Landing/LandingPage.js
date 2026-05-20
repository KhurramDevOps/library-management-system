import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card');
    if (!('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add('visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.2 });

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="container">
          <div className="row align-items-center min-vh-100 g-5">
            <div className="col-lg-6">
              <div className="hero-pill hero-anim">Smart Library System</div>
              <h1 className="hero-title hero-anim delay-1">
                Manage Your Library<br />
                <span>Smarter, Faster.</span>
              </h1>
              <p className="hero-subtitle hero-anim delay-2">
                A complete digital solution for modern libraries. Track books, students, and issues in real time.
              </p>
              <div className="hero-actions hero-anim delay-3">
                <Link className="btn btn-primary-custom hero-btn" to="/login">Get Started</Link>
                <a className="btn hero-outline hero-btn" href="#features">Learn More</a>
              </div>
              <div className="trust-row hero-anim delay-4">
                <span>✓ Free to Use</span>
                <span>✓ Real-time Updates</span>
                <span>✓ Easy to Learn</span>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-dashboard hero-card-float">
                <div className="overdue-pop">3 overdue books!</div>
                <div className="mock-header">
                  <div>
                    <span>Library Desk</span>
                    <h3>Today’s Overview</h3>
                  </div>
                  <div className="mock-avatar">A</div>
                </div>
                <div className="mock-stats">
                  {[
                    ['Books', '248'],
                    ['Students', '156'],
                    ['Issued', '43'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="mock-list">
                  {[
                    ['Clean Code', 'Robert Martin', 'issued'],
                    ['Algorithms', 'Thomas Cormen', 'returned'],
                    ['Physics Today', 'Stephen Hall', 'overdue'],
                  ].map(([title, author, status]) => (
                    <div className="mock-row" key={title}>
                      <div>
                        <strong>{title}</strong>
                        <span>{author}</span>
                      </div>
                      <em className={`status-${status}`}>{status}</em>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">Everything a Library Needs</h2>
            <p className="text-secondary">Designed for fast circulation, clear records, and confident decisions.</p>
          </div>
          <div className="row g-4">
            {[
              ['▣', 'Book Management', 'Create, edit, search, and organize your full catalog with availability at a glance.'],
              ['◉', 'Student Tracking', 'Keep student profiles, roll numbers, departments, and active issues together.'],
              ['↔', 'Issue & Return System', 'Issue books, return them, calculate fines, and spot overdue records quickly.'],
            ].map(([icon, title, text]) => (
              <div className="col-md-4" key={title}>
                <div className="feature-card">
                  <div className="feature-icon">{icon}</div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="how-section">
        <div className="container">
          <h2 className="section-title text-center mb-5">How It Works</h2>
          <div className="stepper">
            {[
              ['Login', 'Enter the control desk securely.'],
              ['Add Books', 'Build a catalog with copies and categories.'],
              ['Issue to Student', 'Select a book, select a student, done.'],
              ['Track Returns', 'Monitor due dates, returns, and fines.'],
            ].map(([title, text], index) => (
              <div className="step" key={title}>
                <div className="step-number">{index + 1}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-banner">
        <div className="container">
          <div className="row g-4 text-center">
            {['500+ Books Managed', '200+ Students', '99% Satisfaction', '24/7 Access'].map((item) => {
              const [num, ...label] = item.split(' ');
              return (
                <div className="col-6 col-lg-3" key={item}>
                  <strong>{num}</strong>
                  <span>{label.join(' ')}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container d-md-flex justify-content-between align-items-center">
          <div>
            <h3>LibraryMS</h3>
            <p>Modern library operations, beautifully managed.</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
        <div className="footer-bottom">© 2026 LibraryMS. Built for focused learning spaces.</div>
      </footer>
    </div>
  );
}

export default LandingPage;
