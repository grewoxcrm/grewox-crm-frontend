import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Layout, List, Input, Button, Avatar, Badge, Typography, Tabs, Modal, Form, Select, Checkbox, message, Divider, Tag, Upload, Dropdown } from 'antd';
import {
    SendOutlined,
    SearchOutlined,
    EllipsisOutlined,
    TeamOutlined,
    MessageOutlined,
    SettingOutlined,
    PaperClipOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FileImageOutlined,
    FileZipOutlined,
    FileTextOutlined,
    DownloadOutlined,
    DeleteOutlined,
    CheckOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import { useGetRolesQuery } from '../../hrm/role/services/roleApi';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import "./chat.scss";
import { FiX, FiUsers, FiUserPlus } from 'react-icons/fi';

const { Content, Sider } = Layout;
const { Text } = Typography;
const { TabPane } = Tabs;

// Add formatFileSize utility function
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <FileImageOutlined />;
    if (fileType === 'application/pdf') return <FilePdfOutlined />;
    if (fileType.includes('word') || fileType.includes('msword')) return <FileWordOutlined />;
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return <FileExcelOutlined />;
    if (fileType.includes('zip') || fileType.includes('compressed')) return <FileZipOutlined />;
    if (fileType.includes('text')) return <FileTextOutlined />;
    return <FileOutlined />;
};

const getFileTypeLabel = (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType.includes('word') || fileType.includes('msword')) return 'Word';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'Excel';
    if (fileType.includes('zip') || fileType.includes('compressed')) return 'ZIP';
    if (fileType.includes('text')) return 'Text';
    return 'File';
};

