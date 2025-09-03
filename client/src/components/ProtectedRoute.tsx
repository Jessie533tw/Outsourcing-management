import React from 'react';
import { Result, Button } from 'antd';
import type { User } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  user, 
  requiredRoles 
}) => {
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return (
      <Result
        status="403"
        title="權限不足"
        subTitle="您沒有權限訪問此頁面"
        extra={
          <Button type="primary" onClick={() => window.history.back()}>
            返回
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;