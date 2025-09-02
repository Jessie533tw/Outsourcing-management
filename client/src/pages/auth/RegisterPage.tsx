import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChartBarIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';
import type { RegisterData } from '../../types';

const registerSchema = z.object({
  email: z.string().email('請輸入有效的電子郵件'),
  username: z.string().min(3, '用戶名至少需要 3 個字符').max(50, '用戶名不能超過 50 個字符'),
  password: z.string().min(6, '密碼至少需要 6 個字符'),
  name: z.string().min(1, '請輸入姓名'),
  department: z.string().optional(),
  phone: z.string().optional(),
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, isLoading, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterData) => {
    try {
      await registerUser(data);
    } catch (error) {
      // Error is handled by the API interceptor and toast
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Register form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center">
              <ChartBarIcon className="h-10 w-10 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">發包管理系統</h1>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">建立新帳戶</h2>
            <p className="mt-2 text-sm text-gray-600">
              已有帳戶了？{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                立即登入
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="form-label">
                    姓名 *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    autoComplete="name"
                    className={`form-input ${errors.name ? 'border-red-300' : ''}`}
                    placeholder="請輸入姓名"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="username" className="form-label">
                    用戶名 *
                  </label>
                  <input
                    {...register('username')}
                    type="text"
                    autoComplete="username"
                    className={`form-input ${errors.username ? 'border-red-300' : ''}`}
                    placeholder="請輸入用戶名"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  電子郵件 *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  className={`form-input ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="請輸入電子郵件"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  密碼 *
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`form-input pr-10 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="請輸入密碼（至少 6 個字符）"
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
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="department" className="form-label">
                    部門
                  </label>
                  <input
                    {...register('department')}
                    type="text"
                    className="form-input"
                    placeholder="請輸入部門（選填）"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="form-label">
                    電話
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    autoComplete="tel"
                    className="form-input"
                    placeholder="請輸入電話（選填）"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isLoading ? '註冊中...' : '註冊帳戶'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Image/Illustration */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <ChartBarIcon className="h-24 w-24 mx-auto mb-6 opacity-80" />
            <h3 className="text-3xl font-bold mb-4">歡迎加入</h3>
            <p className="text-xl opacity-90 mb-6">
              開始使用專業的發包管理系統
            </p>
            <div className="bg-white/10 rounded-lg p-4 text-sm">
              <p className="font-medium mb-2">系統功能特色：</p>
              <ul className="text-left space-y-1 max-w-xs mx-auto">
                <li>✓ 完整工程管理流程</li>
                <li>✓ 自動化預算控制</li>
                <li>✓ 即時進度追蹤</li>
                <li>✓ 智能報表分析</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}