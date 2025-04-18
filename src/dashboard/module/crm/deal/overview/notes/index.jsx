import React, { useState, useEffect } from 'react';
import { Card, List, Button, Modal, Form, Input, Tag, Select, message, Typography, Divider, Row, Col, Empty, Spin } from 'antd';
import { FiPlus, FiEdit2, FiTrash2, FiClock, FiUser, FiFileText, FiX, FiBookmark, FiMessageSquare, FiAlertCircle, FiStar, FiFile } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import {
    useCreateNotesMutation,
    useUpdateNotesMutation,
    useDeleteNotesMutation,
    useGetAllNotesQuery
} from '../../../../../../superadmin/module/notes/services/notesApi';
import './notes.scss';

const { TextArea } = Input;
const { Text } = Typography;

const EmptyNotesState = ({ onAddClick }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
        borderRadius: '16px',
        border: '1px dashed #E5E7EB'
    }}>
        <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, #E0F2FE, #DBEAFE)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
        }}>
            <FiMessageSquare style={{ fontSize: '32px', color: '#2563EB' }} />
        </div>
        <Text style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1F2937',
            marginBottom: '12px'
        }}>
            No Notes Yet
        </Text>
        <Text style={{
            fontSize: '14px',
            color: '#6B7280',
            marginBottom: '24px',
            textAlign: 'center',
            maxWidth: '400px'
        }}>
            Start adding notes to keep track of important information and updates about this lead.
        </Text>
        <Button
            type="primary"
            icon={<FiPlus />}
            onClick={onAddClick}
            style={{
                height: '44px',
                padding: '0 24px',
                fontSize: '15px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                transition: 'all 0.3s ease',
                ':hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 16px rgba(24, 144, 255, 0.25)'
                }
            }}
        >
            Add First Note
        </Button>
    </div>
);

const NoteDetailModal = ({ visible, note, onClose, formatDate }) => (
    <Modal
        visible={visible}
        onCancel={onClose}
        footer={null}
        width={600}
        style={{ top: 50 }}
        className="note-detail-modal"
        bodyStyle={{ padding: '0' }}
    >
        {note && (
            <>
                <div style={{
                    background: note.notetype === 'urgent'
                        ? 'linear-gradient(135deg, #FEF2F2, #FEE2E2)'
                        : note.notetype === 'important'
                            ? 'linear-gradient(135deg, #FFFBEB, #FEF3C7)'
                            : 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    padding: '32px',
                    borderRadius: '16px 16px 0 0',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent)',
                        borderRadius: '0 0 0 100%'
                    }} />
                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: note.notetype === 'urgent'
                                ? 'rgba(220, 38, 38, 0.1)'
                                : note.notetype === 'important'
                                    ? 'rgba(217, 119, 6, 0.1)'
                                    : 'rgba(5, 150, 105, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiFileText style={{
                                fontSize: '24px',
                                color: note.notetype === 'urgent'
                                    ? '#DC2626'
                                    : note.notetype === 'important'
                                        ? '#D97706'
                                        : '#059669'
                            }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: '24px',
                                fontWeight: '600',
                                color: note.notetype === 'urgent'
                                    ? '#991B1B'
                                    : note.notetype === 'important'
                                        ? '#92400E'
                                        : '#065F46',
                                display: 'block',
                                marginBottom: '8px'
                            }}>
                                {note.note_title}
                            </Text>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <Tag style={{
                                    margin: 0,
                                    padding: '2px 12px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    border: 'none',
                                    background: note.notetype === 'urgent'
                                        ? '#FEE2E2'
                                        : note.notetype === 'important'
                                            ? '#FEF3C7'
                                            : '#D1FAE5',
                                    color: note.notetype === 'urgent'
                                        ? '#DC2626'
                                        : note.notetype === 'important'
                                            ? '#D97706'
                                            : '#059669'
                                }}>
                                    {note.notetype?.charAt(0).toUpperCase() + note.notetype?.slice(1)}
                                </Tag>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#6B7280',
                                    fontSize: '13px'
                                }}>
                                    <FiClock style={{ fontSize: '14px' }} />
                                    {note.createdAt ? formatDate(note.createdAt) : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{
                    padding: '24px 32px',
                    background: 'white',
                    borderRadius: '0 0 16px 16px'
                }}>
                    <div style={{
                        fontSize: '15px',
                        lineHeight: '1.6',
                        color: '#374151',
                        whiteSpace: 'pre-wrap'
                    }}>
                        {note.description}
                    </div>
                </div>
            </>
        )}
    </Modal>
);

