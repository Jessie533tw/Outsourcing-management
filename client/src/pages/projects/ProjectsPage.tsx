import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { projectsAPI } from '../../services/api';
import type { Project, ProjectFilters } from '../../types';

const statusColors = {
  PLANNING: 'badge badge-primary',
  BUDGETING: 'badge-warning',
  APPROVED: 'badge-success',
  IN_PROGRESS: 'badge-primary',
  ON_HOLD: 'badge-warning',
  COMPLETED: 'badge-success',
  CANCELLED: 'badge-danger',
} as const;

const statusLabels = {
  PLANNING: '規劃中',
  BUDGETING: '預算編製中',
  APPROVED: '已核准',
  IN_PROGRESS: '進行中',
  ON_HOLD: '暫停',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
} as const;

export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', page, search, filters],
    queryFn: () => projectsAPI.getProjects({
      page,
      limit: 20,
      filters: { ...filters, search: search || undefined },
      sortBy: 'createdAt',
      sortOrder: 'desc',
    }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">專案管理</h1>
          <p className="text-gray-600">管理所有建設專案的完整生命週期</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          建立專案
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜尋專案名稱、代碼或客戶..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-10"
              />
            </div>
          </form>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            篩選
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">專案狀態</label>
                <select
                  className="form-input"
                  value={filters.status?.[0] || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    status: e.target.value ? [e.target.value] : undefined
                  })}
                >
                  <option value="">所有狀態</option>
                  <option value="PLANNING">規劃中</option>
                  <option value="BUDGETING">預算編製中</option>
                  <option value="APPROVED">已核准</option>
                  <option value="IN_PROGRESS">進行中</option>
                  <option value="ON_HOLD">暫停</option>
                  <option value="COMPLETED">已完成</option>
                  <option value="CANCELLED">已取消</option>
                </select>
              </div>
              <div>
                <label className="form-label">開始日期（從）</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    startDate: e.target.value || undefined
                  })}
                />
              </div>
              <div>
                <label className="form-label">結束日期（到）</label>
                <input
                  type="date"
                  className="form-input"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    endDate: e.target.value || undefined
                  })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setFilters({});
                  setSearch('');
                  setPage(1);
                }}
                className="btn btn-secondary btn-sm"
              >
                清除篩選
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects List */}
      <div className="card">
        {isLoading ? (
          <div className="p-6 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="mx-auto h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">沒有找到專案</h3>
            <p className="text-gray-600 mb-4">
              {search || Object.keys(filters).length > 0
                ? '請嘗試調整搜尋條件或篩選器'
                : '目前還沒有任何專案，點擊上方按鈕建立第一個專案'}
            </p>
            {!search && Object.keys(filters).length === 0 && (
              <button className="btn btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                建立第一個專案
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    專案資訊
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    狀態
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    預算
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    專案經理
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    建立日期
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((project: Project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {project.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.code} • {project.location || '未指定地點'}
                        </div>
                        {project.clientName && (
                          <div className="text-xs text-gray-400">
                            客戶：{project.clientName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${statusColors[project.status]}`}>
                        {statusLabels[project.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatCurrency(project.estimatedCost)}
                        </div>
                        {project.actualCost > 0 && (
                          <div className="text-gray-500">
                            實際：{formatCurrency(project.actualCost)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.manager?.name || '未指派'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link
                        to={`/projects/${project.id}`}
                        className="btn btn-secondary btn-sm"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        查看
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              顯示第 {((page - 1) * 20) + 1} 到 {Math.min(page * 20, data.pagination.total)} 項，
              共 {data.pagination.total} 項結果
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={!data.pagination.hasPrev}
                className="btn btn-secondary btn-sm"
              >
                上一頁
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.pagination.hasNext}
                className="btn btn-secondary btn-sm"
              >
                下一頁
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}