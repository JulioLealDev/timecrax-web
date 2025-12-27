import { useState } from "react";
import "./HomePage.css";

export function HomePage() {

  // slides do carrossel: 60% imagem / 40% texto
  const slides = [
    {
      id: 1,
      imageUrl: "/images/gameScreen.png", 
      title: "Viaje por diferentes épocas",
      text: "Explore linhas do tempo temáticas, organizando os eventos corretamente evitando o colapso da máquina do tempo."
    },
    {
      id: 2,
      imageUrl: "/images/menu.png",
      title: "Jogue em equipe",
      text: "Crie salas para jogar online. Discutam decisões, compartilham conhecimento e definam a melhor estratégia para vencer"
    },
    {
      id: 3,
      imageUrl: "/images/timeline.png",
      title: "Mostre o seu conhecimento",
      text: "Para fixar o evento na linha do tempo, deverá concluir diferentes desafios sobre aquele evento."
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

      {/* PRIMEIRA SEÇÃO — TEXTO + VÍDEO */}
      <section id="home" className="home-hero-section">

        <div className="home-hero-text">
          <h1>
            Um jogo educacional <span className="highlight">GRÁTIS</span> para jogar{" "}
            <span className="highlight">ONLINE</span> com seus amigos e aprender História de forma divertida.
          </h1>
          <p>
            Viaje no tempo, organize eventos históricos e participe de desafios rápidos em partidas cooperativas.
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

      {/* SEGUNDA SEÇÃO — DOWNLOAD */}
      <section id="download" className="home-download-section">
        <h2>Download</h2>
        <p className="download-subtitle">
          O TimeCrax Machine está em desenvolvimento. Em breve você poderá baixar a versão beta
          para computador e integrar os temas criados na plataforma.
        </p>

        <div className="download-grid">

          <div className="download-card disabled">
            <h3>Iphone</h3>
            <p>Planejado para versões futuras</p>
          </div>

          <div className="download-card disabled">
            <h3>Android</h3>
            <p>Planejado para versões futuras</p>
          </div>

          <div className="download-card disabled">
            <h3>Windows</h3>
            <p>Disponível em breve</p>
          </div>

        </div>
      </section>

      {/* TERCEIRA SEÇÃO — FEATURES */}

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
                    aria-label={`Ir para slide ${index + 1}`}
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

      {/* Seção 4: Contatos */}

        <section id="contact" className="home-contact-section">

        <h2>Contatos</h2>

        <p className="contact-subtitle">
            Quer usar o TimeCrax Machine na sua escola, testar a versão beta ou enviar sugestões?
            Entre em contacto e vamos conversar.
        </p>

        <div className="contact-grid">
            <div className="contact-card">
            <h3>Email</h3>
            <p>
                Para dúvidas gerais, parceria com escolas e feedback sobre o jogo:
            </p>
            <a href="mailto:seuemail@exemplo.com" className="contact-link">
                seuemail@exemplo.com
            </a>
            </div>

            <div className="contact-card">
            <h3>Redes sociais</h3>
            <p>
                Acompanhe novidades sobre o desenvolvimento, testes e novos temas:
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
