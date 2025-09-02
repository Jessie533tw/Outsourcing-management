import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChartBarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import type { LoginCredentials } from '../../types';

const loginSchema = z.object({
  identifier: z.string().min(1, '請輸入用戶名或電子郵件'),
  password: z.string().min(1, '請輸入密碼'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginCredentials) => {
    try {
      await login(data);
    } catch (error) {
      // Error is handled by the API interceptor and toast
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center">
              <ChartBarIcon className="h-10 w-10 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">發包管理系統</h1>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">登入您的帳戶</h2>
            <p className="mt-2 text-sm text-gray-600">
              還沒有帳戶嗎？{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                立即註冊
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="identifier" className="form-label">
                  用戶名或電子郵件
                </label>
                <div className="mt-1">
                  <input
                    {...register('identifier')}
                    type="text"
                    autoComplete="username"
                    className={`form-input ${errors.identifier ? 'border-red-300' : ''}`}
                    placeholder="請輸入用戶名或電子郵件"
                  />
                  {errors.identifier && (
                    <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  密碼
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className={`form-input pr-10 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="請輸入密碼"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? '登入中...' : '登入'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">測試帳號</span>
                </div>
              </div>

              <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">可使用以下測試帳號：</p>
                <div className="mt-2 space-y-1">
                  <p><span className="font-medium">管理員：</span>admin / password123</p>
                  <p><span className="font-medium">專案經理：</span>manager / password123</p>
                  <p><span className="font-medium">一般員工：</span>staff / password123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <ChartBarIcon className="h-24 w-24 mx-auto mb-6 opacity-80" />
            <h3 className="text-3xl font-bold mb-4">建設發包管理系統</h3>
            <p className="text-xl opacity-90 mb-4">
              完整的工程發包流程管理解決方案
            </p>
            <ul className="text-left space-y-2 max-w-md mx-auto">
              <li>• 工料分析表自動生成</li>
              <li>• 詢價比價智能管理</li>
              <li>• 採購單自動扣預算</li>
              <li>• 施工進度即時監控</li>
              <li>• 成本控管完整追蹤</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}