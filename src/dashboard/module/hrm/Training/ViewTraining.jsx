import React from 'react';
import {
    Modal,
    Typography,
    Button,
    Space,
    Tag,
    Divider,
} from 'antd';
import { FiX, FiGrid, FiLink, FiCalendar, FiUser } from 'react-icons/fi';
import moment from 'moment';

const { Text, Title } = Typography;

const getYouTubeVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ViewTraining = ({ open, onCancel, training }) => {
    if (!training) return null;

    // Parse links if it's a string
    const links = typeof training.links === 'string' 
        ? JSON.parse(training.links) 
        : training.links;

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                '--antd-arrow-background-color': '#ffffff',
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '8px',
                    overflow: 'hidden',
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}
            >
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
                        transition: 'all 0.3s ease',
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
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                    }}
                >
                    <div
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <FiGrid style={{ fontSize: '24px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: '0',
                                fontSize: '24px',
                                fontWeight: '600',
                                color: '#ffffff',
                            }}
                        >
                            Training Details
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            View complete training information
                        </Text>
                    </div>
                </div>
            </div>

            <div style={{ padding: '24px' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    {/* Category */}
                    <div>
                        <Text strong style={{ fontSize: '14px', color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
                            Category
                        </Text>
                        <Tag 
                            color="blue" 
                            style={{ 
                                padding: '6px 16px', 
                                fontSize: '14px',
                                borderRadius: '6px',
                                border: 'none',
                                background: '#e6f7ff',
                                color: '#1890ff'
                            }}
                        >
                            {training.category}
                        </Tag>
                    </div>

                    {/* Title */}
                    <div>
                        <Text strong style={{ fontSize: '14px', color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
                            Training Title
                        </Text>
                        <Title 
                            level={4} 
                            style={{ 
                                margin: 0,
                                color: '#262626',
                                fontSize: '20px',
                                fontWeight: '600'
                            }}
                        >
                            {training.title}
                        </Title>
                    </div>

                    {/* Video Player */}
                    {links?.url && (
                        <div>
                            <Text strong style={{ fontSize: '14px', color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
                                Training Videos
                            </Text>
                            <div 
                                style={{ 
                                    marginTop: '8px',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                    gap: '16px'
                                }}
                            >
                                {Array.isArray(links.url) ? links.url.map((url, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            background: '#f5f5f5',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                        }}
                                    >
                                        <div style={{ marginBottom: '12px' }}>
                                            <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                                Video {index + 1}
                                            </Text>
                                        </div>
                                        {url.includes('youtube.com') || url.includes('youtu.be') ? (
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(url)}`}
                                                title={`Training Video ${index + 1}`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{ 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ) : url.includes('vimeo.com') ? (
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={url.replace('vimeo.com', 'player.vimeo.com/video')}
                                                title={`Training Video ${index + 1}`}
                                                frameBorder="0"
                                                allow="autoplay; fullscreen"
                                                allowFullScreen
                                                style={{ 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ) : (
                                            <video
                                                width="100%"
                                                height="200"
                                                controls
                                                style={{ 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <source src={url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                )) : (
                                    // Single video
                                    <div
                                        style={{
                                            background: '#f5f5f5',
                                            padding: '16px',
                                            borderRadius: '12px',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                                        }}
                                    >
                                        <div style={{ marginBottom: '12px' }}>
                                            <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                                Training Video
                                            </Text>
                                        </div>
                                        {links.url.includes('youtube.com') || links.url.includes('youtu.be') ? (
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={`https://www.youtube.com/embed/${getYouTubeVideoId(links.url)}`}
                                                title="Training Video"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{ 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ) : links.url.includes('vimeo.com') ? (
                                            <iframe
                                                width="100%"
                                                height="200"
                                                src={links.url.replace('vimeo.com', 'player.vimeo.com/video')}
                                                title="Training Video"
                                                frameBorder="0"
                                                allow="autoplay; fullscreen"
                                                allowFullScreen
                                                style={{ 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                        ) : (
                                            <video
                                                width="100%"
                                                height="200"
                                                controls
                                                style={{ 
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                <source src={links.url} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Created At */}
                    <div>
                        <Text strong style={{ fontSize: '14px', color: '#8c8c8c', display: 'block', marginBottom: '8px' }}>
                            Created At
                        </Text>
                        <div style={{ 
                            marginTop: '8px',
                            background: '#f5f5f5',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <FiCalendar style={{ color: '#1890ff', fontSize: '18px' }} />
                            <Text style={{ color: '#595959' }}>
                                {moment(training.created_at).format('MMMM D, YYYY h:mm A')}
                            </Text>
                        </div>
                    </div>

                    <Divider style={{ margin: '24px 0' }} />

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <Button
                            size="large"
                            onClick={onCancel}
                            style={{
                                padding: '8px 24px',
                                height: '44px',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#ffffff',
                                color: '#595959',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#f5f5f5';
                                e.currentTarget.style.borderColor = '#d9d9d9';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#ffffff';
                                e.currentTarget.style.borderColor = '#e6e8eb';
                            }}
                        >
                            Close
                        </Button>
                    </div>
                </Space>
            </div>
        </Modal>
    );
};

export default ViewTraining;