const NoteTypeTag = ({ type = 'general' }) => {
    const getTypeStyles = (noteType) => {
        switch (noteType?.toLowerCase()) {
            case 'urgent':
                return {
                    background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                    color: '#DC2626',
                    icon: <FiAlertCircle style={{ fontSize: '14px' }} />
                };
            case 'important':
                return {
                    background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                    color: '#D97706',
                    icon: <FiStar style={{ fontSize: '14px' }} />
                };
            case 'general':
            default:
                return {
                    background: 'linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)',
                    color: '#059669',
                    icon: <FiFile style={{ fontSize: '14px' }} />
                };
        }
    };

    const styles = getTypeStyles(type);
    const displayText = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'General';

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            background: styles.background,
            color: styles.color,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            border: `1px solid ${styles.color}20`
        }}>
            {styles.icon}
            <span>{displayText}</span>
        </div>
    );
};

const DealNotes = ({ deal }) => {

    const dealId = deal.id;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [selectedNote, setSelectedNote] = useState(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [localNotes, setLocalNotes] = useState([]);
    const [form] = Form.useForm();
    const user = useSelector(selectCurrentUser);

    const { data: notes = [], isLoading, refetch } = useGetAllNotesQuery(dealId);
    const [createNote] = useCreateNotesMutation();
    const [updateNote] = useUpdateNotesMutation();
    const [deleteNote] = useDeleteNotesMutation();

    useEffect(() => {
        if (notes) {
            setLocalNotes(notes);
        }
    }, [notes]);

    const filteredNotes = React.useMemo(() => {
        if (filterType === 'all') return localNotes;
        return localNotes.filter(note => note.notetype === filterType);
    }, [localNotes, filterType]);

    const noteCounts = React.useMemo(() => ({
        all: localNotes.length,
        urgent: localNotes.filter(note => note.notetype === 'urgent').length,
        important: localNotes.filter(note => note.notetype === 'important').length,
        general: localNotes.filter(note => note.notetype === 'general').length,
    }), [localNotes]);

    const handleAddNote = () => {
        form.resetFields();
        setEditingNote(null);
        setIsModalVisible(true);
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        form.setFieldsValue({
            note_title: note.note_title,
            notetype: note.notetype,
            description: note.description
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (noteId) => {
        try {
            await deleteNote(noteId).unwrap();
            setLocalNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            message.success('Note deleted successfully');
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete note');
        }
    };

    const handleModalSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!values.note_title?.trim()) {
                message.error('Note title is required');
                return;
            }

            const payload = {
                note_title: values.note_title.trim(),
                notetype: values.notetype || 'general',
                description: values.description?.trim() || '',
                employees: null
            };

            if (editingNote) {
                await updateNote({ id: editingNote.id, data: payload }).unwrap();
                setLocalNotes(prevNotes =>
                    prevNotes.map(note =>
                        note.id === editingNote.id
                            ? { ...note, ...payload }
                            : note
                    )
                );
                message.success('Note updated successfully');
            } else {
                const response = await createNote({ id: dealId, data: payload }).unwrap();
                setLocalNotes(prevNotes => [...prevNotes, response.data]);
                message.success('Note created successfully');
            }

            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            if (error?.data?.message) {
                message.error(error.data.message);
            } else {
                message.error('Failed to save note');
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleNoteClick = (note) => {
        setSelectedNote(note);
        setIsDetailVisible(true);
    };

    return (
        <div className="lead-notes">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)'
                        }}>
                            <FiFileText style={{ fontSize: '20px', color: '#2563EB' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500' }}>Total Notes</div>
                            <div style={{ fontSize: '20px', color: '#111827', fontWeight: '600' }}>{noteCounts.all}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[
                            { key: 'all', icon: FiFileText, label: 'All', color: '#2563EB', bgColor: '#EFF6FF' },
                            { key: 'urgent', icon: FiAlertCircle, label: 'Urgent', color: '#DC2626', bgColor: '#FEF2F2' },
                            { key: 'important', icon: FiStar, label: 'Important', color: '#D97706', bgColor: '#FFFBEB' },
                            { key: 'general', icon: FiFile, label: 'General', color: '#059669', bgColor: '#ECFDF5' }
                        ].map(item => {
                            const Icon = item.icon;
                            const isSelected = filterType === item.key;
                            return (
                                <Button
                                    key={item.key}
                                    onClick={() => setFilterType(item.key)}
                                    style={{
                                        height: '40px',
                                        padding: '0 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: isSelected ? item.bgColor : 'white',
                                        border: `1px solid ${isSelected ? item.color : '#E5E7EB'}`,
                                        borderRadius: '10px',
                                        color: isSelected ? item.color : '#6B7280',
                                        fontWeight: '500',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <Icon style={{ fontSize: '16px' }} />
                                    {item.label}
                                    <span style={{
                                        background: isSelected ? 'white' : item.bgColor,
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: item.color,
                                        marginLeft: '4px'
                                    }}>
                                        {noteCounts[item.key]}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <Button
                    type="primary"
                    icon={<FiPlus style={{ fontSize: '18px' }} />}
                    onClick={handleAddNote}
                    className="add-note-btn"
                    style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        height: '44px',
                        padding: '0 24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        fontSize: '15px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        ':hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(24, 144, 255, 0.25)'
                        }
                    }}
                >
                    Add Note
                </Button>
            </div>

            {isLoading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '40px'
                }}>
                    <Spin size="large" />
                </div>
            ) : filteredNotes?.length === 0 ? (
                <EmptyNotesState onAddClick={handleAddNote} />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => handleNoteClick(note)}
                            style={{
                                cursor: 'pointer',
                                background: '#FFFFFF',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                                border: '1px solid',
                                borderColor: note.notetype === 'urgent'
                                    ? '#FEE2E2'
                                    : note.notetype === 'important'
                                        ? '#FEF3C7'
                                        : '#ECFDF5'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 16px',
                                gap: '12px',
                                position: 'relative',
                                background: note.notetype === 'urgent'
                                    ? 'linear-gradient(to right, #FEE2E2 0%, #FFFFFF 100%)'
                                    : note.notetype === 'important'
                                        ? 'linear-gradient(to right, #FEF3C7 0%, #FFFFFF 100%)'
                                        : 'linear-gradient(to right, #ECFDF5 0%, #FFFFFF 100%)'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '3px',
                                    height: '100%',
                                    background: note.notetype === 'urgent'
                                        ? '#DC2626'
                                        : note.notetype === 'important'
                                            ? '#D97706'
                                            : '#059669'
                                }} />

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '4px'
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '10px',
                                            background: note.notetype === 'urgent'
                                                ? 'rgba(220, 38, 38, 0.1)'
                                                : note.notetype === 'important'
                                                    ? 'rgba(217, 119, 6, 0.1)'
                                                    : 'rgba(5, 150, 105, 0.1)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {note.notetype === 'urgent' ? (
                                                <FiAlertCircle style={{ fontSize: '20px', color: '#DC2626' }} />
                                            ) : note.notetype === 'important' ? (
                                                <FiStar style={{ fontSize: '20px', color: '#D97706' }} />
                                            ) : (
                                                <FiFile style={{ fontSize: '20px', color: '#059669' }} />
                                            )}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <Text style={{
                                                fontSize: '19px',
                                                fontWeight: '600',
                                                color: note.notetype === 'urgent'
                                                    ? '#991B1B'
                                                    : note.notetype === 'important'
                                                        ? '#92400E'
                                                        : '#065F46',
                                                display: 'block',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                letterSpacing: '-0.01em',
                                                marginBottom: '2px'
                                            }}>
                                                {note.note_title}
                                            </Text>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#6B7280',
                                                display: '-webkit-box',
                                                WebkitLineClamp: '1',
                                                WebkitBoxOrient: 'vertical',
                                                overflow: 'hidden',
                                                lineHeight: '1.4'
                                            }}>
                                                {note.description}
                                            </div>
                                        </div>
                                        <NoteTypeTag type={note.notetype} />
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        marginTop: '12px'
                                    }}>
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            color: '#6B7280',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}>
                                            <FiClock style={{ fontSize: '14px' }} />
                                            {formatDate(note.createdAt)}
                                        </span>
                                        <div style={{
                                            display: 'flex',
                                            gap: '8px'
                                        }}>
                                            <Button
                                                type="text"
                                                icon={<FiEdit2 style={{ fontSize: '14px' }} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(note);
                                                }}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    minWidth: '32px',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#1890ff',
                                                    background: 'rgba(24, 144, 255, 0.1)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Button
                                                type="text"
                                                icon={<FiTrash2 style={{ fontSize: '14px' }} />}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(note.id);
                                                }}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    minWidth: '32px',
                                                    padding: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#EF4444',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                title={null}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
                width={520}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                style={{
                    "--antd-arrow-background-color": "#ffffff",
                }}
                styles={{
                    body: {
                        padding: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
                    },
                }}
            >
                <div
                    className="modal-header"
                    style={{
                        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                        padding: "24px",
                        color: "#ffffff",
                        position: "relative",
                    }}
                >
                    <Button
                        type="text"
                        onClick={() => {
                            setIsModalVisible(false);
                            form.resetFields();
                        }}
                        style={{
                            position: "absolute",
                            top: "16px",
                            right: "16px",
                            color: "#ffffff",
                            width: "32px",
                            height: "32px",
                            padding: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(255, 255, 255, 0.2)",
                            borderRadius: "8px",
                            border: "none",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                        }}
                    >
                        <FiX style={{ fontSize: "20px" }} />
                    </Button>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <div
                            style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "12px",
                                background: "rgba(255, 255, 255, 0.2)",
                                backdropFilter: "blur(8px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FiFileText style={{ fontSize: "24px", color: "#ffffff" }} />
                        </div>
                        <div>
                            <h2
                                style={{
                                    margin: "0",
                                    fontSize: "24px",
                                    fontWeight: "600",
                                    color: "#ffffff",
                                }}
                            >
                                {editingNote ? "Edit Note" : "Create New Note"}
                            </h2>
                            <Text
                                style={{
                                    fontSize: "14px",
                                    color: "rgba(255, 255, 255, 0.85)",
                                }}
                            >
                                {editingNote ? "Update note information" : "Fill in the information to create note"}
                            </Text>
                        </div>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleModalSubmit}
                    requiredMark={false}
                    style={{
                        padding: "24px",
                    }}
                >
                    <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <Form.Item
                            name="note_title"
                            label={
                                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                    Note Title
                                </span>
                            }
                            rules={[{ required: true, message: "Please enter note title" }]}
                            style={{ flex: 1, marginBottom: 0 }}
                        >
                            <Input
                                prefix={<FiFileText style={{ color: "#1890ff", fontSize: "16px" }} />}
                                placeholder="Enter note title"
                                size="large"
                                style={{
                                    borderRadius: "10px",
                                    padding: "8px 16px",
                                    height: "48px",
                                    backgroundColor: "#f8fafc",
                                    border: "1px solid #e6e8eb",
                                    transition: "all 0.3s ease",
                                }}
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="notetype"
                        label={
                            <span style={{ fontSize: "14px", fontWeight: "500" }}>
                                Note Type
                            </span>
                        }
                        rules={[{ required: true, message: "Please select note type" }]}
                    >
                        <Select
                            placeholder="Select note type"
                            size="large"
                            style={{
                                width: "100%",
                                borderRadius: "10px",
                                height: "48px",
                            }}
                        >
                            <Select.Option value="general">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiFile style={{ fontSize: '16px', color: '#059669' }} />
                                    <span>General</span>
                                </div>
                            </Select.Option>
                            <Select.Option value="important">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiStar style={{ fontSize: '16px', color: '#D97706' }} />
                                    <span>Important</span>
                                </div>
                            </Select.Option>
                            <Select.Option value="urgent">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiAlertCircle style={{ fontSize: '16px', color: '#DC2626' }} />
                                    <span>Urgent</span>
                                </div>
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={
                            <span
                                style={{
                                    fontSize: "14px",
                                    fontWeight: "500",
                                }}
                            >
                                Description
                            </span>
                        }
                        rules={[{ required: true, message: "Please enter description" }]}
                    >
                        <TextArea
                            placeholder="Enter description"
                            rows={4}
                            style={{
                                borderRadius: "10px",
                                padding: "8px 16px",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e6e8eb",
                                transition: "all 0.3s ease",
                            }}
                        />
                    </Form.Item>

                    <Divider style={{ margin: "24px 0" }} />

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                        }}
                    >
                        <Button
                            size="large"
                            onClick={() => {
                                setIsModalVisible(false);
                                form.resetFields();
                            }}
                            style={{
                                padding: "8px 24px",
                                height: "44px",
                                borderRadius: "10px",
                                border: "1px solid #e6e8eb",
                                fontWeight: "500",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            htmlType="submit"
                            style={{
                                padding: "8px 32px",
                                height: "44px",
                                borderRadius: "10px",
                                fontWeight: "500",
                                background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                                border: "none",
                                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {editingNote ? "Update Note" : "Create Note"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <NoteDetailModal
                visible={isDetailVisible}
                note={selectedNote}
                onClose={() => {
                    setIsDetailVisible(false);
                    setSelectedNote(null);
                }}
                formatDate={formatDate}
            />
        </div>
    );
};

export default DealNotes; 