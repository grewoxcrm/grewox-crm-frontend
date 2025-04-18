import React from 'react';
import { Tooltip } from 'antd';
import { FiHardDrive } from 'react-icons/fi';

const StorageUsageDisplay = ({ used, total, percentage }) => {
    // Format storage size to show exact value with 2 decimal places
    const formatStorage = (size) => {
        if (size === 0) return '0.00';
        return Number(size).toFixed(2);
    };

    // Calculate exact percentage
    const exactPercentage = Number(percentage).toFixed(2);

    // Determine color based on usage percentage
    const getColor = (percent) => {
        if (percent >= 90) return '#ff4d4f';
        if (percent >= 70) return '#faad14';
        return '#52c41a';
    };

    const color = getColor(percentage);

    // Create detailed tooltip content
    const tooltipContent = (
        <div className="storage-tooltip">
            <div className="tooltip-row">
                <span>Used Storage:</span>
                <span className="value">{formatStorage(used)} MB</span>
            </div>
            <div className="tooltip-row">
                <span>Total Storage:</span>
                <span className="value">{formatStorage(total)} MB</span>
            </div>
            <div className="tooltip-row">
                <span>Usage:</span>
                <span className="value">{exactPercentage}%</span>
            </div>
        </div>
    );

    return (
        <div className="storage-usage-display">
            <div className="storage-info">
                <Tooltip title={tooltipContent} overlayClassName="storage-tooltip-overlay">
                    <div className="storage-icon">
                        <FiHardDrive />
                    </div>
                </Tooltip>
                <div className="storage-details">
                    <div className="storage-text">
                        {formatStorage(used)} / {formatStorage(total)} MB
                    </div>
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: color
                            }}
                        />
                        <span className="percentage">{exactPercentage}%</span>
                    </div>
                </div>
            </div>
            <style jsx>{`
                .storage-usage-display {
                    min-width: 220px;
                }
                .storage-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    transition: all 0.3s ease;
                }
                .storage-info:hover {
                    background: #f0f2f5;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
                }
                .storage-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    background: #e6f4ff;
                    border-radius: 6px;
                    color: #1890ff;
                    font-size: 16px;
                    transition: all 0.3s ease;
                }
                .storage-info:hover .storage-icon {
                    transform: scale(1.05);
                }
                .storage-details {
                    flex: 1;
                }
                .storage-text {
                    font-size: 13px;
                    font-family: 'SF Mono', 'Roboto Mono', monospace;
                    color: #1f2937;
                    margin-bottom: 4px;
                }
                .progress-container {
                    position: relative;
                    height: 6px;
                    background: #f0f0f0;
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-bar {
                    position: absolute;
                    left: 0;
                    top: 0;
                    height: 100%;
                    border-radius: 3px;
                    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .percentage {
                    position: absolute;
                    right: 0;
                    top: -18px;
                    font-size: 11px;
                    color: #666;
                    opacity: 0;
                    transform: translateY(5px);
                    transition: all 0.3s ease;
                }
                .storage-info:hover .percentage {
                    opacity: 1;
                    transform: translateY(0);
                }
                :global(.storage-tooltip-overlay) {
                    max-width: 300px;
                }
                :global(.storage-tooltip) {
                    padding: 4px;
                }
                :global(.tooltip-row) {
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    margin: 4px 0;
                    font-size: 12px;
                }
                :global(.tooltip-row .value) {
                    font-family: 'SF Mono', 'Roboto Mono', monospace;
                    color: #1890ff;
                }
            `}</style>
        </div>
    );
};

export default StorageUsageDisplay; 