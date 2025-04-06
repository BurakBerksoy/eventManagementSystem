import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Space, Tag, Typography, Modal, message, Spin, Form, Select, DatePicker, Alert, Popconfirm, Tooltip, Badge } from 'antd';
import { PlusOutlined, ReloadOutlined, CopyOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined, WarningOutlined, CheckCircleOutlined, KeyOutlined } from '@ant-design/icons';
import { apiKeyService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * API Anahtarı Yönetim Bileşeni
 * Kullanıcının API anahtarlarını yönetmesini sağlar
 */
const ApiKeyManager = ({ isAdmin = false }) => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [keyVisible, setKeyVisible] = useState({});
  const [newApiKey, setNewApiKey] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  // API anahtarlarını yükle
  useEffect(() => {
    fetchApiKeys();
  }, []);
  
  // API anahtarlarını getir
  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      
      // Kullanıcı rolüne göre API anahtarlarını getir
      const apiKeys = isAdmin
        ? await apiKeyService.getAllApiKeys()
        : await apiKeyService.getUserApiKeys();
      
      // Sayfa ilk yüklendiğinde anahtarları gizle
      const initialKeyVisibility = {};
      apiKeys.forEach(key => {
        initialKeyVisibility[key.id] = false;
      });
      
      setKeys(apiKeys);
      setKeyVisible(initialKeyVisibility);
      setLoading(false);
    } catch (error) {
      console.error('API anahtarları yüklenirken hata oluştu:', error);
      setError('API anahtarları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // Yeni API anahtarı oluştur
  const handleCreateApiKey = async (values) => {
    try {
      setLoading(true);
      
      // API key verisini hazırla
      const apiKeyData = {
        name: values.name,
        description: values.description,
        scope: values.scope,
        expiresAt: values.validity && values.validity.length === 2 
          ? values.validity[1].toISOString() 
          : null
      };
      
      // Yeni anahtarı oluştur
      const result = await apiKeyService.createApiKey(apiKeyData);
      
      if (result) {
        message.success('API anahtarı başarıyla oluşturuldu');
        
        // Oluşturulan anahtarı göster (bu sadece oluşturma anında görüntülenir)
        setNewApiKey(result);
        
        // Formu sıfırla
        form.resetFields();
        
        // API anahtarları listesini güncelle
        await fetchApiKeys();
      }
      
      setLoading(false);
    } catch (error) {
      console.error('API anahtarı oluşturulurken hata oluştu:', error);
      message.error('API anahtarı oluşturulurken bir hata oluştu');
      setLoading(false);
    }
  };
  
  // API anahtarını sil
  const handleDeleteApiKey = async (keyId) => {
    try {
      await apiKeyService.deleteApiKey(keyId);
      message.success('API anahtarı başarıyla silindi');
      
      // Listeyi güncelle
      await fetchApiKeys();
    } catch (error) {
      console.error('API anahtarı silinirken hata oluştu:', error);
      message.error('API anahtarı silinirken bir hata oluştu');
    }
  };
  
  // Kapsam etiketi
  const getScopeTag = (scope) => {
    switch (scope) {
      case 'READ':
        return <Tag color="blue">Okuma</Tag>;
      case 'WRITE':
        return <Tag color="orange">Yazma</Tag>;
      case 'ADMIN':
        return <Tag color="red">Admin</Tag>;
      case 'FULL':
        return <Tag color="purple">Tam Erişim</Tag>;
      default:
        return <Tag>Bilinmiyor</Tag>;
    }
  };
  
  // Panoya kopyala
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => message.success('API anahtarı panoya kopyalandı'),
      () => message.error('API anahtarı kopyalanırken hata oluştu')
    );
  };
  
  // Anahtar görünürlüğünü değiştir
  const toggleKeyVisibility = (keyId) => {
    setKeyVisible({
      ...keyVisible,
      [keyId]: !keyVisible[keyId]
    });
  };
  
  // Modal kapat
  const handleCloseModal = () => {
    setCreateModalVisible(false);
    setNewApiKey(null);
    form.resetFields();
  };
  
  // Anahtar durumunu göster
  const getKeyStatusTag = (key) => {
    if (key.revoked) {
      return <Tag color="red" icon={<WarningOutlined />}>İptal Edildi</Tag>;
    }
    
    if (key.expiresAt && moment(key.expiresAt).isBefore(moment())) {
      return <Tag color="orange" icon={<WarningOutlined />}>Süresi Doldu</Tag>;
    }
    
    return <Tag color="green" icon={<CheckCircleOutlined />}>Aktif</Tag>;
  };
  
  // Kalan süre
  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) return 'Süresiz';
    
    const expiry = moment(expiresAt);
    const now = moment();
    
    if (now.isAfter(expiry)) {
      return 'Süresi Doldu';
    }
    
    return expiry.fromNow(true) + ' kaldı';
  };
  
  // Anahtarı maskele
  const maskApiKey = (key) => {
    if (!key) return '';
    return key.substring(0, 6) + '•••••••••••••••••' + key.substring(key.length - 4);
  };
  
  // Filtreleme
  const getFilteredKeys = () => {
    if (!searchText) return keys;
    
    return keys.filter(key => 
      key.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (key.description && key.description.toLowerCase().includes(searchText.toLowerCase())) ||
      key.keyPrefix.toLowerCase().includes(searchText.toLowerCase())
    );
  };
  
  // Tablo sütunları
  const columns = [
    {
      title: 'API Anahtarı',
      dataIndex: 'key',
      key: 'key',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <Space>
              <KeyOutlined />
              <Text strong>{record.name}</Text>
              {getKeyStatusTag(record)}
            </Space>
          </div>
          <Space>
            <Text style={{ fontFamily: 'monospace' }}>
              {record.keyValue ? 
                (keyVisible[record.id] ? record.keyValue : maskApiKey(record.keyValue))
                : 
                (keyVisible[record.id] ? record.keyPrefix + '...' : maskApiKey(record.keyPrefix))
              }
            </Text>
            <Button 
              icon={keyVisible[record.id] ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              type="text"
              size="small"
              onClick={() => toggleKeyVisibility(record.id)}
            />
            <Button 
              icon={<CopyOutlined />}
              type="text"
              size="small"
              onClick={() => copyToClipboard(record.keyValue || record.keyPrefix)}
            />
          </Space>
          {record.description && (
            <Text type="secondary">{record.description}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Kapsam',
      dataIndex: 'scope',
      key: 'scope',
      render: scope => getScopeTag(scope),
    },
    {
      title: 'Oluşturulma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('LLL'),
    },
    {
      title: 'Geçerlilik',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (expiresAt, record) => {
        if (record.revoked) {
          return <Text type="danger">İptal Edildi</Text>;
        }
        
        if (!expiresAt) {
          return <Text type="success">Süresiz</Text>;
        }
        
        const isExpired = moment(expiresAt).isBefore(moment());
        
        return (
          <Space direction="vertical" size="small">
            <Text>{moment(expiresAt).format('LLL')}</Text>
            <Text type={isExpired ? "danger" : "warning"}>
              {getRemainingTime(expiresAt)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Sil">
            <Popconfirm
              title="Bu API anahtarını silmek istediğinize emin misiniz?"
              description="Bu işlem geri alınamaz ve anahtarı kullanan tüm uygulamalar artık çalışmayacaktır."
              onConfirm={() => handleDeleteApiKey(record.id)}
              okText="Evet"
              cancelText="Hayır"
              okButtonProps={{ danger: true }}
              icon={<WarningOutlined style={{ color: 'red' }} />}
            >
              <Button
                danger
                type="text"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  return (
    <div className="api-key-manager">
      <Card
        title={<Title level={4}>API Anahtarları</Title>}
        extra={
          <Space>
            <Input
              placeholder="Ara..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
              style={{ width: 200 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchApiKeys}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Yeni API Anahtarı
            </Button>
          </Space>
        }
      >
        {error && (
          <Alert
            message="Hata"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        
        <Table
          columns={columns}
          dataSource={getFilteredKeys()}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
        
        {keys.length === 0 && !loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Paragraph type="secondary">
              Henüz API anahtarınız bulunmuyor. "Yeni API Anahtarı" butonuna tıklayarak bir tane oluşturabilirsiniz.
            </Paragraph>
          </div>
        )}
      </Card>
      
      {/* Yeni API Anahtarı Oluşturma Modal */}
      <Modal
        title="Yeni API Anahtarı Oluştur"
        open={createModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        maskClosable={false}
        width={600}
      >
        {newApiKey ? (
          <div style={{ textAlign: 'center' }}>
            <Alert
              message="API Anahtarınız Oluşturuldu"
              description={
                <Paragraph>
                  <Text strong>Bu anahtarı sadece bir kez görebilirsiniz.</Text> Lütfen güvenli bir yere kaydedin.
                </Paragraph>
              }
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px', 
              fontFamily: 'monospace',
              marginBottom: 16,
              wordBreak: 'break-all'
            }}>
              {newApiKey.key}
            </div>
            
            <Space>
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(newApiKey.key)}
              >
                Panoya Kopyala
              </Button>
              <Button onClick={handleCloseModal}>Kapat</Button>
            </Space>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreateApiKey}
          >
            <Form.Item
              name="name"
              label="Anahtar Adı"
              rules={[{ required: true, message: 'Lütfen API anahtarı için bir ad girin' }]}
            >
              <Input placeholder="Örn: Web Uygulaması, Mobile App, vb." />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Açıklama (İsteğe Bağlı)"
            >
              <TextArea rows={3} placeholder="Bu anahtarın ne için kullanılacağını açıklayın" />
            </Form.Item>
            
            <Form.Item
              name="scope"
              label="Erişim Kapsamı"
              rules={[{ required: true, message: 'Lütfen bir erişim kapsamı seçin' }]}
              initialValue="READ"
            >
              <Select>
                <Option value="READ">Okuma (Sadece veri okuma)</Option>
                <Option value="WRITE">Yazma (Veri okuma ve yazma)</Option>
                {isAdmin && (
                  <>
                    <Option value="ADMIN">Admin (Yönetim işlemleri)</Option>
                    <Option value="FULL">Tam Erişim (Tüm işlemler)</Option>
                  </>
                )}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="validity"
              label="Geçerlilik Süresi"
              extra="Boş bırakırsanız, anahtar süresiz olarak geçerli olacaktır"
            >
              <RangePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                disabledDate={current => current && current < moment().startOf('day')}
                placeholder={['Başlangıç', 'Bitiş']}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Alert
              message="API Anahtarı Güvenliği"
              description="API anahtarınız oluşturulduktan sonra size yalnızca bir kez gösterilecektir. Güvenli bir yere kaydettiğinizden emin olun. Eğer anahtarınızı kaybederseniz, yeni bir tane oluşturmanız gerekecektir."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <Form.Item style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={handleCloseModal}>
                  İptal
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Oluştur
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ApiKeyManager; 