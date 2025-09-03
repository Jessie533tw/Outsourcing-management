import React from 'react';
import { Form, Input, Button, Card, Layout, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import type { User } from '../types';

const { Content } = Layout;
const { Title, Text } = Typography;

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values.email, values.password);
      onLogin(response.user, response.token);
    } catch (error: any) {
      message.error(error.message || '登入失敗，請檢查您的憑證');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Content style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px'
      }}>
        <Card 
          style={{ 
            width: '100%',
            maxWidth: 400,
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: 8 }}>
              建設發包管理系統
            </Title>
            <Text type="secondary">
              請登入您的帳戶以繼續使用系統
            </Text>
          </div>

          <Form
            name="login"
            size="large"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '請輸入您的電子郵件' },
                { type: 'email', message: '請輸入有效的電子郵件格式' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="電子郵件"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '請輸入您的密碼' },
                { min: 6, message: '密碼至少需要6個字符' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="密碼"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                block
                style={{ height: 48, fontSize: '16px' }}
              >
                登入系統
              </Button>
            </Form.Item>
          </Form>

          <div style={{ 
            textAlign: 'center', 
            marginTop: 24,
            padding: '16px',
            background: '#f9f9f9',
            borderRadius: '6px'
          }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              示範帳戶：admin@company.com / password
            </Text>
          </div>
        </Card>
      </Content>
    </Layout>
  );
};

export default Login;