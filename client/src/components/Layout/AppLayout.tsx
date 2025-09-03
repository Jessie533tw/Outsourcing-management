import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  ShopOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import type { User } from '../../types';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, user, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '儀表板',
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '專案管理',
      children: [
        { key: '/projects', label: '專案列表' },
        { key: '/projects/new', label: '新建專案' },
      ],
    },
    {
      key: '/vendors',
      icon: <ShopOutlined />,
      label: '廠商管理',
      children: [
        { key: '/vendors', label: '廠商列表' },
        { key: '/vendors/new', label: '新增廠商' },
      ],
    },
    {
      key: '/materials',
      icon: <InboxOutlined />,
      label: '工料管理',
      children: [
        { key: '/materials', label: '材料清單' },
        { key: '/materials/analysis', label: '工料分析' },
      ],
    },
    {
      key: '/purchases',
      icon: <ShoppingCartOutlined />,
      label: '採購管理',
      children: [
        { key: '/purchases/quotations', label: '詢價管理' },
        { key: '/purchases/comparison', label: '比價分析' },
        { key: '/purchases/orders', label: '採購訂單' },
      ],
    },
    {
      key: '/progress',
      icon: <BarChartOutlined />,
      label: '進度追蹤',
      children: [
        { key: '/progress/schedule', label: '進度表' },
        { key: '/progress/delivery', label: '交貨追蹤' },
        { key: '/progress/alerts', label: '提醒通知' },
      ],
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: '報表中心',
      children: [
        { key: '/reports/project', label: '專案報表' },
        { key: '/reports/financial', label: '財務報表' },
        { key: '/reports/completion', label: '完工報告' },
      ],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.key === '/projects' || item.key === '/vendors') {
      return ['admin', 'manager'].includes(user.role);
    }
    return true;
  });

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '個人資料',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '登出',
      onClick: onLogout,
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={256}>
        <div style={{ 
          height: 64, 
          padding: '16px', 
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start'
        }}>
          <h2 style={{ 
            color: 'white', 
            margin: 0,
            fontSize: collapsed ? '16px' : '18px',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
          }}>
            {collapsed ? '發包系統' : '建設發包管理系統'}
          </h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={filteredMenuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff', 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <Space size="large">
            <Badge count={0} showZero={false}>
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: '18px' }} />}
                style={{ height: 40 }}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <div>
                  <div style={{ fontWeight: 500 }}>{user.username}</div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {user.department} - {user.role}
                  </div>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px 24px 0',
          padding: 24,
          background: '#fff',
          borderRadius: '8px',
          minHeight: 280,
          overflow: 'auto'
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;