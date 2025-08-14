import React from "react";
import { Container, Image } from "react-bootstrap";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPinterestP,
  FaDribbble,
  FaGooglePlusG,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer-dark text-white mt-auto">
      <Container className="pb-3">
        {/* 1 column on mobile; 4 columns from md+ */}
        <div className="footer-grid">
          {/* Section 1: Logo & contact */}
          <section className="footer-block">
            <Image
              src="/images/logo.png"
              alt="CareerBridge Logo"
              width={130}
              className="mb-2"
            />
            <p className="mb-1 small">123 Street, Brantford, ON</p>
            <p className="mb-1 small">+1 246-345-0695</p>
            <p className="mb-2 small">info@careerbridge.com</p>

            {/* icons column on mobile */}
            <div className="social-icons">
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Pinterest"><FaPinterestP /></a>
              <a href="#" aria-label="Dribbble"><FaDribbble /></a>
              <a href="#" aria-label="Google Plus"><FaGooglePlusG /></a>
            </div>
          </section>

          {/* Section 2: FAQ */}
          <section className="footer-block">
            <h6 className="fw-bold mb-2">Frequently Asked Questions</h6>
            <ul className="list-unstyled small mb-0">
              <li>Privacy & Security</li>
              <li>Terms of Service</li>
              <li>Communications</li>
              <li>Referral Terms</li>
              <li>Lending Licenses</li>
              <li>Disclaimers</li>
            </ul>
          </section>

          {/* Section 3: Find Jobs */}
          <section className="footer-block">
            <h6 className="fw-bold mb-2">Find Jobs</h6>
            <ul className="list-unstyled small mb-0">
              <li>US Jobs</li>
              <li>Canada Jobs</li>
              <li>UK Jobs</li>
              <li>Emplois en France</li>
              <li>Jobs in Deutschland</li>
            </ul>
          </section>

          {/* Section 4: App download */}
          <section className="footer-block store-links">
            <h6 className="fw-bold mb-2">Download Our App</h6>
            <a href="#" className="store-btn apple small">
              <i className="bi bi-apple" aria-hidden="true"></i>
              <div>
                <small>Available on the</small>
                <strong>App Store</strong>
              </div>
            </a>
            <a href="#" className="store-btn google small">
              <i className="bi bi-google-play" aria-hidden="true"></i>
              <div>
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </a>
          </section>
        </div>
      </Container>

      <div className="text-center py-2 copyright small text-light border-top border-secondary">
        © 2025 CareerBridge. All rights reserved. Design by CareerBridge Team
      </div>
    </footer>
  );
};

export default Footer;
