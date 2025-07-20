import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Translate from './Translation.jsx'; // Corrected the import path
import './style.css';

const HomePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const selectedPage = id || "0";

  const renderContent = () => {
    switch (selectedPage) {
      case "1":
        return (
          <div className="back">
            <div className="vid">
              <h1 className="our"><Translate>Guide</Translate></h1>
              <video
                controls
                poster="/images/Screenshot 2025-05-13 200635.png"
                style={{ border: "solid #000000 4px", borderRadius: "20px", borderStyle: "outset" }}
              >
                <source src="/videos/Marvel Studios' Avengers_ Endgame - Official Trailer.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        );
      case "2":
        return (
          <div className="back">
            <div className="s">
              <div className="signup1" onClick={() => navigate('/farmersignup')}>
                <h1 className='f'><Translate>Farmer</Translate></h1>
                <h1 className='li'><Translate>SignUp</Translate></h1>
              </div>
              <div className="signup2" onClick={() => navigate('/merchantsignup')}>
                <h1 className='f'><Translate>Merchant</Translate></h1>
                <h1 className='li'><Translate>SignUp</Translate></h1>
              </div>
            </div>
          </div>
        );
      case "3":
        return (
          <div className="back">
            <div className="l">
              <div className="login1" onClick={() => navigate('/farmerlogin')}>
                <h1 className='f'><Translate>Farmer</Translate></h1>
                <h1 className='li'><Translate>LogIn</Translate></h1>
              </div>
              <div className="login2" onClick={() => navigate('/merchantlogin')}>
                <h1 className='f'><Translate>Merchant</Translate></h1>
                <h1 className='li'><Translate>LogIn</Translate></h1>
              </div>
            </div>
          </div>
        );
      case "4":
        return (
          <div className="back">
            <h1 className="our" style={{ textAlign: "center" }}><Translate>About Us</Translate></h1>
            <div className="aboutus">
              <section>
                <h2><Translate>Rooted in the Soil, Growing with Technology</Translate></h2>
                <p><Translate>Every seed holds a promise. Every farmer holds a dream.</Translate></p>
                <p><Translate>At </Translate><strong>AgriConnect</strong><Translate>, we exist to make those dreams easier to achieve.</Translate></p>
                <p><Translate>We know the struggles of farmers—the early mornings, the uncertain skies, and the endless hard work.</Translate></p>
                <p><Translate>That’s why we’ve built a platform where technology meets tradition, helping farmers connect with merchants, book vehicles, order pesticides, and care for their crops, all with a few simple clicks.</Translate></p>
                <p><Translate>We stand by our farmers, offering them not just services, but support, trust, and hope.</Translate></p>
                <p><Translate>Because when they succeed, the entire world grows a little brighter.</Translate></p>
              </section>
              <section>
                <h2><Translate>By Farmers. For Farmers.</Translate></h2>
                <p><Translate>At the heart of </Translate><strong>AgriConnect</strong><Translate> is a simple belief—farmers deserve better.</Translate></p>
                <p><Translate>Better access. Better support. Better lives.</Translate></p>
                <p><Translate>Born from listening to the voices of farmers, our platform is designed to simplify their day-to-day struggles, offering them instant connections to vehicles, pesticides, crop health services, and merchants.</Translate></p>
                <p><Translate>We aim to cut through the noise, giving farmers the power to make decisions faster, safer, and smarter.</Translate></p>
                <p><strong>AgriConnect</strong><Translate> is more than an app—it’s a movement toward empowering those who feed the world.</Translate></p>
              </section>
              <section>
                <h2><Translate>Cultivating Connections, Harvesting Trust</Translate></h2>
                <p><Translate>Farming is a journey of patience, care, and resilience.</Translate></p>
                <p><Translate>At </Translate><strong>AgriConnect</strong><Translate>, we walk beside farmers on that journey, providing them with a digital bridge to the services and support they need.</Translate></p>
                <p><Translate>From booking vehicles to ordering pesticides and connecting with reliable merchants, we help them focus on what they do best—growing life from the soil.</Translate></p>
                <p><Translate>Our mission is simple: to make every farmer feel seen, supported, and connected.</Translate></p>
                <p><Translate>Because we believe that trust is the most valuable crop of all.</Translate></p>
              </section>
            </div>
          </div>
        );
      default:
        return (
          <div className="back">
            <div className="d">
              <h1 className="our"><Translate>OUR</Translate></h1>
              <h1 className="services"><Translate>SERVICES</Translate></h1>
            </div>
            <div className="b">
              <div className="a1" onClick={() => navigate('/vehicles')}>
                <h1 className="vehicle"><Translate>Vehicle</Translate></h1>
                <h1 className="booking"><Translate>BOOKING</Translate></h1>
              </div>
              <div className="a2" onClick={() => navigate('/products')}>
                <h1 className="Pesticides"><Translate>Pesticides</Translate></h1>
                <h1 className="order"><Translate>ORDER</Translate></h1>
              </div>
              <div className="a3">
                <h1 className="Crop"><Translate>Crop</Translate></h1>
                <h1 className="HEALTH-CARE"><Translate>HEALTH CARE</Translate></h1>
              </div>
              <div className="a4" onClick={() => navigate('/merchantlogin')}>
                <h1 className="Merchant"><Translate>Merchant</Translate></h1>
                <h1 className="LOGIN"><Translate>LOGIN</Translate></h1>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <header className="hedder">
        <button onClick={() => navigate("/main/0")}><Translate>Home</Translate></button>
        <button onClick={() => navigate("/main/1")}><Translate>Guide</Translate></button>
        <button onClick={() => navigate("/main/2")}><Translate>SignUp</Translate></button>
        <button onClick={() => navigate("/main/3")}><Translate>LogIn</Translate></button>
        <button onClick={() => navigate("/main/4")}><Translate>About Us</Translate></button>
        <button onClick={() => navigate("/profile")}><Translate>Profile</Translate></button>
      </header>

      <main id="app" className='scroll'>
        {renderContent()}
      </main>

      <footer className="footer">
        <h1 style={{ textDecoration: "solid underline" }}><Translate>Contact Us</Translate></h1>
        <div className="contact-details">
            <span><Translate>Gmail: chetancsk300@gmail.com</Translate></span>
            <span><Translate>PhoneNo: 7569493773</Translate></span>
            <span><Translate>Address: Vellore, Tamil Nadu, India</Translate></span>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
