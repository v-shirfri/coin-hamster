import profileImage from '../assets/me.png'

function AboutPage() {
  return (
    <section className="page-section">
      <div className="page-section__header">
        <h2>About This Project</h2>
        <p>
          This project is a web application for exploring popular crypto coins.
          Users can browse coins, view real-time reports, and get a short AI recommendation about whether a
          coin might be worth buying.
        </p>
      </div>

      <div className="about-grid">
        <article className="state-card about-card">
          <h3>Project Summary</h3>
          <p>
            The application was built using React, TypeScript and Redux as a single-page application.
            It integrates external APIs to fetch cryptocurrency data and uses Redux for global state management.
            The project also includes React Router navigation, local filtering for the search feature,
            localStorage persistence to save selected coins, modal dialogs for coin selection management
            and realtime polling for live report updates.
            <br />
            During development I used GitHub Copilot models- Claude Sonnet 4.6 and GPT 5.4 to assist with coding,
            and tools like Canva pro and ChatGPT plus to create and design some of the visual elements of the interface.
          </p>

        </article>

        <article className="state-card about-card about-card--profile">
          <img
            className="about-card__image"
            src={profileImage}
            alt="Portrait of Shir Fridman"
          />
          <div>
            <h3>Student Details</h3>
            <p><strong>Name:</strong> Shir Fridman</p>
            <p><strong>Email:</strong> shir.fridman13@gmail.com</p>
            <p><strong>Course:</strong> John Bryce Full Stack Web & genAI</p>
          </div>
        </article>
      </div>
    </section>
  )
}

export default AboutPage