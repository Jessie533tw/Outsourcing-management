import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  FolderIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  DocumentMagnifyingGlassIcon,
  ShoppingCartIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';

const navigation = [
  { name: '控制台', href: '/dashboard', icon: HomeIcon },
  { name: '專案管理', href: '/projects', icon: FolderIcon },
  { name: '工料分析', href: '/material-analysis', icon: ClipboardDocumentListIcon },
  { name: '預算管理', href: '/budgets', icon: CurrencyDollarIcon },
  { name: '廠商管理', href: '/suppliers', icon: BuildingStorefrontIcon },
  { name: '詢價管理', href: '/inquiries', icon: DocumentMagnifyingGlassIcon },
  { name: '採購管理', href: '/purchase-orders', icon: ShoppingCartIcon },
  { name: '報表中心', href: '/reports', icon: DocumentChartBarIcon },
];

const userNavigation = [
  { name: '個人檔案', href: '/profile', icon: UserIcon },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const isCurrentPath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">發包管理系統</span>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isCurrentPath(item.href)
                        ? 'bg-primary-100 border-primary-600 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center pl-2 py-2 text-sm font-medium border-l-4 rounded-r-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isCurrentPath(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-white shadow">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <ChartBarIcon className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-semibold text-gray-900">發包管理系統</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isCurrentPath(item.href)
                        ? 'bg-primary-100 border-primary-600 text-primary-700'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group flex items-center pl-2 py-2 text-sm font-medium border-l-4 rounded-r-md`}
                  >
                    <item.icon
                      className={`${
                        isCurrentPath(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    {/* Search icon could go here */}
                  </div>
                  <div className="flex items-center h-full">
                    <h1 className="text-lg font-semibold text-gray-900">
                      {navigation.find(item => isCurrentPath(item.href))?.name || '發包管理系統'}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                  >
                    <UserIcon className="h-5 w-5 mr-1" />
                    {user?.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                    登出
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}