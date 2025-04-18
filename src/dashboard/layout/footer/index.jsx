import React from 'react';
import { Layout } from 'antd';
import './footer.scss';

const { Footer } = Layout;

const DashboardFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <Footer className="dashboard-footer" role="contentinfo">
            <div className="footer-content">
                <span className="copyright">
                    © {currentYear} Grewox. All rights reserved.
                </span>
                <nav className="footer-links" aria-label="Footer navigation">
                    <a href="/privacy" onClick={(e) => e.currentTarget.blur()}>
                        Privacy Policy
                    </a>
                    <a href="/terms" onClick={(e) => e.currentTarget.blur()}>
                        Terms of Service
                    </a>
                    <a href="/contact" onClick={(e) => e.currentTarget.blur()}>
                        Contact Us
                    </a>
                </nav>
            </div>
        </Footer>
    );
};

export default DashboardFooter; 