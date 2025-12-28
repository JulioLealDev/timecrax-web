import { useState } from "react";
import "./HomePage.css";

export function HomePage() {

  // carousel slides: 60% image / 40% text
  const slides = [
    {
      id: 1,
      imageUrl: "/images/gameScreen.png",
      title: "Travel through different eras",
      text: "Explore themed timelines, organizing events correctly to prevent the time machine from collapsing."
    },
    {
      id: 2,
      imageUrl: "/images/menu.png",
      title: "Play as a team",
      text: "Create rooms to play online. Discuss decisions, share knowledge and define the best strategy to win"
    },
    {
      id: 3,
      imageUrl: "/images/timeline.png",
      title: "Show your knowledge",
      text: "To place the event on the timeline, you must complete different challenges about that event."
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  function handleNext() {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }

  function handlePrev() {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }

  const slide = slides[currentSlide];

  return (
    <main className="home">

      {/* FIRST SECTION — TEXT + VIDEO */}
      <section id="home" className="home-hero-section">

        <div className="home-hero-text">
          <h1>
            A <span className="highlight">FREE</span> educational game to play{" "}
            <span className="highlight">ONLINE</span> with your friends and learn History in a fun way.
          </h1>
          <p>
            Travel through time, organize historical events and participate in quick challenges in cooperative matches.
          </p>
        </div>

        <div className="home-video-container">
          <iframe
            src="https://www.youtube.com/embed/XLkfGNxSJ80"
            title="TimeCrax Machine Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

      </section>

      {/* SECOND SECTION — DOWNLOAD */}
      <section id="download" className="home-download-section">
        <h2>Download</h2>
        <p className="download-subtitle">
          TimeCrax Machine is under development. Soon you will be able to download the beta version
          for computer and integrate the themes created on the platform.
        </p>

        <div className="download-grid">

          <div className="download-card disabled">
            <h3>iPhone</h3>
            <p>Planned for future versions</p>
          </div>

          <div className="download-card disabled">
            <h3>Android</h3>
            <p>Planned for future versions</p>
          </div>

          <div className="download-card disabled">
            <h3>Windows</h3>
            <p>Available soon</p>
          </div>

        </div>
      </section>

      {/* THIRD SECTION — FEATURES */}

        <section id="features" className="home-features-section">

        <h2 className="section-title">Features</h2>

        <div className="features-content">

            <div className="highlight-text">
            <h2>{slide.title}</h2>
            <p>{slide.text}</p>

            <div className="highlight-dots">
                {slides.map((s, index) => (
                <button
                    key={s.id}
                    className={index === currentSlide ? "dot active" : "dot"}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                />
                ))}
            </div>
            </div>

            <div className="highlight-carousel">
            <button className="carousel-arrow left" onClick={handlePrev}>
            <svg
                className="arrow-icon"
                viewBox="0 0 40 40"
                aria-hidden="true"
            >
                <defs>
                <linearGradient id="arrowMetalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f5f5f5" />
                    <stop offset="35%" stopColor="#d4d4d4" />
                    <stop offset="70%" stopColor="#8b8b8b" />
                    <stop offset="100%" stopColor="#3a3a3a" />
                </linearGradient>
                </defs>
                {/* triângulo no estilo da imagem */}
                <polygon
                points="2,4 36,20 2,36"
                fill="url(#arrowMetalGradient)"
                />
            </svg>
            </button>

            <div className="carousel-image-wrapper">
                <img src={slide.imageUrl} alt={slide.title} />
            </div>

            <button className="carousel-arrow right" onClick={handleNext}>
            <svg
                className="arrow-icon"
                viewBox="0 0 40 40"
                aria-hidden="true"
            >
                <defs>
                <linearGradient id="arrowMetalGradientRight" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f5f5f5" />
                    <stop offset="35%" stopColor="#d4d4d4" />
                    <stop offset="70%" stopColor="#8b8b8b" />
                    <stop offset="100%" stopColor="#3a3a3a" />
                </linearGradient>
                </defs>
                <polygon
                points="2,4 36,20 2,36"
                fill="url(#arrowMetalGradientRight)"
                />
            </svg>
            </button>

            </div>
            
        </div>

      </section>

      {/* Section 4: Contact */}

        <section id="contact" className="home-contact-section">

        <h2>Contact</h2>

        <p className="contact-subtitle">
            Want to use TimeCrax Machine in your school, test the beta version or send suggestions?
            Get in touch and let's talk.
        </p>

        <div className="contact-grid">
            <div className="contact-card">
            <h3>Email</h3>
            <p>
                For general questions, school partnerships and game feedback:
            </p>
            <a href="mailto:seuemail@exemplo.com" className="contact-link">
                seuemail@exemplo.com
            </a>
            </div>

            <div className="contact-card">
            <h3>Social Media</h3>
            <p>
                Follow news about development, tests and new themes:
            </p>
            <div className="contact-links-row">
                <a href="#" target="_blank" rel="noreferrer" className="contact-link">
                Instagram
                </a>
                <a href="#" target="_blank" rel="noreferrer" className="contact-link">
                YouTube
                </a>
            </div>
            </div>
        </div>

        </section>

    </main>
  );
}
