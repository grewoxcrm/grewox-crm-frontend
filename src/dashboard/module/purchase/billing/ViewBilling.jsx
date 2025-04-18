import React, { useEffect, useState } from 'react';
import { Spin } from 'antd';
import { useGetVendorsQuery } from './services/billingApi';
import { useGetAllSettingsQuery } from '../../../../superadmin/module/settings/general/services/settingApi';
import { QRCodeSVG } from 'qrcode.react';
import { FiDownload, FiPrinter, FiMail, FiShare2 } from 'react-icons/fi';
import './billing.scss';

// Add a helper function for safe number formatting
const formatNumber = (value) => {
  return Number(value || 0).toFixed(2);
};

const ViewBilling = ({ data }) => {
  // Fetch vendors data
  const { data: vendorsData } = useGetVendorsQuery();
  const { data: settingsData, isLoading: isSettingsLoading } = useGetAllSettingsQuery();

  
  // State for company information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState('Grewox CRM');
  const [companyEmail, setCompanyEmail] = useState('contact@grewox.com');
  const [companyWebsite, setCompanyWebsite] = useState('www.grewox.com');

  // Get company settings from general settings
  useEffect(() => {
    if (settingsData?.success && settingsData?.data && settingsData.data.length > 0) {
      const settings = settingsData.data[0];
      
      // Set company logo if available
      if (settings.companylogo) {
        setCompanyLogo(settings.companylogo);
      }
      
      // Set company name if available - note the correct property name is companyName
      if (settings.companyName) {
        setCompanyName(settings.companyName);
      } 
      
      // Set company email if available
      if (settings.email) {
        setCompanyEmail(settings.email);
      }
      
      // Set company website if available
      if (settings.website) {
        setCompanyWebsite(settings.website);
      }
    } 
  }, [settingsData]);

  if (!data) {
    return <div>No billing data found</div>;
  }

  // Find vendor details using vendor ID
  const vendorDetails = vendorsData?.data?.find(vendor => vendor.id === data.vendor) || {};

  // Format vendor address
  const formatVendorAddress = () => {
    if (!vendorDetails) return '';
    const addressParts = [
      vendorDetails.address,
    ].filter(Boolean);
    return addressParts.join(', ');
  };

  // Parse items safely
  let items = [];
  try {
    items = data?.items ? JSON.parse(data.items) : [];
  } catch (error) {
    items = [];
  }

  // Get payment URL for QR code
  const getPaymentUrl = () => {
    if (!data) return '';
    return data.upiLink || `https://grewox.com/bill/${data.billNumber}`;
  };

  return (
    <div className="view-billing-container">
     

      <div className="view-billing-content">
        <div className="bill-card">
          <div className="bill-header">
            <div className="company-info">
              {companyLogo ? (
                <img 
                  src={companyLogo} 
                  alt={`${companyName} Logo`} 
                  className="company-logo"
                />
              ) : (
                <img 
                  src="https://grewox.com/assets/logo.png" 
                  alt="Grewox Logo" 
                  className="company-logo"
                />
              )}
              <div className="company-details">
                <h3>{companyName}</h3>
                <p>{companyWebsite} | {companyEmail}</p>
              </div>
            </div>

          </div>

          <div className="bill-details">
            <div className="bill-section">
              <div className="bill-to">
                <h4>Bill To:</h4>
                <div className="vendor-info">
                  <h5>{vendorDetails?.name || 'N/A'}</h5>
                  <p>{formatVendorAddress()}</p>
                  {vendorDetails?.email && <p>Email: {vendorDetails.email}</p>}
                  {vendorDetails?.contact && <p>Contact: {vendorDetails.contact}</p>}
                  {vendorDetails?.taxNumber && <p>Tax Number: {vendorDetails.taxNumber}</p>}
                </div>
              </div>
              <div className="bill-info">
                <div className="info-row">
                  <span className="label">Bill No:</span>
                  <span className="value">{data?.billNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{data?.billDate ? new Date(data?.billDate).toLocaleDateString() : ''}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${data?.status?.toLowerCase() || data?.bill_status?.toLowerCase()}`}>
                    {data?.status || data?.bill_status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bill-items">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>HSN/SAC</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(items) && items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.itemName || item.name}</td>
                    <td>{item.hsnSac}</td>
                    <td>{item.quantity}</td>
                    <td>₹{formatNumber(item.unitPrice || item.price)}</td>
                    <td className="text-right">
                      ₹{formatNumber(item.amount || (item.quantity * (item.unitPrice || item.price)))}
                    </td>
                  </tr>
                ))}
                {Number(data?.discount) > 0 && (
                  <tr className="summary-row">
                    <td colSpan="4">Discount</td>
                    <td className="text-right">
                      ₹{formatNumber(data.discount)}
                    </td>
                  </tr>
                )}
                {Number(data?.tax) > 0 && (
                  <tr className="summary-row">
                    <td colSpan="4">Tax</td>
                    <td className="text-right">
                      ₹{formatNumber(data.tax)}
                    </td>
                  </tr>
                )}
                <tr className="total-row">
                  <td colSpan="4">Total Amount</td>
                  <td className="text-right total-amount">
                    ₹{formatNumber(data?.total)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bill-footer">
            <div className="payment-section">
              <div className="qr-code">
                <QRCodeSVG
                  value={getPaymentUrl()}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
                <div className="qr-info">
                  <p>Scan to Pay</p>
                  <p className="amount">₹{formatNumber(data?.total)}</p>
                </div>
              </div>
              <div className="payment-info">
                <h4>Payment Information</h4>
                <p>Thank you for your business!</p>
                <p>Please make payment to the following account:</p>
                <div className="bank-details">
                  <p><strong>Bank:</strong> Example Bank</p>
                  <p><strong>Account:</strong> 1234567890</p>
                  <p><strong>IFSC:</strong> EXAMPLE123</p>
                </div>
              </div>
            </div>
            <div className="bill-notes">
              <h4>Notes</h4>
              <p>{ 'Thank you for your payment!'}</p>
              <p>Computer Generated E-signature</p>
              <p className="powered-by">Powered by {companyName} | {companyWebsite}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBilling;
