import React from 'react';
import { Input, Button, Tooltip, Spin } from 'antd';
import { FiSearch, FiRefreshCw } from 'react-icons/fi';

const MailHeader = ({ searchText, setSearchText, onRefresh, isRefreshing }) => {
  return (
    <div className="mail-header">
      <div className="header-actions">
        <Tooltip title="Refresh">
          <Button 
            icon={<FiRefreshCw className={isRefreshing ? 'spin' : ''} />} 
            onClick={onRefresh}
            loading={isRefreshing}
          />
        </Tooltip>
        {/* <Tooltip title="More actions">
          <Button icon={<FiMoreVertical />} />
        </Tooltip> */}
      </div>

      <div className="search-wrapper">
        <Input
          prefix={<FiSearch />}
          placeholder="Search in emails..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <style jsx>{`
        .spin {
          animation: rotate 1s linear infinite;
        }
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MailHeader;