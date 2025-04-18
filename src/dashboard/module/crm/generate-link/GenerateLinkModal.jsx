import React, { useRef, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { FiDownload } from 'react-icons/fi';
import QRCode from 'qrcode';
import dayjs from 'dayjs';
import './GenerateLink.scss';

const GenerateLinkModal = ({ open, onCancel, formData }) => {
    const qrCanvasRef = useRef(null);
    const baseUrl = window.location.origin;
    const formUrl = `${baseUrl}/forms/${formData?.id}`;
    const startDate = dayjs().format('MMM DD');
    const endDate = dayjs().add(1, 'month').format('MMM DD, YYYY');

    useEffect(() => {
        if (open && qrCanvasRef.current) {
            generateQRCode();
        }
    }, [open, formUrl]);

    const generateQRCode = async () => {
        try {
            const canvas = qrCanvasRef.current;
            if (canvas) {
                await QRCode.toCanvas(canvas, formUrl, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#000000',
                        light: '#ffffff',
                    },
                    errorCorrectionLevel: 'H',
                });
            }
        } catch (err) {
            console.error('QR generation error:', err);
        }
    };

    const handleDownloadQR = async () => {
        const qrContainer = document.querySelector('.qr-preview-container');
        if (!qrContainer) {
            message.error('QR Code not ready');
            return;
        }

        try {
            const html2canvas = (await import('html2canvas')).default;

            // Create a wrapper div
            const wrapper = document.createElement('div');
            wrapper.style.position = 'fixed';
            wrapper.style.left = '-9999px';
            wrapper.style.top = '0';
            document.body.appendChild(wrapper);

            // Clone the container
            const clone = qrContainer.cloneNode(true);
            clone.style.width = '450px';
            clone.style.height = '700px';
            clone.style.margin = '0';
            clone.style.boxShadow = 'none';
            clone.style.border = 'none';
            wrapper.appendChild(clone);

            // Create the canvas
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#FFFFFF',
                width: 450,
                height: 700,
                imageTimeout: 0,
                onclone: (clonedDoc) => {
                    const clonedWave = clonedDoc.querySelector('.wave-bg');
                    if (clonedWave) {
                        clonedWave.style.background = '#EBF3FF';
                    }
                }
            });

            // Clean up
            document.body.removeChild(wrapper);

            // Convert to blob and download
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        message.error('Failed to generate image');
                        return;
                    }

                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${formData?.title || 'form'}-qr-code.png`;
                    document.body.appendChild(link);
                    link.click();

                    setTimeout(() => {
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                    }, 100);

                    message.success({
                        content: 'QR Code downloaded successfully!',
                        className: 'custom-message-success',
                        icon: <FiDownload style={{ color: '#ffffff' }} />
                    });
                },
                'image/png',
                1.0
            );
        } catch (err) {
            console.error('Download error:', err);
            message.error('Failed to download QR code');
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel} className="close-button">
                    Close
                </Button>,
                <Button
                    key="download"
                    type="primary"
                    icon={<FiDownload />}
                    onClick={handleDownloadQR}
                    className="download-button"
                >
                    Download QR Code
                </Button>
            ]}
            width={520}
            destroyOnClose={true}
            centered
            className="qr-share-modal"
        >
            <div className="qr-preview-container">
                <div className="wave-bg" />
                <div className="preview-header">
                    <img src="/logo.png" alt="Grewox" className="header-logo" />
                    <h2>{formData?.title || 'CRM Software Inquiry Session'}</h2>
                    <div className="event-type">Online/Virtual Meeting</div>
                    <div className="date-range">
                        {startDate} - {endDate}
                    </div>
                </div>
                <div className="qr-card">
                    <canvas ref={qrCanvasRef} />
                    <img src="/logo.png" alt="Grewox" className="qr-logo" />
                </div>
                <div className="scan-text">Scan to access form</div>
                <div className="powered-by">
                    Powered by <span className="grewox">Grewox CRM</span>
                </div>
            </div>

            <div className="form-url">
                {formUrl}
                <Button type="text" className="copy-button" onClick={() => {
                    navigator.clipboard.writeText(formUrl);
                    message.success('Link copied to clipboard!');
                }}>
                    Copy
                </Button>
            </div>
        </Modal>
    );
};

export default GenerateLinkModal; 