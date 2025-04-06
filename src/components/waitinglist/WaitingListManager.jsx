import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Typography, Modal, message, Spin, Form, Radio, Select, Popconfirm, Tooltip, Alert, Badge } from 'antd';
import { SearchOutlined, UserAddOutlined, UserDeleteOutlined, MailOutlined, ExportOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { waitingListService } from '../../services';
import { getEventById } from '../../services/eventService';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Bekleme Listesi Yönetim Bileşeni
 * Etkinliklerin bekleme listesi katılımcılarını yönetir
 */
const WaitingListManager = ({ eventId, isAdmin = false }) => {
  const [waitingList, setWaitingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredList, setFilteredList] = useState([]);
  const [event, setEvent] = useState(null);
  const [addParticipantVisible, setAddParticipantVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [addForm] = Form.useForm();
  const [emailForm] = Form.useForm();
  
  // Bekleme listesi verilerini yükleme
  useEffect(() => {
    fetchData();
  }, [eventId]);
  
  // Filtreleme
  useEffect(() => {
    if (waitingList.length > 0) {
      const filtered = waitingList.filter(participant => {
        const searchContent = [
          participant.name,
          participant.email,
          participant.phone,
          participant.studentId,
          participant.department,
          participant.notes
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        return searchContent.includes(searchText.toLowerCase());
      });
      
      setFilteredList(filtered);
    }
  }, [searchText, waitingList]);
  
  // Verileri yükle
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Etkinlik bilgilerini ve bekleme listesini yükle
      const [eventData, waitingListData] = await Promise.all([
        getEventById(eventId),
        waitingListService.getWaitingList(eventId)
      ]);
      
      setEvent(eventData);
      setWaitingList(waitingListData || []);
      setFilteredList(waitingListData || []);
      setLoading(false);
    } catch (error) {
      console.error('Bekleme listesi yüklenirken hata oluştu:', error);
      setError('Bekleme listesi verileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // Durum etiketi
  const getStatusTag = (status) => {
    switch (status) {
      case 'WAITING':
        return <Tag color="blue">Beklemede</Tag>;
      case 'APPROVED':
        return <Tag color="green">Onaylandı</Tag>;
      case 'REJECTED':
        return <Tag color="red">Reddedildi</Tag>;
      case 'NOTIFIED':
        return <Tag color="purple">Bildirim Gönderildi</Tag>;
      case 'EXPIRED':
        return <Tag color="orange">Süresi Doldu</Tag>;
      default:
        return <Tag color="default">Bilinmiyor</Tag>;
    }
  };
  
  // Yeni katılımcı ekleme
  const handleAddParticipant = async (values) => {
    try {
      setLoading(true);
      
      const newParticipant = {
        ...values,
        eventId: eventId,
        status: 'WAITING',
        joinDate: new Date().toISOString()
      };
      
      const result = await waitingListService.addToWaitingList(newParticipant);
      
      if (result) {
        message.success('Katılımcı bekleme listesine eklendi');
        addForm.resetFields();
        setAddParticipantVisible(false);
        await fetchData();
      }
    } catch (error) {
      console.error('Katılımcı eklenirken hata oluştu:', error);
      message.error('Katılımcı eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Katılımcı onaylama
  const handleApprove = async (id) => {
    try {
      await waitingListService.updateStatus(id, 'APPROVED');
      message.success('Katılımcı onaylandı');
      await fetchData();
    } catch (error) {
      console.error('Katılımcı onaylanırken hata oluştu:', error);
      message.error('Katılımcı onaylanırken bir hata oluştu');
    }
  };
  
  // Katılımcı reddetme
  const handleReject = async (id) => {
    try {
      await waitingListService.updateStatus(id, 'REJECTED');
      message.success('Katılımcı reddedildi');
      await fetchData();
    } catch (error) {
      console.error('Katılımcı reddedilirken hata oluştu:', error);
      message.error('Katılımcı reddedilirken bir hata oluştu');
    }
  };
  
  // Katılımcı silme
  const handleDelete = async (id) => {
    try {
      await waitingListService.removeFromWaitingList(id);
      message.success('Katılımcı bekleme listesinden silindi');
      await fetchData();
    } catch (error) {
      console.error('Katılımcı silinirken hata oluştu:', error);
      message.error('Katılımcı silinirken bir hata oluştu');
    }
  };
  
  // Excel'e aktar
  const handleExportToExcel = () => {
    try {
      waitingListService.exportToExcel(eventId);
      message.success('Bekleme listesi Excel dosyasına aktarıldı');
    } catch (error) {
      console.error('Excel aktarımı sırasında hata oluştu:', error);
      message.error('Excel aktarımı sırasında bir hata oluştu');
    }
  };
  
  // Toplu e-posta gönderme
  const handleSendEmail = async (values) => {
    try {
      const { subject, message: emailMessage, recipientType } = values;
      
      let recipientIds = [];
      
      if (recipientType === 'selected') {
        recipientIds = selectedParticipants;
      } else if (recipientType === 'all') {
        recipientIds = waitingList.map(p => p.id);
      } else if (recipientType === 'waiting') {
        recipientIds = waitingList.filter(p => p.status === 'WAITING').map(p => p.id);
      } else if (recipientType === 'approved') {
        recipientIds = waitingList.filter(p => p.status === 'APPROVED').map(p => p.id);
      }
      
      if (recipientIds.length === 0) {
        message.warning('Seçili alıcı bulunamadı');
        return;
      }
      
      setLoading(true);
      
      await waitingListService.sendEmail({
        eventId,
        recipientIds,
        subject,
        message: emailMessage
      });
      
      message.success('E-posta başarıyla gönderildi');
      setEmailModalVisible(false);
      emailForm.resetFields();
      
      setLoading(false);
    } catch (error) {
      console.error('E-posta gönderilirken hata oluştu:', error);
      message.error('E-posta gönderilirken bir hata oluştu');
      setLoading(false);
    }
  };
  
  // Tablo sütunları
  const columns = [
    {
      title: 'Ad Soyad',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['md'],
    },
    {
      title: 'Bölüm',
      dataIndex: 'department',
      key: 'department',
      responsive: ['lg'],
    },
    {
      title: 'Katılma Tarihi',
      dataIndex: 'joinDate',
      key: 'joinDate',
      responsive: ['lg'],
      render: (date) => moment(date).format('LLL')
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'WAITING' && (
            <>
              <Tooltip title="Onayla">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
              
              <Tooltip title="Reddet">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleReject(record.id)}
                />
              </Tooltip>
            </>
          )}
          
          <Tooltip title="Sil">
            <Popconfirm
              title="Bu katılımcıyı silmek istediğinize emin misiniz?"
              onConfirm={() => handleDelete(record.id)}
              okText="Evet"
              cancelText="Hayır"
            >
              <Button
                size="small"
                icon={<UserDeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
          
          <Tooltip title="E-posta Gönder">
            <Button
              size="small"
              icon={<MailOutlined />}
              onClick={() => {
                setSelectedParticipants([record.id]);
                setEmailModalVisible(true);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  
  // Yükleniyor durumu
  if (loading && !waitingList.length) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Bekleme listesi yükleniyor...</div>
        </div>
      </Card>
    );
  }
  
  // Hata durumu
  if (error) {
    return (
      <Card>
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }
  
  return (
    <div className="waiting-list-manager">
      <Card
        title={
          <div>
            <Title level={4} style={{ margin: 0 }}>
              Bekleme Listesi 
              {event && <span> - {event.title}</span>}
            </Title>
            <Text type="secondary">
              Toplam: {waitingList.length} katılımcı
            </Text>
          </div>
        }
        extra={
          <Space>
            <Input
              placeholder="Ara..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              title="Yenile"
            />
            
            {isAdmin && (
              <>
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setAddParticipantVisible(true)}
                >
                  Katılımcı Ekle
                </Button>
                
                <Button
                  icon={<MailOutlined />}
                  onClick={() => {
                    setSelectedParticipants([]);
                    setEmailModalVisible(true);
                  }}
                >
                  E-posta
                </Button>
                
                <Button
                  icon={<ExportOutlined />}
                  onClick={handleExportToExcel}
                >
                  Excel
                </Button>
              </>
            )}
          </Space>
        }
      >
        {/* Durum Özeti */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            <Badge 
              count={waitingList.filter(p => p.status === 'WAITING').length} 
              showZero 
              style={{ backgroundColor: '#1890ff' }}
            >
              <Tag color="blue">Beklemede</Tag>
            </Badge>
            
            <Badge 
              count={waitingList.filter(p => p.status === 'APPROVED').length} 
              showZero 
              style={{ backgroundColor: '#52c41a' }}
            >
              <Tag color="green">Onaylandı</Tag>
            </Badge>
            
            <Badge 
              count={waitingList.filter(p => p.status === 'REJECTED').length} 
              showZero 
              style={{ backgroundColor: '#f5222d' }}
            >
              <Tag color="red">Reddedildi</Tag>
            </Badge>
            
            <Badge 
              count={waitingList.filter(p => p.status === 'NOTIFIED').length} 
              showZero 
              style={{ backgroundColor: '#722ed1' }}
            >
              <Tag color="purple">Bildirim Gönderildi</Tag>
            </Badge>
            
            <Badge 
              count={waitingList.filter(p => p.status === 'EXPIRED').length} 
              showZero 
              style={{ backgroundColor: '#fa8c16' }}
            >
              <Tag color="orange">Süresi Doldu</Tag>
            </Badge>
          </Space>
        </div>
        
        {/* Katılımcı Tablosu */}
        <Table
          columns={columns}
          dataSource={filteredList}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} katılımcı`
          }}
          rowSelection={isAdmin ? {
            onChange: (selectedRowKeys) => {
              setSelectedParticipants(selectedRowKeys);
            }
          } : null}
        />
      </Card>
      
      {/* Katılımcı Ekleme Modalı */}
      <Modal
        title="Bekleme Listesine Katılımcı Ekle"
        visible={addParticipantVisible}
        onCancel={() => setAddParticipantVisible(false)}
        footer={null}
        maskClosable={false}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleAddParticipant}
        >
          <Form.Item
            name="name"
            label="Ad Soyad"
            rules={[{ required: true, message: 'Lütfen ad soyad giriniz' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="E-posta"
            rules={[
              { required: true, message: 'Lütfen e-posta giriniz' },
              { type: 'email', message: 'Geçerli bir e-posta giriniz' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="Telefon"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="department"
            label="Bölüm"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="studentId"
            label="Öğrenci Numarası"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notlar"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setAddParticipantVisible(false)}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Ekle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* E-posta Modalı */}
      <Modal
        title="E-posta Gönder"
        visible={emailModalVisible}
        onCancel={() => setEmailModalVisible(false)}
        footer={null}
        maskClosable={false}
        width={600}
      >
        <Form
          form={emailForm}
          layout="vertical"
          onFinish={handleSendEmail}
        >
          <Form.Item
            name="recipientType"
            label="Alıcılar"
            initialValue={selectedParticipants.length > 0 ? 'selected' : 'all'}
          >
            <Radio.Group>
              {selectedParticipants.length > 0 && (
                <Radio value="selected">
                  Seçili Katılımcılar ({selectedParticipants.length})
                </Radio>
              )}
              <Radio value="all">Tüm Katılımcılar ({waitingList.length})</Radio>
              <Radio value="waiting">Beklemede Olanlar ({waitingList.filter(p => p.status === 'WAITING').length})</Radio>
              <Radio value="approved">Onaylanmış Olanlar ({waitingList.filter(p => p.status === 'APPROVED').length})</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="subject"
            label="Konu"
            rules={[{ required: true, message: 'Lütfen e-posta konusu giriniz' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="message"
            label="Mesaj"
            rules={[{ required: true, message: 'Lütfen e-posta mesajı giriniz' }]}
          >
            <Input.TextArea rows={8} />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEmailModalVisible(false)}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} icon={<MailOutlined />}>
                Gönder
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WaitingListManager; 