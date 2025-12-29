import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import "./HomePage.css";

export function HomePage() {
  const { t } = useTranslation();

  // carousel slides: 60% image / 40% text
  const slides = [
    {
      id: 1,
      imageUrl: "/images/gameScreen.png",
      titleKey: "home.slides.slide1Title",
      textKey: "home.slides.slide1Text"
    },
    {
      id: 2,
      imageUrl: "/images/menu.png",
      titleKey: "home.slides.slide2Title",
      textKey: "home.slides.slide2Text"
    },
    {
      id: 3,
      imageUrl: "/images/timeline.png",
      titleKey: "home.slides.slide3Title",
      textKey: "home.slides.slide3Text"
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
            <Trans
              i18nKey="home.heroTitle"
              components={{ highlight: <span className="highlight" /> }}
            />
          </h1>
          <p>
            {t("home.heroSubtitle")}
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
        <h2>{t("home.downloadTitle")}</h2>
        <p className="download-subtitle">
          {t("home.downloadSubtitle")}
        </p>

        <div className="download-grid">

          <div className="download-card disabled">
            <h3>{t("home.iphone")}</h3>
            <p>{t("home.plannedFuture")}</p>
          </div>

          <div className="download-card disabled">
            <h3>{t("home.android")}</h3>
            <p>{t("home.plannedFuture")}</p>
          </div>

          <div className="download-card disabled">
            <h3>{t("home.windows")}</h3>
            <p>{t("home.availableSoon")}</p>
          </div>

        </div>
      </section>

      {/* THIRD SECTION — FEATURES */}

        <section id="features" className="home-features-section">

        <h2 className="section-title">{t("home.featuresTitle")}</h2>

        <div className="features-content">

            <div className="highlight-text">
            <h2>{t(slide.titleKey)}</h2>
            <p>{t(slide.textKey)}</p>

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
                <img src={slide.imageUrl} alt={t(slide.titleKey)} loading="lazy" />
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

        <h2>{t("home.contactTitle")}</h2>

        <p className="contact-subtitle">
            {t("home.contactSubtitle")}
        </p>

        <div className="contact-grid">
            <div className="contact-card">
            <h3>{t("home.email")}</h3>
            <p>
                {t("home.emailDescription")}
            </p>
            <a href="mailto:timecraxmachine@gmail.com" className="contact-link">
                timecraxmachine@gmail.com
            </a>
            </div>

            <div className="contact-card">
            <h3>{t("home.socialMedia")}</h3>
            <p>
                {t("home.socialDescription")}
            </p>
            <div className="contact-links-row">
                <span className="contact-link contact-link-disabled">
                Instagram
                </span>
                <span className="contact-link contact-link-disabled">
                YouTube
                </span>
            </div>
            </div>
        </div>

        </section>

    </main>
  );
}
