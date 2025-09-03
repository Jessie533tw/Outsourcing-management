import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Progress: React.FC = () => {
  return (
    <div>
      <Title level={1}>進度追蹤</Title>
      <Card>
        <p>進度追蹤功能開發中...</p>
        <p>包括：施工進度表、交貨追蹤、進度監控和提醒通知等功能</p>
      </Card>
    </div>
  );
};

export default Progress;