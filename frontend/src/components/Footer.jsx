import { Link } from 'react-router-dom'
import { FiInstagram, FiMail } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { WHATSAPP_NUMBER } from '../config/constants'

function Footer() {
    const currentYear = new Date().getFullYear()
    const formattedPhone = WHATSAPP_NUMBER.replace(/^91/, '+91 ')

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>Harlon</h4>
                        <p>
                            Your destination for premium retro football jerseys.
                            Relive the glory days with our collection of classic designs
                            from legendary clubs and national teams.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <div className="footer-links">
                            <Link to="/">Home</Link>
                            <Link to="/shop">Shop All</Link>
                            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                                Contact Us
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Contact</h4>
                        <div className="footer-links">
                            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp style={{ marginRight: '8px' }} />
                                {formattedPhone}
                            </a>
                            <a href="mailto:harlonclothing@gmail.com">
                                <FiMail style={{ marginRight: '8px' }} />
                                harlonclothing@gmail.com
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h4>Follow Us</h4>
                        <div className="social-links">
                            <a
                                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="WhatsApp"
                            >
                                <FaWhatsapp />
                            </a>
                            <a
                                href="https://instagram.com/harlon.india"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="social-link"
                                aria-label="Instagram"
                            >
                                <FiInstagram />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Harlon. All rights reserved. | Made in India 🇮🇳</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
