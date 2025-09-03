import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Alert, Tag, Progress } from 'antd';
import { 
  ProjectOutlined, 
  ShopOutlined, 
  ShoppingCartOutlined, 
  BarChartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { projectAPI, purchaseAPI, progressAPI } from '../services/api';
import type { Project, PurchaseOrder, Alert as AlertType } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalPurchaseOrders: 0,
    totalSpent: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<PurchaseOrder[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, purchasesRes] = await Promise.all([
          projectAPI.getProjects(),
          purchaseAPI.getPurchaseOrders()
        ]);

        const projects = projectsRes.projects || [];
        const purchases = purchasesRes.purchaseOrders || [];

        setStats({
          totalProjects: projects.length,
          activeProjects: projects.filter((p: Project) => 
            ['approved', 'in_progress'].includes(p.status)
          ).length,
          totalPurchaseOrders: purchases.length,
          totalSpent: purchases.reduce((sum: number, po: PurchaseOrder) => 
            sum + (po.totalAmount || 0), 0
          ),
        });

        setRecentProjects(projects.slice(0, 5));
        setRecentPurchases(purchases.slice(0, 5));

        if (projects.length > 0) {
          try {
            const alertsRes = await progressAPI.getAlerts(projects[0]._id);
            setAlerts(alertsRes.alerts || []);
          } catch (error) {
            console.warn('無法載入提醒資料');
          }
        }
      } catch (error) {
        console.error('載入儀表板資料失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusTag = (status: string) => {
    const statusMap = {
      planning: { color: 'default', text: '規劃中' },
      pending_approval: { color: 'orange', text: '待審核' },
      approved: { color: 'green', text: '已核准' },
      in_progress: { color: 'blue', text: '進行中' },
      completed: { color: 'success', text: '已完成' },
      suspended: { color: 'red', text: '暫停' }
    };
    const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getPriorityIcon = (priority: string) => {
    const iconMap = {
      high: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      medium: <ClockCircleOutlined style={{ color: '#faad14' }} />,
      low: <CheckCircleOutlined style={{ color: '#52c41a' }} />
    };
    return iconMap[priority as keyof typeof iconMap];
  };

  const projectColumns: ColumnsType<Project> = [
    {
      title: '專案名稱',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      width: 100,
    },
    {
      title: '預算進度',
      key: 'budget',
      render: (_, record) => {
        const percentage = record.budget ? 
          Math.round((record.budget.allocated / record.budget.total) * 100) : 0;
        return (
          <div>
            <Progress percent={percentage} size="small" />
            <div style={{ fontSize: '12px', color: '#666' }}>
              NT$ {(record.budget?.allocated || 0).toLocaleString()} / 
              NT$ {(record.budget?.total || 0).toLocaleString()}
            </div>
          </div>
        );
      },
      width: 200,
    },
  ];

  const purchaseColumns: ColumnsType<PurchaseOrder> = [
    {
      title: '採購單號',
      dataIndex: 'poNumber',
      key: 'poNumber',
      width: 120,
    },
    {
      title: '廠商',
      dataIndex: ['vendor', 'name'],
      key: 'vendor',
      width: 120,
    },
    {
      title: '金額',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `NT$ ${amount?.toLocaleString() || 0}`,
      width: 100,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: { color: 'default', text: '草稿' },
          sent: { color: 'processing', text: '已發送' },
          confirmed: { color: 'success', text: '已確認' },
          partially_received: { color: 'warning', text: '部分到貨' },
          completed: { color: 'success', text: '已完成' },
          cancelled: { color: 'error', text: '已取消' }
        };
        const config = statusMap[status as keyof typeof statusMap] || 
          { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
      width: 100,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>系統總覽</h1>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總專案數"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="進行中專案"
              value={stats.activeProjects}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="採購訂單數"
              value={stats.totalPurchaseOrders}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="總支出金額"
              value={stats.totalSpent}
              prefix="NT$"
              precision={0}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      {alerts.length > 0 && (
        <Card title="系統提醒" style={{ marginBottom: 24 }}>
          {alerts.slice(0, 3).map((alert, index) => (
            <Alert
              key={index}
              message={alert.message}
              type={alert.priority === 'high' ? 'error' : 
                    alert.priority === 'medium' ? 'warning' : 'info'}
              icon={getPriorityIcon(alert.priority)}
              style={{ marginBottom: 8 }}
              showIcon
            />
          ))}
        </Card>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近專案" size="small">
            <Table
              columns={projectColumns}
              dataSource={recentProjects}
              pagination={false}
              loading={loading}
              rowKey="_id"
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近採購" size="small">
            <Table
              columns={purchaseColumns}
              dataSource={recentPurchases}
              pagination={false}
              loading={loading}
              rowKey="_id"
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;