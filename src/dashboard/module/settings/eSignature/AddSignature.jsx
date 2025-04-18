import React, { useRef, useState } from 'react';
import {
    Modal,
    Input,
    Button,
    Typography,
    message,
    Divider,
    Tooltip
} from 'antd';
import {
    FiSave,
    FiTrash2,
    FiEdit,
    FiInfo,
    FiImage,
    FiCamera,
    FiX,
    FiPenTool
} from 'react-icons/fi';
import SignatureCanvas from 'react-signature-canvas';
import { useCreateSignatureMutation, useUpdateSignatureMutation } from './services/esignatureApi';

const { Text } = Typography;

const AddSignature = ({ visible, onCancel, isEditing, initialValues, onSuccess }) => {
    const [signatureName, setSignatureName] = useState(initialValues?.name || '');
    const [signatureType, setSignatureType] = useState(initialValues?.type || 'draw');
    const [uploadedImage, setUploadedImage] = useState(initialValues?.data || null);

    const sigCanvas = useRef(null);
    const uploadRef = useRef(null);

    const [createSignature, { isLoading: isCreating }] = useCreateSignatureMutation();
    const [updateSignatureApi, { isLoading: isUpdating }] = useUpdateSignatureMutation();

    const handleSaveSignature = async () => {
        if (!signatureName.trim()) {
            message.error('Please enter a name for your signature');
            return;
        }

        // Create FormData object for API submission
        const formData = new FormData();
        formData.append('esignature_name', signatureName);
        formData.append('type', signatureType);

        let signatureData;
        let fileToUpload;

        if (signatureType === 'draw') {
            if (sigCanvas.current.isEmpty()) {
                message.error('Please draw your signature');
                return;
            }

            // Get the data URL from canvas
            signatureData = sigCanvas.current.toDataURL('image/png');

            // Convert data URL to file
            const base64Response = await fetch(signatureData);
            const blob = await base64Response.blob();
            fileToUpload = new File([blob], `${signatureName}.png`, { type: 'image/png' });

        } else {
            if (!uploadedImage) {
                message.error('Please upload an image');
                return;
            }

            signatureData = uploadedImage;

            // Convert uploaded image to file
            const base64Response = await fetch(uploadedImage);
            const blob = await base64Response.blob();
            fileToUpload = new File([blob], `${signatureName}.png`, { type: 'image/png' });
        }

        // Append the file to FormData
        formData.append('e_signatures', fileToUpload);

        try {
            if (isEditing && initialValues?.id) {
                formData.append('id', initialValues.id);
                const result = await updateSignatureApi({
                    id: initialValues.id,
                    data: formData
                }).unwrap();

                message.success('Signature updated successfully');
            } else {
                const result = await createSignature(formData).unwrap();
                message.success('Signature created successfully');
            }

            clearSignature();
            onSuccess?.();
            onCancel();
        } catch (error) {
            console.error('Operation failed:', error);
            message.error(`Operation failed: ${error.message || 'Unknown error'}`);
        }
    };

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setUploadedImage(null);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type and size
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('You can only upload image files!');
            return;
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must be smaller than 2MB!');
            return;
        }

        // Read and display the file
        const reader = new FileReader();
        reader.onload = (event) => {
            setUploadedImage(event.target.result);
            message.success('Image uploaded successfully. Click Save to complete.');
        };
        reader.onerror = () => {
            message.error('Failed to read the image file.');
        };
        reader.readAsDataURL(file);
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff'
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }
            }}
        >
            <div className="modal-header" style={{
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                padding: '24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                    }}
                >
                    <FiX style={{ fontSize: '20px' }} />
                </Button>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <FiPenTool style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2 style={{
                            margin: '0',
                            fontSize: '24px',
                            fontWeight: '600',
                            color: '#ffffff',
                        }}>
                            {isEditing ? 'Edit Signature' : 'Create New Signature'}
                        </h2>
                        <Text style={{
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.85)'
                        }}>
                            {isEditing ? 'Update signature information' : 'Create your electronic signature'}
                        </Text>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <div className="signature-form">
                    <div className="signature-form-input">
                        <label>Signature Name</label>
                        <Input
                            placeholder="Enter signature name"
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            style={{
                                borderRadius: '10px',
                                padding: '8px 16px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                        />
                    </div>

                    <div className="signature-type-selector">
                        <div className="single-button-toggle" style={{
                            display: 'flex',
                            gap: '8px',
                            marginBottom: '24px',
                            background: '#f8fafc',
                            padding: '4px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                        }}>
                            <div
                                className={`toggle-item ${signatureType === 'draw' ? 'active' : ''}`}
                                onClick={() => setSignatureType('draw')}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    background: signatureType === 'draw' ? '#1890ff' : 'transparent',
                                    color: signatureType === 'draw' ? '#ffffff' : '#64748b',
                                    fontWeight: 500,
                                }}
                            >
                                <FiEdit style={{ fontSize: '16px' }} />
                                Draw
                            </div>
                            <div
                                className={`toggle-item ${signatureType === 'upload' ? 'active' : ''}`}
                                onClick={() => setSignatureType('upload')}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    background: signatureType === 'upload' ? '#1890ff' : 'transparent',
                                    color: signatureType === 'upload' ? '#ffffff' : '#64748b',
                                    fontWeight: 500,
                                }}
                            >
                                <FiImage style={{ fontSize: '16px' }} />
                                Upload
                            </div>
                        </div>
                    </div>

                    <div className="signature-canvas-container" style={{
                        marginTop: '24px',
                        background: '#ffffff',
                        border: '1px solid #e6e8eb',
                        borderRadius: '12px',
                        padding: '24px',
                        minHeight: '300px'
                    }}>
                        {signatureType === 'draw' ? (
                            <>
                                <div className="signature-canvas-wrapper" style={{
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        border: '1px dashed #e6e8eb',
                                        padding: '16px',
                                        position: 'relative'
                                    }}>
                                        <SignatureCanvas
                                            ref={sigCanvas}
                                            canvasProps={{
                                                width: 600,
                                                height: 200,
                                                className: 'signature-canvas',
                                                style: {
                                                    width: '100%',
                                                    height: '200px',
                                                    borderRadius: '8px'
                                                }
                                            }}
                                            backgroundColor="rgba(247, 250, 252, 1)"
                                        />
                                        <Tooltip title="Clear signature">
                                            <Button
                                                icon={<FiTrash2 />}
                                                onClick={clearSignature}
                                                style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: '6px',
                                                    border: '1px solid #e6e8eb',
                                                    width: '32px',
                                                    height: '32px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0
                                                }}
                                            />
                                        </Tooltip>
                                    </div>
                                    <div className="signature-hint" style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#64748b',
                                        fontSize: '14px',
                                        background: '#f8fafc',
                                        padding: '12px 16px',
                                        borderRadius: '8px',
                                        width: '100%'
                                    }}>
                                        <FiInfo size={16} style={{ color: '#1890ff' }} />
                                        <span>Draw your signature using your mouse or touch device</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="signature-upload-container" style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '16px'
                            }}>
                                {uploadedImage ? (
                                    <div className="uploaded-image-container" style={{
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px dashed #e6e8eb',
                                            padding: '16px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            <img
                                                src={uploadedImage}
                                                alt="Uploaded signature"
                                                style={{
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    objectFit: 'contain',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </div>
                                        <div className="image-actions" style={{
                                            display: 'flex',
                                            gap: '12px',
                                            justifyContent: 'center',
                                            width: '100%'
                                        }}>
                                            <Button
                                                danger
                                                icon={<FiTrash2 style={{ fontSize: '16px' }} />}
                                                onClick={() => setUploadedImage(null)}
                                                style={{
                                                    height: '44px',
                                                    padding: '0 24px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                Remove
                                            </Button>
                                            <Button
                                                type="primary"
                                                icon={<FiCamera style={{ fontSize: '16px' }} />}
                                                onClick={() => uploadRef.current.click()}
                                                style={{
                                                    height: '44px',
                                                    padding: '0 24px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px'
                                                }}
                                            >
                                                Change Image
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="upload-placeholder"
                                        onClick={() => uploadRef.current.click()}
                                        style={{
                                            width: '100%',
                                            minHeight: '240px',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '2px dashed #e6e8eb',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '16px',
                                            padding: '32px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#1890ff';
                                            e.currentTarget.style.background = '#f0f7ff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e6e8eb';
                                            e.currentTarget.style.background = '#f8fafc';
                                        }}
                                    >
                                        <div className="upload-icon-wrapper" style={{
                                            width: '64px',
                                            height: '64px',
                                            borderRadius: '16px',
                                            background: '#e6f4ff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FiCamera size={32} style={{ color: '#1890ff' }} />
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <p style={{
                                                fontSize: '16px',
                                                fontWeight: 500,
                                                color: '#1e293b',
                                                margin: '0 0 4px'
                                            }}>Upload Your Signature</p>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#64748b',
                                                margin: '0 0 16px'
                                            }}>Click or drag image here</p>
                                            <Button
                                                type="primary"
                                                icon={<FiCamera style={{ fontSize: '16px' }} />}
                                                style={{
                                                    height: '44px',
                                                    padding: '0 24px',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    margin: '0 auto'
                                                }}
                                            >
                                                Select File
                                            </Button>
                                        </div>
                                        <div className="upload-info" style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginTop: '8px'
                                        }}>
                                            <Text type="secondary" style={{ fontSize: '13px' }}>
                                                Supported formats: JPG, PNG, GIF
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '13px' }}>
                                                Max file size: 2MB
                                            </Text>
                                        </div>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={uploadRef}
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>
                        )}
                    </div>

                    <Divider style={{ margin: '24px 0' }} />

                    <div className="signature-form-actions" style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px'
                    }}>
                        <Button
                            onClick={onCancel}
                            style={{
                                height: '44px',
                                padding: '0 24px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 500
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            icon={<FiSave style={{ fontSize: '16px' }} />}
                            onClick={handleSaveSignature}
                            loading={isCreating || isUpdating}
                            style={{
                                height: '44px',
                                padding: '0 24px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                background: '#1890ff',
                                border: 'none'
                            }}
                        >
                            {isEditing ? 'Update Signature' : 'Save Signature'}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AddSignature; 