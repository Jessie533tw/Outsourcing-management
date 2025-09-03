import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Tag, Space, Modal, Form, Input, DatePicker, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { projectAPI } from '../services/api';
import type { Project } from '../types';

const { RangePicker } = DatePicker;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.projects || []);
    } catch (error: any) {
      message.error(error.message || '載入專案列表失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (values: any) => {
    try {
      const [startDate, endDate] = values.dateRange;
      await projectAPI.createProject({
        ...values,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
      });
      message.success('專案創建成功');
      setModalVisible(false);
      form.resetFields();
      fetchProjects();
    } catch (error: any) {
      message.error(error.message || '創建專案失敗');
    }
  };

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

  const columns: ColumnsType<Project> = [
    {
      title: '專案編號',
      dataIndex: 'projectId',
      key: 'projectId',
      width: 120,
    },
    {
      title: '專案名稱',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '客戶',
      dataIndex: 'client',
      key: 'client',
      width: 150,
    },
    {
      title: '地點',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      width: 100,
    },
    {
      title: '預算',
      key: 'budget',
      render: (_, record) => (
        <div>
          <div>總額: NT$ {(record.budget?.total || 0).toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            剩餘: NT$ {(record.budget?.remaining || 0).toLocaleString()}
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: '開始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      width: 120,
    },
    {
      title: '結束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => dayjs(date).format('YYYY-MM-DD'),
      width: 120,
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            檢視
          </Button>
          <Button icon={<EditOutlined />} size="small">
            編輯
          </Button>
        </Space>
      ),
      width: 120,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>專案管理</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setModalVisible(true)}
        >
          新建專案
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={projects}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 個專案`,
          }}
        />
      </Card>

      <Modal
        title="新建專案"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="專案名稱"
            rules={[{ required: true, message: '請輸入專案名稱' }]}
          >
            <Input placeholder="請輸入專案名稱" />
          </Form.Item>

          <Form.Item
            name="description"
            label="專案描述"
          >
            <Input.TextArea placeholder="請輸入專案描述" rows={3} />
          </Form.Item>

          <Form.Item
            name="client"
            label="客戶"
            rules={[{ required: true, message: '請輸入客戶名稱' }]}
          >
            <Input placeholder="請輸入客戶名稱" />
          </Form.Item>

          <Form.Item
            name="location"
            label="專案地點"
            rules={[{ required: true, message: '請輸入專案地點' }]}
          >
            <Input placeholder="請輸入專案地點" />
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="專案期間"
            rules={[{ required: true, message: '請選擇專案期間' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="estimatedCost"
            label="預估成本"
            rules={[{ required: true, message: '請輸入預估成本' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="請輸入預估成本"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonBefore="NT$"
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={() => {
              setModalVisible(false);
              form.resetFields();
            }}>
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              創建專案
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;