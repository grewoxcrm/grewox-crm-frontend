import React from 'react';
import './footer.scss';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="superadmin-footer">
            <div className="footer-content">
                <div className="copyright">
                    © {currentYear} Grewox Infotech. All rights reserved.
                </div>
                <div className="footer-links">
                    <a href="/privacy">Privacy Policy</a>
                    <a href="/terms">Terms of Service</a>
                    <a href="/support">Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 