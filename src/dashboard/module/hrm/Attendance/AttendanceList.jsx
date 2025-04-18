import React, { useState } from 'react';
import { Table, Tag, Tooltip, Button, Space, DatePicker } from 'antd';
import { FiCalendar, FiUser, FiClock, FiFilter } from 'react-icons/fi';
import { useGetAllAttendancesQuery } from './services/attendanceApi';
import { useGetEmployeesQuery } from '../Employee/services/employeeApi';
import { useGetAllHolidaysQuery } from '../Holiday/services/holidayApi';
import { useGetLeaveQuery } from '../leave/services/LeaveApi'; // Added leave API import
import dayjs from 'dayjs';
import './attendance.scss';

const { MonthPicker } = DatePicker;

const AttendanceList = ({ searchText, filters }) => {
    // Add state for month filter
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    
    const { data: attendanceData, isLoading: isLoadingAttendance } = useGetAllAttendancesQuery();
    const { data: employeeData, isLoading: isLoadingEmployees } = useGetEmployeesQuery();
    const { data: holidayData, isLoading: isLoadingHolidays } = useGetAllHolidaysQuery();
    const { data: leaveData, isLoading: isLoadingLeaves } = useGetLeaveQuery(); // Added leave data query

    // Function to calculate time duration between start and end time
    const calculateDuration = (startTimeStr, endTimeStr) => {
        try {
            if (!endTimeStr) return 'In Progress';
            
            const startTime = dayjs(startTimeStr, 'HH:mm:ss');
            const endTime = dayjs(endTimeStr, 'HH:mm:ss');
            
            if (startTime.isValid() && endTime.isValid()) {
                const diffMinutes = endTime.diff(startTime, 'minute');
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return `${hours}h ${minutes}m`;
            }
        } catch (error) {
            console.error('Error calculating duration:', error);
        }
        return 'N/A';
    };

    // Transform employee data with search filtering
    const filteredEmployees = React.useMemo(() => {
        if (!employeeData?.data) return [];
        const data = employeeData.data;

        let filtered = data;
        
        // Apply search text filter
        if (searchText) {
            const searchLower = searchText.toLowerCase();
            filtered = data.filter(emp => {
                const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
                const employeeCode = emp.employee_code?.toLowerCase() || '';
                const department = emp.department?.toLowerCase() || '';
                
                return (
                    fullName.includes(searchLower) ||
                    employeeCode.includes(searchLower) ||
                    department.includes(searchLower)
                );
            });
        }

        return filtered.map(emp => ({
            id: emp.id,
            name: emp.firstName && emp.lastName
                ? `${emp.firstName} ${emp.lastName}`
                : emp.username,
            avatar: emp.avatar
        }));
    }, [employeeData?.data, searchText]);

    // Transform holiday data
    const holidays = React.useMemo(() => {
        if (!holidayData) return new Map();
        const data = Array.isArray(holidayData) ? holidayData : holidayData.data || [];

        // Create a map of dates that are holidays
        const holidayMap = new Map();

        data.forEach(holiday => {
            const startDate = dayjs(holiday.start_date);
            const endDate = dayjs(holiday.end_date);
            let currentDate = startDate;

            // Add all dates between start and end date to the map
            while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                holidayMap.set(currentDate.format('YYYY-MM-DD'), holiday);
                currentDate = currentDate.add(1, 'day');
            }
        });

        return holidayMap;
    }, [holidayData]);

    // Transform leave data
    const leaves = React.useMemo(() => {
        if (!leaveData) return new Map();
        const data = Array.isArray(leaveData) ? leaveData : leaveData.data || [];

        // Create a map of dates that are leaves
        const leaveMap = new Map();

        data.forEach(leave => {
            if (leave.status === 'approved') { // Only show approved leaves
                const startDate = dayjs(leave.startDate);
                const endDate = dayjs(leave.endDate);
                let currentDate = startDate;

                // Add all dates between start and end date to the map
                while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
                    leaveMap.set(`${leave.employeeId}_${currentDate.format('YYYY-MM-DD')}`, {
                        ...leave,
                        isHalfDay: leave.isHalfDay
                    });
                    currentDate = currentDate.add(1, 'day');
                }
            }
        });

        return leaveMap;
    }, [leaveData]);

    // Update month filter handler
    const handleMonthChange = (date) => {
        setSelectedMonth(date || dayjs());
    };

    // Modify getDaysInMonth to use selectedMonth
    const getDaysInMonth = () => {
        const days = [];
        const year = selectedMonth.year();
        const month = selectedMonth.month();
        const daysInMonth = selectedMonth.daysInMonth();

        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = dayjs(new Date(year, month, i));
            days.push({
                date: i,
                day: dayDate.format('ddd'),
                fullDate: dayDate.format('YYYY-MM-DD'),
            });
        }
        return days;
    };

    const days = getDaysInMonth();

    // Status tags configuration
    const statusConfig = {
        'P': { color: '#52c41a', text: 'Present', background: '#f6ffed' },
        'A': { color: '#ff4d4f', text: 'Absent', background: '#fff2f0' },
        'L': { color: '#faad14', text: 'Leave', background: '#fffbe6' },
        'H': { color: '#1890ff', text: 'Half Day', background: '#e6f7ff' },
        'PH': { color: '#722ed1', text: 'Paid Holiday', background: '#f9f0ff' },
        'UNP': { color: '#722ed1', text: 'Unpaid Holiday', background: '#f9f0ff' },
        'WK': { color: '#13c2c2', text: 'Weekend', background: '#e6fffb' }
    };

    // Add this function to calculate present days
    const calculateAttendanceRatio = (rowData) => {
        let presentDays = 0;
        let totalWorkingDays = 0;

        days.forEach(day => {
            const status = rowData[`day${day.date}`];
            // Don't count weekends (WK) and holidays (PH, UNP) in total working days
            if (status !== 'WK' && status !== 'PH' && status !== 'UNP') {
                totalWorkingDays++;
                // Count present (P) and half days (H) as present
                if (status === 'P' || status === 'H') {
                    presentDays++;
                }
            }
        });

        return {
            ratio: `${presentDays}/${totalWorkingDays}`,
            percentage: totalWorkingDays > 0 
                ? Math.round((presentDays / totalWorkingDays) * 100) 
                : 0
        };
    };

    // Create processed attendance data map for quick lookup
    const processedAttendanceData = React.useMemo(() => {
        const attendances = Array.isArray(attendanceData)
            ? attendanceData
            : (attendanceData?.data || []);
        
        // Create a map for quick lookup
        const attendanceMap = new Map();
        
        attendances.forEach(att => {
            const key = `${att.employee}_${dayjs(att.date).format('YYYY-MM-DD')}`;
            attendanceMap.set(key, att);
        });
        
        return attendanceMap;
    }, [attendanceData]);

    // Function to get end time from attendance record (handles API inconsistency)
    const getEndTime = (attendance) => {
        // Check both endTime (from response) and end_time (from payload)
        return attendance.endTime !== undefined ? attendance.endTime : attendance.end_time;
    };

    // Render attendance details with start time, end time, and duration
    const renderAttendanceDetails = (attendance, config, status) => {
        if (!attendance || !attendance.startTime) return null;
        
        // Format start time
        const startTime = dayjs(attendance.startTime, 'HH:mm:ss').format('HH:mm');
        
        // Handle end time which could be null
        let endTimeDisplay = 'In Progress';
        const endTime = getEndTime(attendance);
        if (endTime) {
            endTimeDisplay = dayjs(endTime, 'HH:mm:ss').format('HH:mm');
        }
        
        // Calculate duration
        const duration = calculateDuration(attendance.startTime, endTime);
        
        return (
            <Tooltip title={
                <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 600, marginBottom: '4px', textAlign: 'center' }}>{config.text}</div>
                    <div>Start Time: {startTime}</div>
                    <div>End Time: {endTimeDisplay}</div>
                    <div>Duration: {duration}</div>
                    {attendance.comment && (
                        <div style={{ marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '4px' }}>
                            <span style={{ fontStyle: 'italic' }}>Note: {attendance.comment}</span>
                        </div>
                    )}
                </div>
            }>
                <Tag
                    className="attendance-status"
                    style={{
                        color: config.color,
                        backgroundColor: config.background,
                        border: `1px solid ${config.color}`,
                        margin: 0,
                        minWidth: '32px',
                        textAlign: 'center'
                    }}
                >
                    {status}
                </Tag>
            </Tooltip>
        );
    };

    // Update the columns definition
    const columns = [
        {
            title: 'Employee Details',
            dataIndex: 'name',
            key: 'name',
            fixed: 'left',
            width: 280,
            render: (text, record) => {
                const attendance = calculateAttendanceRatio(record);
                return (
                    <div className="employee-info">
                        <div className="employee-avatar">
                            {record.avatar ? (
                                <img src={record.avatar} alt={text} />
                            ) : (
                                <FiUser size={24} />
                            )}
                        </div>
                        <div className="employee-details">
                            <span className="employee-name">{text}</span>
                            <span className="employee-code">{record.code}</span>
                            <span className="employee-department">{record.department}</span>
                            <span className="attendance-ratio" style={{
                                color: attendance.percentage >= 70 ? '#52c41a' : 
                                       attendance.percentage >= 50 ? '#faad14' : '#ff4d4f',
                                fontSize: '12px',
                                fontWeight: 500
                            }}>
                                Present: {attendance.ratio} ({attendance.percentage}%)
                            </span>
                        </div>
                    </div>
                );
            },
        },
        ...days.map(day => ({
            title: (
                <div className="date-header">
                    <div className="date">{day.date}</div>
                    <div className="day">{day.day}</div>
                </div>
            ),
            dataIndex: `day${day.date}`,
            key: `day${day.date}`,
            width: 60,
            align: 'center',
            render: (status = 'A', record) => {
                const config = statusConfig[status] || statusConfig['A'];
                
                // If status is Present or Half day, show time details
                if (status === 'P' || status === 'H') {
                    // Get the attendance record
                    const attendanceKey = `${record.key}_${day.fullDate}`;
                    const attendance = processedAttendanceData.get(attendanceKey);
                    
                    if (attendance && attendance.startTime) {
                        return renderAttendanceDetails(attendance, config, status);
                    }
                }
                
                return (
                    <Tooltip title={config.text}>
                        <Tag
                            className="attendance-status"
                            style={{
                                color: config.color,
                                backgroundColor: config.background,
                                border: `1px solid ${config.color}`,
                                margin: 0,
                                minWidth: '32px',
                                textAlign: 'center'
                            }}
                        >
                            {status}
                        </Tag>
                    </Tooltip>
                );
            }
        }))
    ];

    // Update your data generation to store attendance data
    const data = React.useMemo(() => {
        const attendances = Array.isArray(attendanceData)
            ? attendanceData
            : (attendanceData?.data || []);

        return filteredEmployees.map(emp => {
            const rowData = {
                key: emp.id,
                name: emp.name,
                avatar: emp.avatar,
                department: emp.department,
                code: emp.code
            };

            days.forEach(day => {
                // Find attendance for this employee on this specific day
                const attendance = attendances.find(att => 
                    att.employee === emp.id && 
                    dayjs(att.date).format('YYYY-MM-DD') === day.fullDate
                );

                const holiday = holidays.get(day.fullDate);
                const leaveKey = `${emp.id}_${day.fullDate}`;
                const leave = leaves.get(leaveKey);
                const isWeekend = ['Sun', 'Sat'].includes(day.day);

                if (leave) {
                    rowData[`day${day.date}`] = leave.isHalfDay ? 'H' : 'L';
                } else if (holiday) {
                    rowData[`day${day.date}`] = holiday.leave_type === 'paid' ? 'PH' : 'UNP';
                } else if (isWeekend) {
                    rowData[`day${day.date}`] = 'WK';
                } else if (attendance) {
                    rowData[`day${day.date}`] = attendance.halfDay ? 'H' : 
                                               attendance.late ? 'L' : 'P';
                } else {
                    rowData[`day${day.date}`] = 'A';
                }
            });

            return rowData;
        });
    }, [filteredEmployees, attendanceData?.data, days, holidays, leaves]);

    return (
        <div className="attendance-list-container">
            <div className="attendance-header">
                {/* Add month filter */}
                <div className="filter-section">
                    <DatePicker
                        picker="month"
                        value={selectedMonth}
                        onChange={handleMonthChange}
                        allowClear={false}
                        format="MMMM YYYY"
                        className="month-picker"
                    />
                

                <div className="status-legend">
                    {Object.entries(statusConfig).map(([key, value]) => (
                        <div key={key} className="legend-item">
                            <Tag
                                style={{
                                    color: value.color,
                                    backgroundColor: value.background,
                                    border: `1px solid ${value.color}`
                                }}
                            >
                                {key}
                            </Tag>
                            <span>{value.text}</span>
                        </div>
                    ))}
                </div>
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                scroll={{ x: 'max-content' }}
                pagination={false}
                className="attendance-table"
                bordered
            />
        </div>
    );
};

export default AttendanceList;
