import React, { useEffect, useState, useRef } from 'react';
import {
  Modal,
  Typography,
  Button,
  Table,
  Row,
  Col,
  Card,
  Divider,
  Image,
  Space,
  message,
  Tag,
  Dropdown
} from 'antd';
import { FiX, FiDownload, FiPrinter, FiMail, FiShare2, FiCopy, FiEye } from 'react-icons/fi';
import dayjs from 'dayjs';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useGetCustomersQuery } from '../customer/services/custApi';
import { useGetContactsQuery } from '../../crm/contact/services/contactApi';
import { useGetCompanyAccountsQuery } from '../../crm/companyacoount/services/companyAccountApi';
import { useGetCreditNotesQuery } from '../creditnotes/services/creditNoteApi';
import { useGetAllSettingsQuery } from '../../../../superadmin/module/settings/general/services/settingApi';
import { QRCodeSVG } from 'qrcode.react';
import './invoice.scss';
import { useSendInvoiceEmailMutation } from './services/invoiceApi';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useSelector } from 'react-redux';
// import { sendInvoiceEmail } from './services/invoiceApi';


const ViewInvoice = ({ open, onCancel, invoice, onDownload }) => {

  const [billingData, setBillingData] = useState(null);
  const [creditNoteAmount, setCreditNoteAmount] = useState(0);
  const printRef = useRef();
  
  const loggedInUser = useSelector(selectCurrentUser);
  const id = loggedInUser?.id;
  const { data: customersData } = useGetCustomersQuery();
  const { data: contactsData } = useGetContactsQuery();
  const { data: companyAccountsData } = useGetCompanyAccountsQuery();
  const { data: creditNotesData } = useGetCreditNotesQuery(invoice?.id, {
    skip: !invoice?.id
  });

  
  const { data: settingsData } = useGetAllSettingsQuery(id);

  const [sendInvoiceEmail] = useSendInvoiceEmailMutation();
  // State for company information
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyName, setCompanyName] = useState('Grewox CRM');
  const [companyEmail, setCompanyEmail] = useState('contact@grewox.com');
  const [companyWebsite, setCompanyWebsite] = useState('www.grewox.com');
  const [merchantUpiId, setMerchantUpiId] = useState('');

  // Get company settings from general settings
  useEffect(() => {
    if (settingsData?.success && settingsData?.data && settingsData.data.length > 0) {
      const settings = settingsData.data[0];
      
      // Set company logo if available
      if (settings.companylogo) {
        setCompanyLogo(settings.companylogo);
      }
      
      // Set company name if available
      if (settings.companyName) {
        setCompanyName(settings.companyName);
      } 
      
      // Set merchant name as email if available
      if (settings.merchant_name) {
        setCompanyEmail(settings.merchant_name);
      }
      
      // Set merchant UPI ID if available
      if (settings.merchant_upi_id) {
        setMerchantUpiId(settings.merchant_upi_id);
        setCompanyWebsite(settings.merchant_upi_id);
      }
    } 
  }, [settingsData]);

  useEffect(() => {
    if (invoice?.customer && invoice?.category) {
      let data = null;

      switch (invoice.category) {
        case 'customer':
          data = customersData?.data?.find(c => c.id === invoice.customer);
          if (data) {
            setBillingData({
              name: data.name,
              email: data.email,
              contact: data.contact,
              address: data.billing_address
            });
          }
          break;

       
        default:
          setBillingData(null);
      }
    }
  }, [invoice, customersData, contactsData, companyAccountsData]);

  useEffect(() => {
    if (creditNotesData?.data) {
      const totalAmount = creditNotesData.data.reduce((sum, note) => {
        return sum + Number(note.amount || 0);
      }, 0);
      setCreditNoteAmount(totalAmount);
    }
  }, [creditNotesData]);

  const renderBillingDetails = () => {
    if (!billingData) {
      return 'Loading details...';
    }

    return (
      <>
        {`Name: ${billingData.name}`}<br />
        {/* {billingData.email && `Email: ${billingData.email}`}<br /> */}
        {billingData.contact && `Phone: ${billingData.contact}`}<br />
        {/* {billingData.address && (
          <>
            Address:<br />
            {typeof billingData.address === 'string' ? 
              billingData.address : 
              tryParseAddress(billingData.address)
            }
          </>
        )} */}
      </>
    );
  };

  const tryParseAddress = (address) => {
    try {
      if (typeof address === 'string') {
        const parsed = JSON.parse(address);
        return (
          <>
            {parsed.street && `${parsed.street},`}<br />
            {parsed.city && `${parsed.city},`} {parsed.state}<br />
            {parsed.country} {parsed.postal_code}
          </>
        );
      }
      return address;
    } catch (error) {
      return address;
    }
  };

  // Update getPaymentUrl function
  const getPaymentUrl = () => {
    if (!invoice) return '';
    
    // If there's a UPI ID, create a UPI payment URL
    if (merchantUpiId) {
      const amount = Number(invoice?.total || 0);
      const tr = invoice?.salesInvoiceNumber || '';
      const pn = companyName || 'Merchant';
      
      // Create UPI URL with parameters
      return `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(pn)}&am=${amount}&tr=${tr}&tn=Invoice%20Payment`;
    }
    
    // Fallback to invoice link if no UPI ID
    return `${window.location.origin}/invoice/${invoice.salesInvoiceNumber}`;
  };

  const handleDownload = async () => {
    try {
      const element = document.getElementById('invoice-content');
      if (!element) return;

      message.loading({ content: 'Generating PDF...', key: 'download' });

      // Add necessary styles before generating PDF
      const styleContent = `
        .bill-card.invoice-container {
          padding: 40px;
          background: white;
          width: 100%;
        }
        .bill-header {
          margin-bottom: 30px;
        }
        .company-info {
          display: flex;
          align-items: flex-start;
          gap: 20px;
        }
        .company-logo {
          max-height: 60px;
          width: auto;
          object-fit: contain;
        }
        .company-details {
          flex: 1;
        }
        .company-details h3 {
          margin: 0 0 5px 0;
          font-size: 24px;
          color: #333;
        }
        .company-details p {
          margin: 0;
          color: #666;
        }
        .bill-details {
          margin: 30px 0;
        }
        .bill-section {
          display: flex;
          justify-content: space-between;
          gap: 40px;
        }
        .bill-to, .bill-info {
          flex: 1;
        }
        .bill-to h4, .bill-info h4 {
          margin: 0 0 15px 0;
          color: #333;
        }
        .vendor-info h5 {
          margin: 0 0 10px 0;
          font-weight: normal;
        }
        .info-row {
          margin-bottom: 10px;
          display: flex;
          justify-content: space-between;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .items-table th {
          background: #f8f9fa;
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #ddd;
        }
        .text-right {
          text-align: right;
        }
        .total-row {
          font-weight: bold;
          background: #f8f9fa;
        }
        .payment-section {
          display: flex;
          gap: 40px;
          margin-top: 30px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        .qr-code {
          text-align: center;
        }
        .qr-info {
          margin-top: 10px;
        }
        .payment-info {
          flex: 1;
        }
        .bank-details {
          margin-top: 15px;
        }
        .bill-notes {
          margin-top: 30px;
        }
        .powered-by {
          margin-top: 20px;
          text-align: center;
          color: #666;
          font-size: 12px;
        }
        .status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
        }
        .status-badge.partially_paid {
          background: #ede9fe;
          color: #7c3aed;
        }
      `;

      // Create a temporary style element
      const style = document.createElement('style');
      style.textContent = styleContent;
      element.appendChild(style);

      // Wait for all images to load
      const images = element.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            if (img.classList.contains('company-logo')) {
              img.src = 'https://grewox.com/assets/logo.png';
              resolve();
            } else {
              reject();
            }
          };
        });
      }));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('invoice-content');
          // Add the same styles to cloned element
          const clonedStyle = document.createElement('style');
          clonedStyle.textContent = styleContent;
          clonedElement.appendChild(clonedStyle);
          
          // Ensure images are visible
          const clonedImages = clonedElement.getElementsByTagName('img');
          Array.from(clonedImages).forEach(img => {
            img.style.display = 'block';
            img.crossOrigin = 'anonymous';
          });
        }
      });

      // Remove the temporary style element
      element.removeChild(style);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice-${invoice?.salesInvoiceNumber || 'download'}.pdf`);

      message.success({ content: 'Invoice downloaded successfully!', key: 'download' });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      message.error({ content: 'Failed to download invoice', key: 'download' });
    }
  };

  const handlePrint = () => {
    const content = document.getElementById('invoice-content');
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.salesInvoiceNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Segoe UI', sans-serif;
              background: white;
            }
            .invoice-content {
              padding: 40px;
              background: white;
            }
          </style>
        </head>
        <body>
          <div class="invoice-content">
            ${content.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const openInvoiceInNewWindow = () => {
    const content = document.getElementById('invoice-content');
    const newWindow = window.open('', '_blank');
    
    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice?.salesInvoiceNumber}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Segoe UI', sans-serif;
              background: #f0f2f5;
            }
            .invoice-container {
              width: 210mm;
              min-height: 297mm;
              margin: 20px auto;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              padding: 30px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
            }
            .logo {
              height: 50px;
            }
            .company-info {
              text-align: right;
            }
            .company-info h2 {
              margin: 0;
              color: #0066ff;
            }
            .details {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .details-column {
              width: 45%;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #f0f4fa;
              text-align: left;
              padding: 12px;
              border-bottom: 1px solid #eaeaea;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #eaeaea;
            }
            .text-right {
              text-align: right;
            }
            .status-tag {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 6px;
              font-size: 12px;
            }
            .status-paid { color: #059669; background: #d1fae5; }
            .status-unpaid { color: #dc2626; background: #fee2e2; }
            .status-partial { color: #7c3aed; background: #ede9fe; }
            .status-draft { color: #d97706; background: #fef3c7; }
            .status-pending { color: #2563eb; background: #dbeafe; }
            .qr-section {
              text-align: center;
              margin-top: 30px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 12px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-box {
              background: white;
              padding: 12px;
              border-radius: 12px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .qr-text {
              margin-top: 12px;
              text-align: center;
            }
            .qr-text p {
              margin: 4px 0;
            }
            .scan-text {
              font-size: 13px;
              font-weight: 500;
              color: #4b5563;
            }
            .amount-text {
              font-size: 12px;
              color: #6b7280;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              color: #777;
              font-size: 12px;
            }
            .credit-note {
              color: #dc2626;
            }
            @media print {
              body {
                background: white;
              }
              .invoice-container {
                box-shadow: none;
                margin: 0;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            ${content.innerHTML}
          </div>
          <script>
            // Add print button
            const printButton = document.createElement('div');
            printButton.style.position = 'fixed';
            printButton.style.top = '20px';
            printButton.style.right = '20px';
            printButton.style.padding = '10px 20px';
            printButton.style.background = '#1890ff';
            printButton.style.color = 'white';
            printButton.style.borderRadius = '6px';
            printButton.style.cursor = 'pointer';
            printButton.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            printButton.innerHTML = 'Print Invoice';
            printButton.onclick = () => window.print();
            document.body.appendChild(printButton);
          </script>
        </body>
      </html>
    `);

    newWindow.document.close();
  };

  const handleSendInvoice = async () => {
    try {
      const category = invoice.category || 'customer';
      
      let customerData = null;
      customerData = customersData?.data?.find(c => c.id === invoice.customer);
      
      if (!customerData) {
        if (category === 'contact') {
          customerData = contactsData?.data?.find(c => c.id === invoice.customer);
        } else if (category === 'company_account') {
          customerData = companyAccountsData?.data?.find(c => c.id === invoice.customer);
        }
      }

      if (!customerData) {
        message.error('Customer data not found. Please make sure the customer exists.');
        return;
      }

      if (!customerData.email) {
        message.error('Please add email address for the customer before sending invoice');
        return;
      }

      message.loading({ content: 'Sending invoice...', key: 'sendInvoice' });

      const element = document.getElementById('invoice-content');
      if (!element) {
        message.error('Could not find invoice content. Please try again.');
        return;
      }

      // Get the HTML content with styles
      const htmlContent = `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 20px;
                font-family: 'Segoe UI', sans-serif;
                background: white;
              }
              .invoice-container {
                width: 100%;
                background: white;
                padding: 20px;
              }
              .company-logo {
                max-height: 60px;
                width: auto;
              }
              .company-info {
                margin-bottom: 30px;
              }
              .bill-details {
                margin: 20px 0;
              }
              .bill-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
              }
              .bill-to, .bill-info {
                flex: 1;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                padding: 12px;
                text-align: left;
                border-bottom: 1px solid #eaeaea;
              }
              th {
                background: #f0f4fa;
              }
              .text-right {
                text-align: right;
              }
              .total-row {
                font-weight: bold;
                background: #f8fafc;
              }
              .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 6px;
                font-size: 12px;
              }
              .status-paid { color: #059669; background: #d1fae5; }
              .status-unpaid { color: #dc2626; background: #fee2e2; }
              .status-partial { color: #7c3aed; background: #ede9fe; }
              .qr-section {
                text-align: center;
                margin-top: 30px;
                padding: 20px;
                background: #f8fafc;
                border-radius: 12px;
              }
            </style>
          </head>
          <body>
            <div class="invoice-container">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `;

      const customer = {
        name: customerData.name || customerData.company_name || `${customerData.first_name || ''} ${customerData.last_name || ''}`.trim(),
        email: customerData.email,
        contact: customerData.contact || customerData.phone || customerData.mobile,
        address: customerData.billing_address || customerData.address
      };

      // Clean up the invoice data
      const cleanInvoice = {
        ...invoice,
        currency: 'INR',
        items: invoice.items?.map(item => ({
          ...item,
          unit_price: Number(item.unit_price || item.rate || 0),
          quantity: Number(item.quantity || 0),
          amount: Number(item.amount || 0)
        })) || [],
        total: Number(invoice.total || 0),
        tax: Number(invoice.tax || 0),
        discount: Number(invoice.discount || 0),
        subtotal: Number(invoice.subtotal || 0)
      };

      const payload = {
        invoice: cleanInvoice,
        customer: customer,
        htmlContent: htmlContent
      };

      await sendInvoiceEmail({
        id: invoice.id,
        data: payload
      });

      message.success({ 
        content: 'Invoice sent successfully!', 
        key: 'sendInvoice' 
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      message.error({ 
        content: error?.response?.data?.message || 'Failed to send invoice. Please try again.', 
        key: 'sendInvoice' 
      });
    }
  };

  const shareItems = {
    items: [
     
      {
        key: 'email',
        icon: <FiMail />,
        label: 'Send to Customer',
        onClick: handleSendInvoice
      },
      {
        key: 'copy',
        icon: <FiCopy />,
        label: 'Copy Invoice Link',
        onClick: () => {
          const invoiceUrl = `${window.location.origin}/invoice/${invoice?.salesInvoiceNumber}`;
          navigator.clipboard.writeText(invoiceUrl)
            .then(() => message.success('Invoice link copied to clipboard!'))
            .catch(() => message.error('Failed to copy invoice link'));
        }
      }
    ]
  };

  if (!invoice) return null;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onCancel}
      footer={
        <Space key="actions">
          <Button 
            icon={<FiPrinter />} 
            onClick={handlePrint}
          >
            Print
          </Button>
          <Dropdown menu={shareItems} trigger={['click']} placement="topRight">
            <Button icon={<FiShare2 />}>Share</Button>
          </Dropdown>
          <Button 
            type="primary" 
            icon={<FiDownload />} 
            onClick={handleDownload}
          >
            Download
          </Button>
        </Space>
      }
      width={800}
      destroyOnClose={true}
      centered
      styles={{
        body: {
          marginTop: '15px',
          padding: '40px',
          height: '100%',
          width: '100%',
          fontFamily: "'Segoe UI', sans-serif"
        }
      }}
    >
      <div className="view-billing-container">
        <div className="view-billing-content">
          <div className="bill-card invoice-container" id="invoice-content">
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
                  <h4>Invoice To:</h4>
                  <div className="vendor-info">
                    <h5>Name: <span>{billingData?.name || 'N/A'}</span></h5>
                    {/* <p>{billingData?.address || ''}</p> */}
                    {/* {billingData?.email && <p>Email: {billingData.email}</p>} */}
                    {billingData?.contact && <p>Contact: {billingData.contact}</p>}
                  </div>
                </div>
                <div className="bill-info">
                  <div className="info-row">
                    <span className="label">Invoice No:</span>
                    <span className="value">{invoice?.salesInvoiceNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Date:</span>
                    <span className="value">{invoice?.issueDate ? dayjs(invoice.issueDate).format('DD MMMM YYYY') : ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Due Date:</span>
                    <span className="value">{invoice?.dueDate ? dayjs(invoice.dueDate).format('DD MMMM YYYY') : ''}</span>
                  </div>
                  <div className="info-row">
                    <span className="label">Status:</span>
                    <span className={`status-badge ${invoice?.payment_status?.toLowerCase()}`}>
                      {invoice?.payment_status}
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
                    <th>Qty</th>
                    <th>Rate</th>
                    <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
                  {Array.isArray(invoice.items) && invoice.items.map((item, index) => {
              const quantity = Number(item.quantity) || 0;
              const rate = Number(item.unit_price || item.rate) || 0;
              const amount = quantity * rate;
              
              return (
                <tr key={index}>
                        <td>{item.item_name || item.name || item.description}</td>
                        <td>{quantity}</td>
                        <td>₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="text-right">
                          ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                </tr>
              );
            })}
                  {Number(invoice?.tax) > 0 && (
                    <tr className="summary-row">
                      <td colSpan="3">GST</td>
                      <td className="text-right">
                        ₹{Number(invoice.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
              </tr>
            )} 
                  {Number(invoice?.discount) > 0 && (
                    <tr className="summary-row">
                      <td colSpan="3">Discount</td>
                      <td className="text-right">
                        ₹{Number(invoice.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
              </tr>
            )}
                  <tr className="total-row">
                    <td colSpan="3">Total Amount</td>
                    <td className="text-right total-amount">
                      ₹{Number(invoice?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                    <p className="amount">₹{Number(invoice?.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
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
                <p>{invoice?.note || 'Thank you for your payment!'}</p>
                <p className="powered-by">Powered by {companyName} | {companyWebsite}</p>
            </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewInvoice;