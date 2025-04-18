import React from 'react';
import { Modal, Space, DatePicker, TimePicker } from 'antd';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Add UTC and timezone plugins to dayjs
dayjs.extend(utc);
dayjs.extend(timezone);

const ScheduleModal = ({
  visible,
  onCancel,
  onConfirm,
  scheduleDate,
  setScheduleDate,
  scheduleTime,
  setScheduleTime
}) => {
  const handleConfirm = () => {
    if (scheduleDate && scheduleTime) {
      // Get the local timezone offset in minutes
      const timezoneOffset = new Date().getTimezoneOffset();
      
      // Combine date and time
      const combinedDateTime = dayjs(scheduleDate)
        .hour(scheduleTime.hour())
        .minute(scheduleTime.minute())
        .second(0);

      // Add the timezone offset to compensate for UTC conversion
      const adjustedDateTime = combinedDateTime.add(timezoneOffset, 'minute');
      
      // Convert to UTC ISO string
      const utcDateTime = adjustedDateTime.toISOString();
      
      onConfirm(scheduleDate, scheduleTime, utcDateTime);
    }
  };

  return (
    <Modal
      title="Schedule Email"
      open={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      okText="Schedule"
      okButtonProps={{
        disabled: !scheduleDate || !scheduleTime
      }}
      className="schedule-modal"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <DatePicker
          value={scheduleDate}
          onChange={setScheduleDate}
          disabledDate={(current) => current && current < dayjs().startOf('day')}
          style={{ width: '100%' }}
          placeholder="Select date"
          format="YYYY-MM-DD"
          showToday={true}
        />
        <TimePicker
          value={scheduleTime}
          onChange={setScheduleTime}
          format="hh:mm A"
          style={{ width: '100%' }}
          placeholder="Select time"
          minuteStep={1}
          use12Hours={true}
          showNow={true}
          allowClear={true}
          inputReadOnly={true}
          popupClassName="time-picker-popup"
          hideDisabledOptions={true}
        />
      </Space>
    </Modal>
  );
};

export default ScheduleModal;