import { useParams } from 'react-router-dom';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">專案詳情</h1>
        <p className="text-gray-600">專案 ID: {id}</p>
      </div>
      
      <div className="card p-6">
        <p className="text-gray-600">專案詳情頁面開發中...</p>
      </div>
    </div>
  );
}