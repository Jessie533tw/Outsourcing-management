import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Materials: React.FC = () => {
  return (
    <div>
      <Title level={1}>工料管理</Title>
      <Card>
        <p>工料管理功能開發中...</p>
        <p>包括：材料管理、工料分析表生成、自動識別工程圖等功能</p>
      </Card>
    </div>
  );
};

export default Materials;