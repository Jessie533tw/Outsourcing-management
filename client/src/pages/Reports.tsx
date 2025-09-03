import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const Reports: React.FC = () => {
  return (
    <div>
      <Title level={1}>報表中心</Title>
      <Card>
        <p>報表中心功能開發中...</p>
        <p>包括：專案報表、財務報表、完工報告、PDF 生成等功能</p>
      </Card>
    </div>
  );
};

export default Reports;