export default function Chat() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [conversations, setConversations] = useState({});
    const [typingUsers, setTypingUsers] = useState(new Map());
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupForm] = Form.useForm();
    const [groupInfoVisible, setGroupInfoVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    // Get real users data
    const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery();
    // Get roles data
    const { data: rolesData, isLoading: isLoadingRoles } = useGetRolesQuery();
    // Create a map of role IDs to role names
    const roleMap = useMemo(() => {
        if (!rolesData?.data) return {};
        return rolesData.data.reduce((acc, role) => {
            acc[role.id] = role.role_name;
            return acc;
        }, {});
    }, [rolesData]);

    // Get current user from auth state
    const currentUser = useSelector((state) => state.auth.user);

    // Define getMessages function before using it
    const getMessages = () => {
        if (!selectedUser || !conversations[selectedUser.id]) return [];

        if (selectedUser.type === 'group') {
            return conversations[selectedUser.id]?.messages || [];
        }

        return Array.isArray(conversations[selectedUser.id])
            ? conversations[selectedUser.id]
            : [];
    };

    // Add scrollToBottom function
    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    };

    // Add useEffect for auto-scrolling
    useEffect(() => {
        scrollToBottom();
    }, [conversations, selectedUser]); // Update dependency array to watch for conversation changes

    // Initialize socket connection
    useEffect(() => {
        if (!currentUser?.id) return;

        // Extract base URL from API URL
        const baseUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.split('/api/')[0]
            : 'http://localhost:5000';

        console.log('Connecting to socket server:', baseUrl);

        socketRef.current = io(baseUrl, {
            withCredentials: true,
            path: '/socket.io'
        });

        // Connect and send user ID
        socketRef.current.emit('user_connected', currentUser.id);
        console.log('Emitted user_connected with ID:', currentUser.id);

        // Listen for online users updates
        socketRef.current.on('users_status', ({ activeUsers, userStatus }) => {
            console.log('Received users_status update:', { activeUsers, userStatus });
            setOnlineUsers(new Set(activeUsers));
        });

        // Get existing conversations
        socketRef.current.emit('get_conversations', { userId: currentUser.id });

        // Listen for conversations
        socketRef.current.on('conversations_received', (conversationsData) => {
            // Ensure proper data structure for both direct and group chats
            const formattedConversations = {};
            Object.entries(conversationsData || {}).forEach(([key, value]) => {
                if (key.startsWith('group_')) {
                    // Group chat structure
                    formattedConversations[key] = {
                        ...value,
                        messages: value.messages || [],
                        unread_count: value.unread_count || {}
                    };
                } else {
                    // Direct chat structure - ensure it's an array
                    formattedConversations[key] = Array.isArray(value) ? value : [];
                }
            });
            setConversations(formattedConversations);
        });

        // Listen for new messages with deduplication
        socketRef.current.on('receive_message', ({ user_id, message }) => {
            setConversations(prev => {
                const newConversations = { ...prev };
                // Ensure the conversation array exists
                if (!newConversations[user_id]) {
                    newConversations[user_id] = [];
                }
                // Ensure we're working with an array for direct messages
                if (!Array.isArray(newConversations[user_id])) {
                    newConversations[user_id] = [];
                }

                // Check for duplicate message by ID
                const isDuplicate = newConversations[user_id].some(
                    existingMsg => existingMsg.id === message.id
                );

                if (!isDuplicate) {
                    const messageStatus = selectedUser?.id === user_id ? 'read' : 'delivered';
                    newConversations[user_id] = [...newConversations[user_id], {
                        ...message,
                        status: messageStatus
                    }];
                }

                return newConversations;
            });

            if (selectedUser?.id === user_id) {
                socketRef.current.emit('mark_messages_read', {
                    sender_id: user_id,
                    receiver_id: currentUser?.id
                });
            }
        });

        // Listen for group messages with deduplication
        socketRef.current.on('receive_group_message', ({ group_id, message, group }) => {
            console.log('Received group message:', { group_id, message, group });

            setConversations(prev => {
                const newConversations = { ...prev };

                // Initialize group if it doesn't exist
                if (!newConversations[group_id]) {
                    newConversations[group_id] = {
                        ...group,
                        messages: [],
                        unread_count: {}
                    };
                }

                // Ensure messages array exists
                if (!Array.isArray(newConversations[group_id].messages)) {
                    newConversations[group_id].messages = [];
                }

                // Check for duplicate message
                const isDuplicate = newConversations[group_id].messages.some(
                    existingMsg =>
                        existingMsg.timestamp === message.timestamp &&
                        existingMsg.sender_id === message.sender_id &&
                        existingMsg.message === message.message
                );

                if (!isDuplicate) {
                    // Add new message with proper structure
                    newConversations[group_id] = {
                        ...newConversations[group_id],
                        messages: [
                            ...newConversations[group_id].messages,
                            {
                                ...message,
                                status: selectedUser?.id === group_id ? 'read' : 'delivered'
                            }
                        ],
                        last_message: message.message,
                        unread_count: {
                            ...newConversations[group_id].unread_count,
                            [currentUser?.id]: selectedUser?.id === group_id
                                ? 0
                                : ((newConversations[group_id].unread_count[currentUser?.id] || 0) + 1)
                        }
                    };
                }

                return newConversations;
            });

            // If the group chat is currently open, mark messages as read
            if (selectedUser?.id === group_id) {
                socketRef.current.emit('mark_group_messages_read', {
                    group_id,
                    user_id: currentUser?.id
                });
            }
        });

        // Listen for message status updates
        socketRef.current.on('message_status_updated', ({ message_id, status }) => {
            setConversations(prev => {
                const newConversations = { ...prev };

                // Update status in all conversations
                Object.keys(newConversations).forEach(key => {
                    if (Array.isArray(newConversations[key])) {
                        newConversations[key] = newConversations[key].map(msg =>
                            msg.id === message_id ? { ...msg, status } : msg
                        );
                    } else if (newConversations[key]?.messages) {
                        // For group messages
                        newConversations[key].messages = newConversations[key].messages.map(msg =>
                            msg.id === message_id ? { ...msg, status } : msg
                        );
                    }
                });

                return newConversations;
            });
        });

        // Add typing status listener with debug logs
        socketRef.current.on('user_typing', ({ userId, isTyping }) => {
            console.log('Received typing status:', { userId, isTyping });
            setTypingUsers(prev => {
                const newTypingUsers = new Map(prev);
                if (isTyping) {
                    newTypingUsers.set(userId, true);
                } else {
                    newTypingUsers.delete(userId);
                }
                return newTypingUsers;
            });
        });

        // Add these new socket event listeners
        socketRef.current.on('message_deleted', ({ message_id, conversation_id }) => {
            if (!message_id || !conversation_id) return;

            setConversations(prev => {
                const newConversations = { ...prev };
                const conversation = newConversations[conversation_id];

                if (Array.isArray(conversation)) {
                    newConversations[conversation_id] = conversation.filter(
                        msg => msg.id !== message_id
                    );
                } else if (conversation?.messages) {
                    conversation.messages = conversation.messages.filter(
                        msg => msg.id !== message_id
                    );
                }

                return newConversations;
            });
        });

        socketRef.current.on('message_edited', ({ message_id, new_message, conversation_id }) => {
            if (!message_id || !conversation_id || !new_message) return;

            setConversations(prev => {
                const newConversations = { ...prev };
                const conversation = newConversations[conversation_id];

                if (Array.isArray(conversation)) {
                    newConversations[conversation_id] = conversation.map(msg =>
                        msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                    );
                } else if (conversation?.messages) {
                    conversation.messages = conversation.messages.map(msg =>
                        msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                    );
                }

                return newConversations;
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            socketRef.current?.off('conversations_received');
            socketRef.current?.off('receive_message');
            socketRef.current?.off('receive_group_message');
            socketRef.current?.off('message_deleted');
            socketRef.current?.off('message_edited');
        };
    }, [selectedUser?.id, currentUser?.id]);

    // Mark messages as read when selecting a user
    useEffect(() => {
        if (selectedUser?.id && socketRef.current) {
            if (selectedUser.type === 'group') {
                socketRef.current.emit('mark_group_messages_read', {
                    group_id: selectedUser.id,
                    user_id: currentUser?.id
                });

                setConversations(prev => {
                    const newConversations = { ...prev };
                    if (newConversations[selectedUser.id]) {
                        newConversations[selectedUser.id] = {
                            ...newConversations[selectedUser.id],
                            unread_count: {
                                ...newConversations[selectedUser.id].unread_count,
                                [currentUser?.id]: 0
                            }
                        };
                    }
                    return newConversations;
                });
            } else {
                socketRef.current.emit('mark_messages_read', {
                    sender_id: selectedUser.id,
                    receiver_id: currentUser?.id
                });

                setConversations(prev => {
                    const newConversations = { ...prev };
                    if (Array.isArray(newConversations[selectedUser.id])) {
                        newConversations[selectedUser.id] = newConversations[selectedUser.id].map(msg => ({
                            ...msg,
                            status: msg.sender_id === selectedUser.id ? 'read' : msg.status
                        }));
                    }
                    return newConversations;
                });
            }
        }
    }, [selectedUser?.id, currentUser?.id]);

    // Add typing handler with debug logs
    const handleTyping = () => {
        if (socketRef.current && selectedUser) {
            console.log('Emitting typing event:', {
                sender_id: currentUser?.id,
                receiver_id: selectedUser.id,
                isTyping: true
            });

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Emit typing start
            socketRef.current.emit('typing', {
                sender_id: currentUser?.id,
                receiver_id: selectedUser.id,
                isTyping: true
            });

            // Set timeout to stop typing
            typingTimeoutRef.current = setTimeout(() => {
                console.log('Emitting typing stop event');
                socketRef.current.emit('typing', {
                    sender_id: currentUser?.id,
                    receiver_id: selectedUser.id,
                    isTyping: false
                });
            }, 2000); // Stop typing after 2 seconds of inactivity
        }
    };

    const handleUpdateMessage = () => {
        if (!socketRef.current || !editingMessage?.id || !messageInput.trim() || !selectedUser?.id) return;

        const data = {
            message_id: editingMessage.id,
            new_message: messageInput.trim(),
            conversation_id: selectedUser.id,
            sender_id: currentUser?.id,
            is_group: selectedUser.type === 'group'
        };

        socketRef.current.emit('edit_message', data);

        // Update local state immediately for better UX
        setConversations(prev => {
            const newConversations = { ...prev };
            const targetConversation = selectedUser.id;

            if (selectedUser.type === 'group') {
                if (newConversations[targetConversation]?.messages) {
                    newConversations[targetConversation].messages = newConversations[targetConversation].messages.map(msg =>
                        msg.id === editingMessage.id ? { ...msg, message: messageInput.trim(), edited: true } : msg
                    );
                }
            } else {
                if (Array.isArray(newConversations[targetConversation])) {
                    newConversations[targetConversation] = newConversations[targetConversation].map(msg =>
                        msg.id === editingMessage.id ? { ...msg, message: messageInput.trim(), edited: true } : msg
                    );
                }
            }
            return newConversations;
        });

        setEditingMessage(null);
        setMessageInput('');
    };

    const handleMessageDelete = (message) => {
        if (!socketRef.current || !message?.id || !selectedUser?.id) return;

        const data = {
            message_id: message.id,
            conversation_id: selectedUser.id,
            sender_id: currentUser?.id,
            is_group: selectedUser.type === 'group'
        };

        socketRef.current.emit('delete_message', data);

        // Update local state immediately for better UX
        setConversations(prev => {
            const newConversations = { ...prev };
            const targetConversation = selectedUser.id;

            if (selectedUser.type === 'group') {
                if (newConversations[targetConversation]?.messages) {
                    newConversations[targetConversation].messages = newConversations[targetConversation].messages.filter(
                        msg => msg.id !== message.id
                    );
                }
            } else {
                if (Array.isArray(newConversations[targetConversation])) {
                    newConversations[targetConversation] = newConversations[targetConversation].filter(
                        msg => msg.id !== message.id
                    );
                }
            }
            return newConversations;
        });

        // If we're deleting a message we're currently editing, clear the edit state
        if (editingMessage?.id === message.id) {
            setEditingMessage(null);
            setMessageInput('');
        }
    };

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedUser || !socketRef.current) return;

        // If in edit mode, handle message update instead
        if (editingMessage) {
            handleUpdateMessage();
            return;
        }

        const messageId = `${Date.now()}-${currentUser?.id}`;
        const messageData = {
            id: messageId,
            sender_id: currentUser?.id,
            message: messageInput.trim(),
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        if (selectedUser.type === 'group') {
            socketRef.current.emit('send_group_message', {
                ...messageData,
                group_id: selectedUser.id
            });
        } else {
            socketRef.current.emit('send_message', {
                ...messageData,
                receiver_id: selectedUser.id
            });

            // Add message to conversation immediately with 'sent' status
            setConversations(prev => {
                const newConversations = { ...prev };
                if (!newConversations[selectedUser.id]) {
                    newConversations[selectedUser.id] = [];
                }

                // Check if message already exists
                const isDuplicate = newConversations[selectedUser.id].some(
                    msg => msg.id === messageId
                );

                if (!isDuplicate) {
                    newConversations[selectedUser.id] = [
                        ...newConversations[selectedUser.id],
                        messageData
                    ];
                }
                return newConversations;
            });
        }

        // Clear input and edit state
        setMessageInput('');
        setEditingMessage(null);
    };

    // Update the message input handler
    const handleMessageInputChange = (e) => {
        setMessageInput(e.target.value);
        if (socketRef.current && selectedUser) {
            handleTyping();
        }
    };

    const handleMessageEdit = (message) => {
        if (!message) return;
        setEditingMessage(message);
        setMessageInput(message.message);
    };

    // Add socket event listeners for edit and delete responses
    useEffect(() => {
        if (!socketRef.current) return;

        const handleMessageEdited = ({ message_id, new_message, conversation_id }) => {
            setConversations(prev => {
                const newConversations = { ...prev };
                const targetConversation = conversation_id === currentUser?.id ? selectedUser?.id : conversation_id;

                if (selectedUser?.type === 'group') {
                    if (newConversations[targetConversation]?.messages) {
                        newConversations[targetConversation].messages = newConversations[targetConversation].messages.map(msg =>
                            msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                        );
                    }
                } else {
                    if (Array.isArray(newConversations[targetConversation])) {
                        newConversations[targetConversation] = newConversations[targetConversation].map(msg =>
                            msg.id === message_id ? { ...msg, message: new_message, edited: true } : msg
                        );
                    }
                }
                return newConversations;
            });
        };

        const handleMessageDeleted = ({ message_id, conversation_id }) => {
            setConversations(prev => {
                const newConversations = { ...prev };
                const targetConversation = conversation_id === currentUser?.id ? selectedUser?.id : conversation_id;

                if (selectedUser?.type === 'group') {
                    if (newConversations[targetConversation]?.messages) {
                        newConversations[targetConversation].messages = newConversations[targetConversation].messages.filter(
                            msg => msg.id !== message_id
                        );
                    }
                } else {
                    if (Array.isArray(newConversations[targetConversation])) {
                        newConversations[targetConversation] = newConversations[targetConversation].filter(
                            msg => msg.id !== message_id
                        );
                    }
                }
                return newConversations;
            });
        };

        socketRef.current.on('message_edited', handleMessageEdited);
        socketRef.current.on('message_deleted', handleMessageDeleted);
        socketRef.current.on('edit_error', ({ message: errorMessage }) => {
            message.error('Failed to edit message: ' + errorMessage);
            setEditingMessage(null);
            setMessageInput('');
        });
        socketRef.current.on('delete_error', ({ message: errorMessage }) => {
            message.error('Failed to delete message: ' + errorMessage);
        });
        socketRef.current.on('send_error', ({ message: errorMessage }) => {
            message.error('Failed to send message: ' + errorMessage);
        });

        return () => {
            socketRef.current?.off('message_edited', handleMessageEdited);
            socketRef.current?.off('message_deleted');
            socketRef.current?.off('edit_error');
            socketRef.current?.off('delete_error');
            socketRef.current?.off('send_error');
        };
    }, [currentUser?.id, selectedUser]);

    const getFilteredUsers = () => {
        if (!userData?.data) return [];

        // Get direct chat users
        const filteredUsers1 = userData?.data.filter(user => {
            if (user?.client_id === currentUser?.id) {
                return true;
            }
            return false;
        });

        const filteredUsers2 = userData?.data.filter(user => {
            if (user?.client_id === currentUser?.client_id || user?.id == currentUser?.client_id) {
                return true;
            }
            return false;
        });

        // Check if either array is empty before merging
        let filtered;
        if (filteredUsers1.length === 0 || filteredUsers2.length === 0) {
            filtered = filteredUsers1.length > 0 ? filteredUsers1 : filteredUsers2;
        } else {
            filtered = filteredUsers1;
        }

        // Remove current user from filtered list
        filtered = filtered.filter(user => user.id !== currentUser?.id);

        // Convert users to chat items
        let chatItems = filtered.map(user => {
            const roleName = roleMap[user.role_id] || 'Company';
            const userConversation = conversations[user.id] || [];
            const lastMessage = userConversation[userConversation.length - 1];
            const unreadCount = userConversation.filter(msg =>
                msg.sender_id === user.id &&
                msg.status !== 'read'
            ).length;

            return {
                id: user.id,
                name: user.username,
                status: onlineUsers.has(user.id.toString()) ? 'online' : 'offline',
                avatar: user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=1890ff&color=fff`,
                lastMessage: lastMessage ? lastMessage.message : 'Click to start chat',
                time: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unread: unreadCount,
                isStarred: false,
                role: roleName,
                email: user.email,
                type: 'direct'
            };
        });

        // Add group chats
        const groups = Object.entries(conversations)
            .filter(([id, conv]) => id.startsWith('group_'))
            .map(([id, group]) => {
                const lastMessage = group.messages?.[group.messages.length - 1];
                const unreadCount = group.unread_count?.[currentUser?.id] || 0;

                return {
                    id: group.id,
                    name: group.name,
                    status: 'group',
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(group.name)}&background=1890ff&color=fff`,
                    lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
                    time: lastMessage ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    unread: unreadCount,
                    isStarred: false,
                    role: 'Group',
                    members: group.members,
                    type: 'group'
                };
            });

        chatItems = [...chatItems, ...groups];

        // Apply search filter
        if (searchQuery) {
            chatItems = chatItems.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.role && item.role.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply tab filter
        switch (activeTab) {
            case 'starred':
                chatItems = chatItems.filter(item => item.isStarred);
                break;
            case 'online':
                chatItems = chatItems.filter(item => item.status === 'online');
                break;
            default:
                break;
        }

        // Sort items: groups first, then by unread messages, then by last message time
        return chatItems.sort((a, b) => {
            // Groups first
            if (a.type === 'group' && b.type !== 'group') return -1;
            if (a.type !== 'group' && b.type === 'group') return 1;

            // Then by unread messages
            if (a.unread > b.unread) return -1;
            if (a.unread < b.unread) return 1;

            // Then by last message time (if exists)
            if (a.time && b.time) {
                return new Date(b.time) - new Date(a.time);
            }

            // Finally by name
            return a.name.localeCompare(b.name);
        });
    };

    const getRoleColor = (role) => {
        const roleColors = {
            'company': {
                color: '#08979C',
                bg: '#E6FFFB',
                border: '#87E8DE'
            },
            'sub-client': {
                color: '#389E0D',
                bg: '#F6FFED',
                border: '#B7EB8F'
            },
            'employee': {
                color: '#D46B08',
                bg: '#FFF7E6',
                border: '#FFD591'
            },
            'default': {
                color: '#595959',
                bg: '#FAFAFA',
                border: '#D9D9D9'
            }
        };
        return roleColors[role?.toLowerCase()] || roleColors.default;
    };

    const getAvatarContent = (item) => {
        const isCompany = item.role?.toLowerCase() === 'company';
        const isSubClient = item.role?.toLowerCase() === 'sub-client';
        const isEmployee = item.role?.toLowerCase() === 'employee';

        if (isCompany) {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                </svg>
            );
        } else if (isSubClient) {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
            );
        } else if (isEmployee) {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
            );
        }

        return item.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
    };

    const getAvatarStyle = (item) => {
        const isCompany = item.role?.toLowerCase() === 'company';
        const isSubClient = item.role?.toLowerCase() === 'sub-client';
        const isEmployee = item.role?.toLowerCase() === 'employee';

        const baseStyle = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
        };

        if (isCompany) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            };
        } else if (isSubClient) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #059669, #047857)',
                boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            };
        } else if (isEmployee) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            };
        }

        // For other roles, use modern gradients
        const colors = [
            'linear-gradient(135deg, #f43f5e, #be123c)', // Rose
            'linear-gradient(135deg, #f97316, #c2410c)', // Orange
            'linear-gradient(135deg, #06b6d4, #0e7490)', // Cyan
            'linear-gradient(135deg, #ec4899, #be185d)', // Pink
            'linear-gradient(135deg, #8b5cf6, #6d28d9)', // Purple
            'linear-gradient(135deg, #3b82f6, #1d4ed8)', // Blue
        ];

        const colorIndex = item.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

        return {
            ...baseStyle,
            background: colors[colorIndex],
            boxShadow: 'inset 0 2px 6px rgba(255, 255, 255, 0.2)',
        };
    };

    const renderAvatar = (item) => {
        if (item.type === 'group') {
            return (
                <Avatar
                    size={48}
                    style={{
                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <FiUsers style={{ fontSize: '24px', color: '#ffffff' }} />
                </Avatar>
            );
        }

        if (item.avatar && !item.avatar.includes('ui-avatars.com')) {
            return (
                <Avatar
                    size={48}
                    src={item.avatar}
                    style={{
                        objectFit: 'cover'
                    }}
                />
            );
        }

        return (
            <Avatar
                size={48}
                style={getAvatarStyle(item)}
            >
                {getAvatarContent(item)}
            </Avatar>
        );
    };

    const renderMessageStatus = (message) => {
        if (!message.status) return null;

        const getTickClass = (status) => {
            switch (status) {
                case 'sent':
                    return 'single';
                case 'delivered':
                    return 'double';
                case 'read':
                    return 'seen';
                default:
                    return 'single';
            }
        };

        const tickClass = getTickClass(message.status);

        return (
            <div className="message-status">
                <div className="tick-wrapper">
                    {message.status === 'sent' ? (
                        <CheckOutlined className={`tick-icon ${tickClass}`} />
                    ) : (
                        <>
                            <CheckOutlined className={`tick-icon ${tickClass}`} />
                            <CheckOutlined className={`tick-icon ${tickClass}`} />
                        </>
                    )}
                </div>
            </div>
        );
    };

    const renderMessage = (message) => {
        const isCurrentUser = message.sender_id === currentUser?.id;
        const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const menuItems = [
            {
                key: 'edit',
                label: 'Edit Message',
                icon: <EditOutlined />,
                onClick: () => handleMessageEdit(message)
            },
            {
                key: 'delete',
                label: 'Delete Message',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleMessageDelete(message)
            }
        ];

        return (
            <Dropdown
                menu={{ items: isCurrentUser ? menuItems : [] }}
                trigger={['contextMenu']}
                disabled={!isCurrentUser}
            >
                <div
                    className={`message ${isCurrentUser ? 'sent' : 'received'}`}
                    key={message.id || message.timestamp}
                >
                    <div className="message-content">
                        {message.attachments ? (
                            <>
                                {message.attachments.map((file, index) => (
                                    <div
                                        key={index}
                                        className={`file-attachment ${file.type.startsWith('image/') ? 'image-attachment' : ''}`}
                                    >
                                        {file.type.startsWith('image/') ? (
                                            <div className="image-preview">
                                                <img src={file.url} alt="attachment" onClick={() => window.open(file.url, '_blank')} />
                                            </div>
                                        ) : (
                                            <div className="file-info">
                                                <div className="file-icon-wrapper">
                                                    <FileOutlined />
                                                    <span className="file-type">{file.type.split('/')[1]}</span>
                                                </div>
                                                <div className="file-details">
                                                    <span className="file-name">{file.name}</span>
                                                    <span className="file-size">{formatFileSize(file.size)}</span>
                                                </div>
                                                <div className="download-icon" onClick={() => window.open(file.url, '_blank')}>
                                                    <DownloadOutlined />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {message.message && (
                                    <Typography.Text>{message.message}</Typography.Text>
                                )}
                            </>
                        ) : (
                            <Typography.Text>{message.message}</Typography.Text>
                        )}
                        <div className="message-footer">
                            <span className="message-time">
                                {messageTime}
                                {message.edited && <span className="edited-indicator">(edited)</span>}
                            </span>
                            {isCurrentUser && renderMessageStatus(message)}
                        </div>
                    </div>
                </div>
            </Dropdown>
        );
    };

    const renderChatItem = (item) => {
        const roleStyle = getRoleColor(item.role);
        const isTyping = typingUsers.has(item.id);
        const isChatOpen = selectedUser?.id === item.id;
        const showUnreadBadge = !isChatOpen && item.unread > 0;

        const getMessagePreview = () => {
            if (isTyping) {
                return <span className="typing-indicator-sidebar">typing...</span>;
            }

            if (showUnreadBadge && item.unread > 1) {
                return (
                    <span className="new-messages-indicator">
                        {item.unread}+ new messages
                    </span>
                );
            }

            return item.lastMessage;
        };

        return (
            <List.Item
                onClick={() => setSelectedUser(item)}
                className={`chat-list-item ${isChatOpen ? 'selected' : ''}`}
                data-role={item.role?.toLowerCase()}
            >
                <List.Item.Meta
                    avatar={
                        <Badge dot={item.status === 'online'} offset={[-2, 40]} color="#52c41a">
                            <div className={`custom-avatar ${item.role?.toLowerCase()}`}>
                                {renderAvatar(item)}
                            </div>
                        </Badge>
                    }
                    title={
                        <div className="chat-item-title">
                            <Text strong>{item.name}</Text>
                            {item.role?.toLowerCase() === 'company' && (
                                <span className="verified-badge" />
                            )}
                            <span className="role-badge" data-role={item.role?.toLowerCase() || 'default'}>
                                {item.role}
                            </span>
                        </div>
                    }
                    description={
                        <div className="chat-item-description">
                            <Text
                                type="secondary"
                                className={`last-message ${isTyping ? 'typing' : ''} ${showUnreadBadge && item.unread > 1 ? 'new-messages' : ''}`}
                            >
                                {getMessagePreview()}
                            </Text>
                        </div>
                    }
                />
                {showUnreadBadge && (
                    <Badge
                        count={item.unread}
                        style={{
                            backgroundColor: '#1890ff'
                        }}
                        className="unread-badge"
                    />
                )}
            </List.Item>
        );
    };

    const handleCreateGroup = async (values) => {
        if (!socketRef.current) return;

        const members = [...selectedMembers, currentUser?.id];

        socketRef.current.emit('create_group', {
            name: values.group_name,
            members: members,
            creator_id: currentUser?.id
        });

        setCreateGroupModalVisible(false);
        groupForm.resetFields();
        setSelectedMembers([]);
        message.success('Group created successfully');
    };

    const CreateGroupModal = () => (
        <Modal
            title={null}
            open={createGroupModalVisible}
            onCancel={() => setCreateGroupModalVisible(false)}
            footer={null}
            width={520}
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
                    onClick={() => setCreateGroupModalVisible(false)}
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
                        <FiUsers style={{ fontSize: '24px', color: '#ffffff' }} />
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
                            Create New Group
                        </h2>
                        <Text
                            style={{
                                fontSize: '14px',
                                color: 'rgba(255, 255, 255, 0.85)',
                            }}
                        >
                            Create a group chat with your team members
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={groupForm}
                layout="vertical"
                onFinish={handleCreateGroup}
                requiredMark={false}
                style={{
                    padding: '24px',
                }}
            >
                <Form.Item
                    name="group_name"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Group Name
                        </span>
                    }
                    rules={[
                        { required: true, message: 'Please enter group name' },
                        { max: 50, message: 'Group name cannot exceed 50 characters' }
                    ]}
                >
                    <Input
                        prefix={<FiUsers style={{ color: '#1890ff', fontSize: '16px' }} />}
                        placeholder="Enter group name"
                        size="large"
                        style={{
                            borderRadius: '10px',
                            padding: '8px 16px',
                            height: '48px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="members"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Select Members
                        </span>
                    }
                    rules={[{ required: true, message: 'Please select at least one member' }]}
                >
                    <Select
                        mode="multiple"
                        placeholder="Select members"
                        onChange={setSelectedMembers}
                        style={{ width: '100%' }}
                        size="large"
                        optionFilterProp="children"
                    >
                        {getFilteredUsers().map(user => (
                            <Select.Option key={user.id} value={user.id}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Avatar size={24} src={user.avatar}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                    <span>{user.name}</span>
                                </div>
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>

                <Divider style={{ margin: '24px 0' }} />

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                    }}
                >
                    <Button
                        size="large"
                        onClick={() => setCreateGroupModalVisible(false)}
                        style={{
                            padding: '8px 24px',
                            height: '44px',
                            borderRadius: '10px',
                            border: '1px solid #e6e8eb',
                            fontWeight: '500',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="large"
                        type="primary"
                        htmlType="submit"
                        style={{
                            padding: '8px 32px',
                            height: '44px',
                            borderRadius: '10px',
                            fontWeight: '500',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                        }}
                    >
                        Create Group
                    </Button>
                </div>
            </Form>
        </Modal>
    );

    const GroupInfoModal = () => {
        const [editMode, setEditMode] = useState(false);
        const [editForm] = Form.useForm();

        // Return null if no user is selected or if modal is not visible
        if (!selectedUser || !groupInfoVisible) {
            return null;
        }

        const groupMembers = selectedUser?.members || [];
        const memberDetails = groupMembers.map(memberId =>
            userData?.data?.find(u => u.id === memberId)
        ).filter(Boolean);

        const handleUpdateGroup = (values) => {
            if (!socketRef.current || !selectedUser) return;

            socketRef.current.emit('update_group', {
                group_id: selectedUser.id,
                name: values.group_name,
                members: values.members,
                updater_id: currentUser?.id
            });

            setEditMode(false);
            message.success('Group updated successfully');
        };

        return (
            <Modal
                title={null}
                open={groupInfoVisible}
                onCancel={() => {
                    setGroupInfoVisible(false);
                    setEditMode(false);
                }}
                footer={null}
                width={520}
                destroyOnClose={true}
                centered
                closeIcon={null}
                className="pro-modal custom-modal"
                style={{
                    '--antd-arrow-background-color': '#ffffff',
                }}
            >
                <div className="modal-header" style={{
                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                    padding: '24px',
                    color: '#ffffff',
                    position: 'relative',
                }}>
                    <Button
                        type="text"
                        onClick={() => {
                            setGroupInfoVisible(false);
                            setEditMode(false);
                        }}
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
                        }}
                    >
                        <FiX style={{ fontSize: '20px' }} />
                    </Button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <FiUsers style={{ fontSize: '24px', color: '#ffffff' }} />
                        </div>
                        <div>
                            <h2 style={{ margin: '0', fontSize: '24px', fontWeight: '600', color: '#ffffff' }}>
                                Group Information
                            </h2>
                            <Text style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.85)' }}>
                                {memberDetails.length} members
                            </Text>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '24px' }}>
                    {editMode ? (
                        <Form
                            form={editForm}
                            layout="vertical"
                            onFinish={handleUpdateGroup}
                            initialValues={{
                                group_name: selectedUser?.name || '',
                                members: groupMembers
                            }}
                        >
                            <Form.Item
                                name="group_name"
                                label="Group Name"
                                rules={[{ required: true, message: 'Please enter group name' }]}
                            >
                                <Input prefix={<FiUsers />} />
                            </Form.Item>
                            <Form.Item
                                name="members"
                                label="Members"
                                rules={[{ required: true, message: 'Please select members' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select members"
                                    style={{ width: '100%' }}
                                    optionFilterProp="children"
                                >
                                    {getFilteredUsers().map(user => (
                                        <Select.Option key={user.id} value={user.id}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Avatar size={24} src={user.avatar}>
                                                    {user.name?.charAt(0)}
                                                </Avatar>
                                                <span>{user.name}</span>
                                            </div>
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                                <Button onClick={() => setEditMode(false)}>Cancel</Button>
                                <Button type="primary" htmlType="submit">Save Changes</Button>
                            </div>
                        </Form>
                    ) : (
                        <>
                            <div style={{ marginBottom: '24px' }}>
                                <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                                    Group Name
                                </Text>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text>{selectedUser?.name}</Text>
                                    <Button
                                        type="link"
                                        onClick={() => setEditMode(true)}
                                        icon={<SettingOutlined />}
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </div>
                            <Divider />
                            <div>
                                <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
                                    Members ({memberDetails.length})
                                </Text>
                                <List
                                    dataSource={memberDetails}
                                    renderItem={member => (
                                        <List.Item>
                                            <List.Item.Meta
                                                avatar={
                                                    <Avatar src={member?.profilePic}>
                                                        {member?.username?.charAt(0)}
                                                    </Avatar>
                                                }
                                                title={member?.username}
                                                description={roleMap[member?.role_id]}
                                            />
                                            {member?.id === selectedUser?.creator_id && (
                                                <Tag color="blue">Admin</Tag>
                                            )}
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        );
    };

    // Add file handling functions
    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.map(file => ({
            file,
            name: file.name,
            type: file.type,
            size: file.size,
            data: null
        }));

        // Read files as base64
        validFiles.forEach(fileObj => {
            const reader = new FileReader();
            reader.onload = (e) => {
                fileObj.data = e.target.result;
                setSelectedFiles(prev => [...prev, fileObj]);
            };
            reader.readAsDataURL(fileObj.file);
        });
    };

    const handleFileSend = async () => {
        if (!selectedFiles.length || !selectedUser || !socketRef.current) return;

        setUploading(true);
        try {
            socketRef.current.emit('upload_chat_files', {
                files: selectedFiles,
                sender_id: currentUser?.id,
                receiver_id: selectedUser.id,
                message: messageInput.trim()
            });

            setSelectedFiles([]);
            setMessageInput('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            message.error('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleFileDelete = (fileIndex) => {
        setSelectedFiles(prev => prev.filter((_, index) => index !== fileIndex));
    };

    // Update chat input section
    const renderChatInput = () => (
        <div className="chat-input">
            {editingMessage && (
                <div className="edit-mode-indicator">
                    <EditOutlined /> Editing message
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            setEditingMessage(null);
                            setMessageInput('');
                        }}
                    >
                        Cancel
                    </Button>
                </div>
            )}
            {selectedFiles.length > 0 && (
                <div className="selected-files">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="selected-file">
                            {file.type.startsWith('image/') ? (
                                <div className="image-preview">
                                    <img src={file.data} alt={file.name} />
                                </div>
                            ) : (
                                <FileOutlined className="file-icon" />
                            )}
                            <span className="file-name">{file.name}</span>
                            <Button
                                type="text"
                                icon={<DeleteOutlined />}
                                onClick={() => handleFileDelete(index)}
                            />
                        </div>
                    ))}
                </div>
            )}
            <div className="input-wrapper">
                <label className="upload-button">
                    <input
                        type="file"
                        onChange={handleFileSelect}
                        multiple
                        ref={fileInputRef}
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                    />
                    <PaperClipOutlined />
                </label>
                <Input.TextArea
                    value={messageInput}
                    onChange={handleMessageInputChange}
                    placeholder="Type a message..."
                    autoSize={{ minRows: 1, maxRows: 4 }}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            e.preventDefault();
                            if (selectedFiles.length > 0) {
                                handleFileSend();
                            } else {
                                handleSendMessage();
                            }
                        }
                    }}
                    className="message-input"
                />
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={selectedFiles.length > 0 ? handleFileSend : handleSendMessage}
                    className="send-button"
                    loading={uploading}
                />
            </div>
            <Text type="secondary" className="input-hint">
                Press Enter to send, Shift + Enter for new line
            </Text>
        </div>
    );

    return (
        <Layout className="chat-container">
            <Sider width={380} className="chat-sider">
                <div className="chat-sider-header">
                    <div className="user-profile">
                        <Avatar src={currentUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.username || 'User')}&background=1890ff&color=fff`} size={40}>
                            {!currentUser?.profilePic && currentUser?.username?.charAt(0)}
                        </Avatar>
                        <div className="user-info">
                            <div className="user-name-wrapper">
                                <Typography.Text className="user-name">{currentUser?.username}</Typography.Text>
                                <span className="me-badge">Me</span>
                            </div>
                            <Typography.Text type="secondary" className="user-role">
                                {roleMap[currentUser?.role_id] || currentUser?.Role?.role_name || 'Online'}
                            </Typography.Text>
                        </div>
                    </div>
                    <div className="search-container">
                        <div className="theme-search-wrapper">
                            <SearchOutlined className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="theme-search-input"
                            />
                            <Button
                                type="text"
                                icon={<FiUserPlus />}
                                onClick={() => setCreateGroupModalVisible(true)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1890ff',
                                }}
                            />
                        </div>
                    </div>
                </div>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    className="chat-tabs"
                >
                    <TabPane tab="All" key="all" />
                    <TabPane tab="Online" key="online" />
                    <TabPane tab="Starred" key="starred" />
                </Tabs>
                <List 
                    className="chat-list"
                    dataSource={getFilteredUsers()}
                    renderItem={renderChatItem}
                    // loading={isLoadingUsers || isLoadingRoles}
                />
            </Sider>
            <Content className="chat-content">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-user-info">
                                <Avatar
                                    size={40}
                                    src={selectedUser.avatar}
                                    style={{ objectFit: 'cover' }}
                                />
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Text strong>{selectedUser.name}</Text>
                                        {selectedUser.type === 'group' && (
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                ({selectedUser.members?.length || 0} members)
                                            </Text>
                                        )}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                        {typingUsers.has(selectedUser.id) ? (
                                            <span className="typing-indicator">typing...</span>
                                        ) : (
                                            selectedUser.type === 'group' ?
                                                'Group Chat' :
                                                selectedUser.role
                                        )}
                                    </Text>
                                </div>
                            </div>
                            {selectedUser.type === 'group' ? (
                                <Button
                                    type="text"
                                    icon={<FiUsers />}
                                    onClick={() => setGroupInfoVisible(true)}
                                    style={{ fontSize: '20px' }}
                                />
                            ) : (
                                <Button type="text" icon={<EllipsisOutlined />} />
                            )}
                        </div>
                        <div className="chat-messages" ref={messagesContainerRef}>
                            {getMessages().map((message, index) => renderMessage(message))}
                        </div>
                        {renderChatInput()}
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <div className="welcome-content">
                            <div className="welcome-icon">
                                <MessageOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
                            </div>
                            <Typography.Title level={4} style={{ margin: '24px 0 8px', color: '#262626' }}>
                                Welcome to Messages
                            </Typography.Title>
                            <Text style={{
                                fontSize: '14px',
                                color: '#8c8c8c',
                                textAlign: 'center',
                                maxWidth: '400px',
                                marginBottom: '24px'
                            }}>
                                Connect with your team members, employees, and clients. Select a conversation from the left to start messaging.
                            </Text>
                            <div style={{
                                display: 'flex',
                                gap: '16px',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: '8px'
                                }}>
                                    <TeamOutlined style={{ color: '#1890ff' }} />
                                    <Text style={{ color: '#595959' }}>{getFilteredUsers().length} Contacts</Text>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: '#f5f5f5',
                                    borderRadius: '8px'
                                }}>
                                    <Badge dot color="#52c41a" />
                                    <Text style={{ color: '#595959' }}>Online</Text>
                                </div>
                            </div>
                        </div>
                        <div style={{
                            position: 'absolute',
                            bottom: '24px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            textAlign: 'center'
                        }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Messages are end-to-end encrypted
                            </Text>
                        </div>
                    </div>
                )}
            </Content>
            <CreateGroupModal />
            <GroupInfoModal />
        </Layout>
    );
}
