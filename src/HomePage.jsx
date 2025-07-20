import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
              <h1 className="our" id="8">Guide</h1>
              <video
                height="342.9"
                width="570"
                controls
                poster="images/Screenshot 2025-05-13 200635.png"
                style={{ border: "solid #000000 4px", borderRadius: "20px", borderStyle: "outset" }}
              >
                <source src="videos/Marvel Studios' Avengers_ Endgame - Official Trailer.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        );
      case "2":
        return (
          <div className="back">
            <div className="s">
              <div className="signup1" onClick={() => navigate('/farmersignup')}>
                <h1 id="9" className='f'>Farmer</h1>
                <h1 className='li'>SignUp</h1>
              </div>
              <div className="signup2" onClick={() => navigate('/merchantsignup')}>
                <h1 id="text" className='f'>Merchant</h1>
                <h1 className='li'>SignUp</h1>
              </div>
            </div>
          </div>
        );
      case "3":
        return (
          <div className="back">
            <div className="l">
              <div className="login1" onClick={() => navigate('/farmerlogin')}>
                <h1 id="10" className='f'>Farmer</h1>
                <h1 className='li'>LogIn</h1>
              </div>
              <div className="login2" onClick={() => navigate('/merchantlogin')}>
                <h1 id="11" className='f'>Merchant</h1>
                <h1 className='li'>LogIn</h1>
              </div>
            </div>
          </div>
        );
      case "4":
        return (
          <div className="back">
            <h1 className="our" style={{ textAlign: "center" }} id="12">About Us</h1>
            <div className="aboutus">
            <section id = "13">
                <h2>Rooted in the Soil, Growing with Technology</h2>
                <p>Every seed holds a promise. Every farmer holds a dream.</p>
                <p>At <strong>AgriConnect</strong>, we exist to make those dreams easier to achieve.</p>
                <p>We know the struggles of farmers—the early mornings, the uncertain skies, and the endless hard work.</p>
                <p>That’s why we’ve built a platform where technology meets tradition, helping farmers connect with merchants, book vehicles, order pesticides, and care for their crops, all with a few simple clicks.</p>
                <p>We stand by our farmers, offering them not just services, but support, trust, and hope.</p>
                <p>Because when they succeed, the entire world grows a little brighter.</p>
              </section>

              <section id = "14">
                <h2>By Farmers. For Farmers.</h2>
                <p>At the heart of <strong>AgriConnect</strong> is a simple belief—farmers deserve better.</p>
                <p>Better access. Better support. Better lives.</p>
                <p>Born from listening to the voices of farmers, our platform is designed to simplify their day-to-day struggles, offering them instant connections to vehicles, pesticides, crop health services, and merchants.</p>
                <p>We aim to cut through the noise, giving farmers the power to make decisions faster, safer, and smarter.</p>
                <p><strong>AgriConnect</strong> is more than an app—it’s a movement toward empowering those who feed the world.</p>
              </section>

              <section id = "15">
                <h2>Cultivating Connections, Harvesting Trust</h2>
                <p>Farming is a journey of patience, care, and resilience.</p>
                <p>At <strong>AgriConnect</strong>, we walk beside farmers on that journey, providing them with a digital bridge to the services and support they need.</p>
                <p>From booking vehicles to ordering pesticides and connecting with reliable merchants, we help them focus on what they do best—growing life from the soil.</p>
                <p>Our mission is simple: to make every farmer feel seen, supported, and connected.</p>
                <p>Because we believe that trust is the most valuable crop of all.</p>
              </section>
            </div>
          </div>
        );
      default:
        return (
          <div className="back">
            <div className="d">
              <h1 className="our" id="16">OUR</h1>
              <h1 className="services" id="17">SERVICES</h1>
            </div>
            <div className="b">
              <div className="a1" onClick={() => navigate('/vehicles')}>
                <h1 className="vehicle" id="18">Vehicle</h1>
                <h1 className="booking" id="19">BOOKING</h1>
              </div>
              <div className="a2" onClick={() => navigate('/products')}>
                <h1 className="Pesticides" id="20">Pesticides</h1>
                <h1 className="order" id="21">ORDER</h1>
              </div>
              <div className="a3">
                <h1 className="Crop" id="22">Crop</h1>
                <h1 className="HEALTH-CARE" id="23">HEALTH CARE</h1>
              </div>
              <div className="a4" onClick={() => navigate('/merchantlogin')}>
                <h1 className="Merchant" id="24">Merchant</h1>
                <h1 className="LOGIN" id="25">LOGIN</h1>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="hedder">
        <button onClick={() => navigate("/main/0")} id="1">Home</button>
        <button onClick={() => navigate("/main/1")} id="2">Guide</button>
        <button onClick={() => navigate("/main/2")} id="3">SignUp</button>
        <button onClick={() => navigate("/main/3")} id="4">LogIn</button>
        <button onClick={() => navigate("/main/4")} id="5">About Us</button>
        <button onClick={() => navigate("/profile")} id="6">Profile</button>
      </div>

      <div id="app" className='scroll'>
        {renderContent()}
      </div>

      <div className="footer">
        <h1 style={{ textDecoration: "solid underline" }} id="6">Contact Us</h1>
        <p id="7">
          Gmail: chetancsk300@gmail.com <br /><br />
          PhoneNo: 7569493773 <br /><br />
          Address: Vellore, Tamil Nadu, India <br /><br />
        </p>
      </div>
    </>
  );
};

export default HomePage;
