import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
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
      <Container className="pb-4">
        <Row className="gy-4">
          <Col md={3}>
            <Image src="/images/logo.png" alt="CareerBridge Logo" width={150} className="mb-3" />
            <p className="mb-1">123 Street, Brantford, ON</p>
            <p className="mb-1">+1 246-345-0695</p>
            <p className="mb-3">info@careerbridge.com</p>
            <div className="social-icons d-flex gap-3">
              <a href="#"><FaFacebookF /></a>
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaInstagram /></a>
              <a href="#"><FaPinterestP /></a>
              <a href="#"><FaDribbble /></a>
              <a href="#"><FaGooglePlusG /></a>
            </div>
          </Col>

          <Col md={3}>
            <h5 className="fw-bold mb-3">Frequently Asked Questions</h5>
            <ul className="list-unstyled">
              <li>Privacy & Security</li>
              <li>Terms of Service</li>
              <li>Communications</li>
              <li>Referral Terms</li>
              <li>Lending Licenses</li>
              <li>Disclaimers</li>
            </ul>
          </Col>

          <Col md={3}>
            <h5 className="fw-bold mb-3">Find Jobs</h5>
            <ul className="list-unstyled">
              <li>US Jobs</li>
              <li>Canada Jobs</li>
              <li>UK Jobs</li>
              <li>Emplois en France</li>
              <li>Jobs in Deutschland</li>
            </ul>
          </Col>

          <Col md={3} className="store-links">
            <h5 className="fw-bold mb-3">Download Our App</h5>
            <a href="#" className="store-btn apple">
              <i className="bi bi-apple"></i>
              <div>
                <small>Available on the</small>
                <strong>App Store</strong>
              </div>
            </a>
            <a href="#" className="store-btn google">
              <i className="bi bi-google-play"></i>
              <div>
                <small>Get it on</small>
                <strong>Google Play</strong>
              </div>
            </a>
          </Col>
        </Row>
      </Container>

      <div className="text-center py-3 copyright small text-light border-top border-secondary">
  © 2025 CareerBridge. All rights reserved. Design by CareerBridge Team
      </div>

    </footer>
  );
};

export default Footer;
