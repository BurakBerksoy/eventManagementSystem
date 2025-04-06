import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Space, Tag, Typography, Modal, message, Spin, Form, Select, Switch, Alert, Popconfirm, Tooltip, Badge, Collapse, Tabs } from 'antd';
import { PlusOutlined, ReloadOutlined, DeleteOutlined, EditOutlined, EyeOutlined, BellOutlined, ClockCircleOutlined, ApiOutlined, HistoryOutlined, CodeOutlined } from '@ant-design/icons';
import { webhookService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';
import ReactJson from 'react-json-view';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { TabPane } = Tabs;

/**
 * Webhook Yönetim Bileşeni
 * Kullanıcının webhook'ları yönetmesini sağlar
 */
const WebhookManager = ({ isAdmin = false }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWebhook, setCurrentWebhook] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);

  // Webhook'ları yükle
  useEffect(() => {
    fetchWebhooks();
  }, []);

  // Webhook'ları getir
  const fetchWebhooks = async () => {
    try {
      setLoading(true);

      // Kullanıcı rolüne göre webhook'ları getir
      const webhookData = isAdmin
        ? await webhookService.getAllWebhooks()
        : await webhookService.getUserWebhooks();

      setWebhooks(webhookData);
      setLoading(false);
    } catch (error) {
      console.error('Webhook verileri yüklenirken hata oluştu:', error);
      setError('Webhook verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  // Webhook geçmişini yükle
  const fetchWebhookHistory = async (webhookId) => {
    try {
      setHistoryLoading(true);
      const history = await webhookService.getWebhookDeliveryHistory(webhookId);
      setDeliveryHistory(history);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Webhook geçmişi yüklenirken hata oluştu:', error);
      message.error('Webhook geçmişi yüklenirken bir hata oluştu');
      setHistoryLoading(false);
    }
  };

  // Yeni webhook oluştur
  const handleCreateWebhook = async (values) => {
    try {
      setLoading(true);

      const webhookData = {
        ...values,
        active: values.active || false
      };

      let result;

      if (editMode && currentWebhook) {
        result = await webhookService.updateWebhook(currentWebhook.id, webhookData);
        message.success('Webhook başarıyla güncellendi');
      } else {
        result = await webhookService.createWebhook(webhookData);
        message.success('Webhook başarıyla oluşturuldu');
      }

      if (result) {
        resetFormAndState();
        await fetchWebhooks();
      }

      setLoading(false);
    } catch (error) {
      console.error('Webhook kaydedilirken hata oluştu:', error);
      message.error('Webhook kaydedilirken bir hata oluştu');
      setLoading(false);
    }
  };

  // Webhook sil
  const handleDeleteWebhook = async (webhookId) => {
    try {
      await webhookService.deleteWebhook(webhookId);
      message.success('Webhook başarıyla silindi');
      
      // Listeyi güncelle
      await fetchWebhooks();
    } catch (error) {
      console.error('Webhook silinirken hata oluştu:', error);
      message.error('Webhook silinirken bir hata oluştu');
    }
  };

  // Webhook aktif/pasif durumunu değiştir
  const handleToggleStatus = async (webhookId, currentStatus) => {
    try {
      await webhookService.updateWebhookStatus(webhookId, !currentStatus);
      message.success(`Webhook ${!currentStatus ? 'aktifleştirildi' : 'devre dışı bırakıldı'}`);
      
      // Listeyi güncelle
      await fetchWebhooks();
    } catch (error) {
      console.error('Webhook durumu güncellenirken hata oluştu:', error);
      message.error('Webhook durumu güncellenirken bir hata oluştu');
    }
  };

  // Webhook test 
  const handleTestWebhook = async (webhookId) => {
    try {
      await webhookService.testWebhook(webhookId);
      message.success('Test isteği gönderildi');
      await fetchWebhookHistory(webhookId);
    } catch (error) {
      console.error('Webhook test edilirken hata oluştu:', error);
      message.error('Webhook test edilirken bir hata oluştu');
    }
  };

  // Form ve durum sıfırlama
  const resetFormAndState = () => {
    setModalVisible(false);
    setEditMode(false);
    setCurrentWebhook(null);
    form.resetFields();
  };

  // Düzenleme modalını aç
  const openEditModal = (webhook) => {
    setCurrentWebhook(webhook);
    setEditMode(true);
    
    form.setFieldsValue({
      name: webhook.name,
      url: webhook.url,
      description: webhook.description,
      events: webhook.events,
      active: webhook.active,
      secretKey: webhook.secretKey || '',
      headers: webhook.headers ? JSON.stringify(webhook.headers) : '{}',
      retryCount: webhook.retryCount || 3
    });
    
    setModalVisible(true);
  };

  // Tarih formatı
  const formatDate = (date) => {
    return moment(date).format('LLL');
  };

  // Webhook olay türü etiketi
  const getEventTypeTag = (event) => {
    switch (event) {
      case 'EVENT_CREATED':
        return <Tag color="green">Etkinlik Oluşturuldu</Tag>;
      case 'EVENT_UPDATED':
        return <Tag color="blue">Etkinlik Güncellendi</Tag>;
      case 'EVENT_CANCELED':
        return <Tag color="red">Etkinlik İptal Edildi</Tag>;
      case 'PARTICIPANT_REGISTERED':
        return <Tag color="purple">Katılımcı Kaydoldu</Tag>;
      case 'PARTICIPANT_CANCELED':
        return <Tag color="orange">Katılımcı İptal Etti</Tag>;
      case 'CERTIFICATE_ISSUED':
        return <Tag color="cyan">Sertifika Verildi</Tag>;
      case 'PAYMENT_COMPLETED':
        return <Tag color="gold">Ödeme Tamamlandı</Tag>;
      default:
        return <Tag>{event}</Tag>;
    }
  };

  // İstek durum etiketi
  const getStatusTag = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <Tag color="green">Başarılı</Tag>;
      case 'FAILED':
        return <Tag color="red">Başarısız</Tag>;
      case 'PENDING':
        return <Tag color="orange">Bekliyor</Tag>;
      case 'RETRYING':
        return <Tag color="gold">Yeniden Deneniyor</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // Webhook durum etiketi
  const getWebhookStatusTag = (active) => {
    return active 
      ? <Tag color="green">Aktif</Tag> 
      : <Tag color="red">Pasif</Tag>;
  };

  // Delivery detaylarını görüntüle
  const viewDeliveryDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setDeliveryModalVisible(true);
  };

  // HTTP koduna göre renk
  const getHttpStatusColor = (code) => {
    if (!code) return 'gray';
    if (code < 300) return 'green';
    if (code < 400) return 'gold';
    return 'red';
  };

  // Filtreleme
  const getFilteredWebhooks = () => {
    if (!searchText) return webhooks;
    
    return webhooks.filter(webhook => 
      webhook.name.toLowerCase().includes(searchText.toLowerCase()) ||
      webhook.url.toLowerCase().includes(searchText.toLowerCase()) ||
      (webhook.description && webhook.description.toLowerCase().includes(searchText.toLowerCase()))
    );
  };

  // Webhook tablosu sütunları
  const columns = [
    {
      title: 'Webhook',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Space>
            <ApiOutlined />
            <Text strong>{record.name}</Text>
            {getWebhookStatusTag(record.active)}
          </Space>
          <Text copyable type="secondary">{record.url}</Text>
          {record.description && (
            <Text type="secondary">{record.description}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Olaylar',
      dataIndex: 'events',
      key: 'events',
      render: events => (
        <Space wrap>
          {events && events.map(event => (
            <span key={event}>{getEventTypeTag(event)}</span>
          ))}
        </Space>
      ),
    },
    {
      title: 'Son Bildirim',
      dataIndex: 'lastDelivery',
      key: 'lastDelivery',
      render: (lastDelivery, record) => {
        if (!lastDelivery) {
          return <Text type="secondary">Hiç çağrılmadı</Text>;
        }
        
        return (
          <Space direction="vertical" size="small">
            <Space>
              {getStatusTag(lastDelivery.status)}
              {lastDelivery.httpStatus && (
                <Tag color={getHttpStatusColor(lastDelivery.httpStatus)}>
                  HTTP {lastDelivery.httpStatus}
                </Tag>
              )}
            </Space>
            <Text type="secondary">{formatDate(lastDelivery.deliveryTime)}</Text>
          </Space>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.active ? "Devre Dışı Bırak" : "Etkinleştir"}>
            <Switch
              checked={record.active}
              onChange={() => handleToggleStatus(record.id, record.active)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Test Gönder">
            <Button
              type="text"
              icon={<BellOutlined />}
              onClick={() => handleTestWebhook(record.id)}
            />
          </Tooltip>
          
          <Tooltip title="Geçmiş">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => {
                fetchWebhookHistory(record.id);
                setHistoryModalVisible(true);
              }}
            />
          </Tooltip>
          
          <Tooltip title="Sil">
            <Popconfirm
              title="Bu webhook'u silmek istediğinize emin misiniz?"
              onConfirm={() => handleDeleteWebhook(record.id)}
              okText="Evet"
              cancelText="Hayır"
              okButtonProps={{ danger: true }}
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

  // Geçmiş tablosu sütunları
  const historyColumns = [
    {
      title: 'Olay',
      dataIndex: 'eventType',
      key: 'eventType',
      render: eventType => getEventTypeTag(eventType),
    },
    {
      title: 'Tarih',
      dataIndex: 'deliveryTime',
      key: 'deliveryTime',
      render: date => formatDate(date),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: status => getStatusTag(status),
    },
    {
      title: 'HTTP',
      dataIndex: 'httpStatus',
      key: 'httpStatus',
      render: httpStatus => httpStatus ? (
        <Tag color={getHttpStatusColor(httpStatus)}>
          HTTP {httpStatus}
        </Tag>
      ) : '-',
    },
    {
      title: 'Süre',
      dataIndex: 'duration',
      key: 'duration',
      render: duration => duration ? `${duration} ms` : '-',
    },
    {
      title: 'Deneme',
      dataIndex: 'attemptCount',
      key: 'attemptCount',
      render: (attemptCount, record) => {
        if (!record.maxAttempts) return attemptCount || 1;
        return `${attemptCount || 1}/${record.maxAttempts}`;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => viewDeliveryDetails(record)}
        />
      ),
    },
  ];

  return (
    <div className="webhook-manager">
      <Card
        title={<Title level={4}>Webhook Yönetimi</Title>}
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
              onClick={fetchWebhooks}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditMode(false);
                setCurrentWebhook(null);
                form.resetFields();
                form.setFieldsValue({
                  active: true,
                  retryCount: 3,
                  headers: '{}'
                });
                setModalVisible(true);
              }}
            >
              Yeni Webhook
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
          dataSource={getFilteredWebhooks()}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
        
        {webhooks.length === 0 && !loading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Paragraph type="secondary">
              Henüz webhook oluşturulmamış. "Yeni Webhook" butonuna tıklayarak webhook oluşturabilirsiniz.
            </Paragraph>
          </div>
        )}
      </Card>
      
      {/* Webhook Oluşturma/Düzenleme Modal */}
      <Modal
        title={editMode ? "Webhook Düzenle" : "Yeni Webhook Oluştur"}
        open={modalVisible}
        onCancel={resetFormAndState}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateWebhook}
        >
          <Form.Item
            name="name"
            label="Webhook Adı"
            rules={[{ required: true, message: 'Lütfen webhook için bir ad girin' }]}
          >
            <Input placeholder="Örn: Etkinlik Bildirimleri, CRM Entegrasyonu, vb." />
          </Form.Item>
          
          <Form.Item
            name="url"
            label="Webhook URL"
            rules={[
              { required: true, message: 'Lütfen webhook URL adresi girin' },
              { type: 'url', message: 'Geçerli bir URL adresi girin' }
            ]}
          >
            <Input placeholder="https://api.example.com/webhooks/events" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Açıklama (İsteğe Bağlı)"
          >
            <TextArea rows={2} placeholder="Bu webhook'un amacını ve ne için kullanıldığını açıklayın" />
          </Form.Item>
          
          <Form.Item
            name="events"
            label="İzlenecek Olaylar"
            rules={[{ required: true, message: 'En az bir olay seçmelisiniz' }]}
          >
            <Select
              mode="multiple"
              placeholder="Bildirim gönderilecek olayları seçin"
              optionLabelProp="label"
            >
              <Option value="EVENT_CREATED" label="Etkinlik Oluşturuldu">
                {getEventTypeTag('EVENT_CREATED')} - Yeni etkinlik oluşturulduğunda
              </Option>
              <Option value="EVENT_UPDATED" label="Etkinlik Güncellendi">
                {getEventTypeTag('EVENT_UPDATED')} - Etkinlik güncellendiğinde
              </Option>
              <Option value="EVENT_CANCELED" label="Etkinlik İptal Edildi">
                {getEventTypeTag('EVENT_CANCELED')} - Etkinlik iptal edildiğinde
              </Option>
              <Option value="PARTICIPANT_REGISTERED" label="Katılımcı Kaydoldu">
                {getEventTypeTag('PARTICIPANT_REGISTERED')} - Yeni katılımcı kaydolduğunda
              </Option>
              <Option value="PARTICIPANT_CANCELED" label="Katılımcı İptal Etti">
                {getEventTypeTag('PARTICIPANT_CANCELED')} - Katılımcı katılımını iptal ettiğinde
              </Option>
              <Option value="CERTIFICATE_ISSUED" label="Sertifika Verildi">
                {getEventTypeTag('CERTIFICATE_ISSUED')} - Sertifika verildiğinde
              </Option>
              <Option value="PAYMENT_COMPLETED" label="Ödeme Tamamlandı">
                {getEventTypeTag('PAYMENT_COMPLETED')} - Ödeme tamamlandığında
              </Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="active"
            label="Durum"
            valuePropName="checked"
          >
            <Switch 
              checkedChildren="Aktif" 
              unCheckedChildren="Pasif" 
            />
          </Form.Item>
          
          <Collapse ghost>
            <Panel header="Gelişmiş Ayarlar" key="1">
              <Form.Item
                name="secretKey"
                label="Güvenlik Anahtarı (Secret)"
                tooltip="İmzalama ve doğrulama için kullanılacak gizli anahtar"
              >
                <Input.Password placeholder="Güvenlik anahtarını girin (isteğe bağlı)" />
              </Form.Item>
              
              <Form.Item
                name="headers"
                label="Özel HTTP Başlıkları"
                tooltip="İsteğe gönderilecek özel HTTP başlıkları (JSON formatında)"
                rules={[
                  {
                    validator: async (_, value) => {
                      if (!value) return Promise.resolve();
                      try {
                        JSON.parse(value);
                        return Promise.resolve();
                      } catch (e) {
                        return Promise.reject(new Error('Geçerli bir JSON formatı girilmelidir'));
                      }
                    }
                  }
                ]}
              >
                <TextArea 
                  rows={3} 
                  placeholder='{"X-Custom-Header": "Value", "Authorization": "Bearer token"}'
                />
              </Form.Item>
              
              <Form.Item
                name="retryCount"
                label="Yeniden Deneme Sayısı"
                tooltip="Başarısız istekler için maksimum yeniden deneme sayısı"
                initialValue={3}
              >
                <Select>
                  <Option value={0}>Yeniden deneme</Option>
                  <Option value={1}>1 kez</Option>
                  <Option value={3}>3 kez</Option>
                  <Option value={5}>5 kez</Option>
                  <Option value={10}>10 kez</Option>
                </Select>
              </Form.Item>
            </Panel>
          </Collapse>
          
          <Alert
            message="Webhook Bilgilendirme"
            description={
              <ul>
                <li>Webhook'lar, seçtiğiniz olaylar gerçekleştiğinde belirttiğiniz URL'ye HTTP POST isteği gönderir.</li>
                <li>İstek gövdesi, olay tipi, kaynak ID'si ve olay verilerini içerir.</li>
                <li>Güvenlik anahtarı tanımlarsanız, her istekte X-Webhook-Signature başlığı gönderilir.</li>
                <li>Alıcı servisin, 2xx durum kodu döndürmesi gerekir, aksi halde istek başarısız sayılacaktır.</li>
              </ul>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={resetFormAndState}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editMode ? 'Güncelle' : 'Oluştur'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Geçmiş Modalı */}
      <Modal
        title="Webhook İletim Geçmişi"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={900}
      >
        <Table
          columns={historyColumns}
          dataSource={deliveryHistory}
          rowKey="id"
          loading={historyLoading}
          pagination={{
            pageSize: 5,
            showTotal: (total) => `Toplam ${total} kayıt`
          }}
        />
        
        {deliveryHistory.length === 0 && !historyLoading && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Text type="secondary">
              Bu webhook için geçmiş bilgisi bulunamadı.
            </Text>
          </div>
        )}
      </Modal>
      
      {/* İletim Detay Modalı */}
      <Modal
        title="İletim Detayları"
        open={deliveryModalVisible}
        onCancel={() => setDeliveryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDeliveryModalVisible(false)}>
            Kapat
          </Button>
        ]}
        width={800}
      >
        {selectedDelivery && (
          <Tabs defaultActiveKey="1">
            <TabPane tab="Genel Bilgiler" key="1">
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="Olay Tipi">
                  {getEventTypeTag(selectedDelivery.eventType)}
                </Descriptions.Item>
                <Descriptions.Item label="İletim Tarihi">
                  {formatDate(selectedDelivery.deliveryTime)}
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  {getStatusTag(selectedDelivery.status)}
                </Descriptions.Item>
                <Descriptions.Item label="HTTP Durum Kodu">
                  {selectedDelivery.httpStatus 
                    ? <Tag color={getHttpStatusColor(selectedDelivery.httpStatus)}>HTTP {selectedDelivery.httpStatus}</Tag> 
                    : '-'
                  }
                </Descriptions.Item>
                <Descriptions.Item label="İşlem Süresi">
                  {selectedDelivery.duration ? `${selectedDelivery.duration} ms` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Deneme Sayısı">
                  {selectedDelivery.attemptCount || 1} / {selectedDelivery.maxAttempts || 1}
                </Descriptions.Item>
                {selectedDelivery.errorMessage && (
                  <Descriptions.Item label="Hata Mesajı">
                    <Text type="danger">{selectedDelivery.errorMessage}</Text>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </TabPane>
            
            <TabPane tab="İstek" key="2">
              <div style={{ marginBottom: 16 }}>
                <Text strong>İstek URL:</Text>
                <div>
                  <Text code copyable>{selectedDelivery.requestUrl || '-'}</Text>
                </div>
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Text strong>İstek Başlıkları:</Text>
                {selectedDelivery.requestHeaders ? (
                  <ReactJson 
                    src={selectedDelivery.requestHeaders} 
                    name={false} 
                    collapsed={1} 
                    displayDataTypes={false}
                    theme="rjv-default"
                  />
                ) : (
                  <Text type="secondary">Başlık bilgisi yok</Text>
                )}
              </div>
              
              <div>
                <Text strong>İstek Gövdesi:</Text>
                {selectedDelivery.payload ? (
                  <ReactJson 
                    src={typeof selectedDelivery.payload === 'string' 
                      ? JSON.parse(selectedDelivery.payload) 
                      : selectedDelivery.payload
                    } 
                    name={false} 
                    collapsed={1} 
                    displayDataTypes={false}
                    theme="rjv-default"
                  />
                ) : (
                  <Text type="secondary">Gövde bilgisi yok</Text>
                )}
              </div>
            </TabPane>
            
            <TabPane tab="Yanıt" key="3">
              {selectedDelivery.responseHeaders && (
                <div style={{ marginBottom: 16 }}>
                  <Text strong>Yanıt Başlıkları:</Text>
                  <ReactJson 
                    src={selectedDelivery.responseHeaders} 
                    name={false} 
                    collapsed={1} 
                    displayDataTypes={false}
                    theme="rjv-default"
                  />
                </div>
              )}
              
              <div>
                <Text strong>Yanıt Gövdesi:</Text>
                {selectedDelivery.responseBody ? (
                  <ReactJson 
                    src={
                      typeof selectedDelivery.responseBody === 'string' 
                        ? (
                          (() => {
                            try {
                              return JSON.parse(selectedDelivery.responseBody);
                            } catch (e) {
                              return { text: selectedDelivery.responseBody };
                            }
                          })()
                        ) 
                        : selectedDelivery.responseBody
                    } 
                    name={false} 
                    collapsed={1} 
                    displayDataTypes={false}
                    theme="rjv-default"
                  />
                ) : (
                  <Text type="secondary">Yanıt gövdesi yok veya metin formatında değil</Text>
                )}
              </div>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};

export default WebhookManager; 