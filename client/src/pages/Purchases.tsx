import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Purchases: React.FC = () => {
  return (
    <div>
      <Title level={1}>採購管理</Title>
      <Card>
        <p>採購管理功能開發中...</p>
        <p>包括：詢價管理、比價分析、採購單生成和管理等功能</p>
      </Card>
    </div>
  );
};

export default Purchases;