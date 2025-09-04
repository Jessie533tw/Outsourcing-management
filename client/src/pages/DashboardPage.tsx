import { useQuery } from '@tanstack/react-query';
import {
  FolderIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { dashboardAPI } from '../services/api';

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color = 'primary' 
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <div className="card p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {change && (
              <div className={`ml-2 flex items-baseline text-sm ${
                changeType === 'increase' ? 'text-success-600' : 'text-danger-600'
              }`}>
                {changeType === 'increase' ? (
                  <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                )}
                {change}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">控制台</h1>
        <p className="text-gray-600">歡迎使用建設發包管理系統，以下是您的系統概況</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="專案總數"
          value={stats?.projects.total || 0}
          change="本月新增 3 個"
          changeType="increase"
          icon={FolderIcon}
          color="primary"
        />
        <StatCard
          title="採購單總額"
          value={`NT$ ${((stats?.purchaseOrders.totalAmount || 0) / 1000000).toFixed(1)}M`}
          change="較上月增加 12%"
          changeType="increase"
          icon={ShoppingCartIcon}
          color="success"
        />
        <StatCard
          title="預算使用率"
          value={`${((stats?.budgets.used || 0) / (stats?.budgets.total || 1) * 100).toFixed(1)}%`}
          change="預算剩餘 3.5M"
          changeType="decrease"
          icon={CurrencyDollarIcon}
          color="warning"
        />
        <StatCard
          title="延誤警告"
          value={(stats?.delays.deliveryDelays || 0) + (stats?.delays.scheduleDelays || 0)}
          change="需要關注"
          changeType="increase"
          icon={ExclamationTriangleIcon}
          color="danger"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <FolderIcon className="h-5 w-5 text-primary-600 mr-3" />
                <span className="font-medium">建立新專案</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">開始一個新的建設專案</p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-success-600 mr-3" />
                <span className="font-medium">編製預算</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">為專案建立詳細預算</p>
            </button>
            
            <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <ShoppingCartIcon className="h-5 w-5 text-warning-600 mr-3" />
                <span className="font-medium">發送詢價單</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 ml-8">向廠商詢價比價</p>
            </button>
          </div>
        </div>

        {/* Project Status Overview */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">專案狀態概覽</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">進行中專案</span>
              <span className="text-2xl font-bold text-primary-600">{stats?.projects.active || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ 
                  width: `${((stats?.projects.active || 0) / (stats?.projects.total || 1)) * 100}%` 
                }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center p-3 bg-success-50 rounded-lg">
                <p className="text-success-600 font-semibold text-lg">{stats?.projects.completed || 0}</p>
                <p className="text-success-600 text-sm">已完成</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-600 font-semibold text-lg">
                  {(stats?.projects.total || 0) - (stats?.projects.active || 0) - (stats?.projects.completed || 0)}
                </p>
                <p className="text-gray-600 text-sm">規劃中</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="mt-8">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">最新提醒</h3>
          <div className="space-y-3">
            <div className="flex items-start p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <ExclamationTriangleIcon className="h-5 w-5 text-warning-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-warning-800">交貨延遲警告</p>
                <p className="text-sm text-warning-700 mt-1">
                  「台北101大樓專案」的鋼筋材料預計今日交貨，但供應商尚未確認到貨時間
                </p>
                <p className="text-xs text-warning-600 mt-1">2 小時前</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <CurrencyDollarIcon className="h-5 w-5 text-primary-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary-800">預算審核通知</p>
                <p className="text-sm text-primary-700 mt-1">
                  「信義區商辦專案」預算已提交審核，等待主管核准
                </p>
                <p className="text-xs text-primary-600 mt-1">4 小時前</p>
              </div>
            </div>
            
            <div className="flex items-start p-3 bg-success-50 border border-success-200 rounded-lg">
              <FolderIcon className="h-5 w-5 text-success-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-success-800">專案進度更新</p>
                <p className="text-sm text-success-700 mt-1">
                  「板橋住宅專案」基礎工程已完成 85%，進度正常
                </p>
                <p className="text-xs text-success-600 mt-1">6 小時前</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}