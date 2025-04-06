import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Tag, Statistic, Button, Space, Row, Col, Spin, Alert, Popconfirm, Badge, Progress } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, QuestionCircleOutlined, UserAddOutlined, ArrowUpOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { waitingListService } from '../../services';
import { getEventById } from '../../services/eventService';
import moment from 'moment';
import 'moment/locale/tr';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

/**
 * Bekleme Listesi Durum Bileşeni
 * Kullanıcının bir etkinlik için bekleme listesi durumunu gösterir
 */
const WaitingListStatus = ({ 
  eventId, 
  userId, 
  onLeaveWaitingList = null,
  onResponseToInvitation = null
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waitingListData, setWaitingListData] = useState(null);
  const [event, setEvent] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [responseLoading, setResponseLoading] = useState(false);
  
  // Verileri yükle
  useEffect(() => {
    fetchData();
  }, [eventId, userId]);
  
  // Bekleme listesi ve etkinlik verilerini yükle
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Bekleme listesi durumu ve etkinlik verilerini paralel olarak yükle
      const [statusData, eventData] = await Promise.all([
        waitingListService.getUserWaitingListStatus(eventId, userId),
        getEventById(eventId)
      ]);
      
      setWaitingListData(statusData);
      setEvent(eventData);
      setLoading(false);
    } catch (error) {
      console.error('Bekleme listesi durumu yüklenirken hata oluştu:', error);
      setError('Bekleme listesi durumu yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // Bekleme listesinden ayrıl
  const handleLeaveWaitingList = async () => {
    try {
      setLeaveLoading(true);
      
      await waitingListService.leaveWaitingList(eventId, userId);
      
      // Callback fonksiyonu varsa çağır
      if (onLeaveWaitingList) {
        onLeaveWaitingList();
      } else {
        // Yoksa verileri yeniden yükle
        await fetchData();
      }
      
      setLeaveLoading(false);
    } catch (error) {
      console.error('Bekleme listesinden ayrılırken hata oluştu:', error);
      setError('Bekleme listesinden ayrılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLeaveLoading(false);
    }
  };
  
  // Davete yanıt ver
  const handleResponseToInvitation = async (accepted) => {
    try {
      setResponseLoading(true);
      
      await waitingListService.respondToInvitation(eventId, userId, accepted);
      
      // Callback fonksiyonu varsa çağır
      if (onResponseToInvitation) {
        onResponseToInvitation(accepted);
      } else {
        // Yoksa verileri yeniden yükle
        await fetchData();
      }
      
      setResponseLoading(false);
    } catch (error) {
      console.error('Davete yanıt verirken hata oluştu:', error);
      setError('Davete yanıt verirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setResponseLoading(false);
    }
  };
  
  // Durum etiketi al
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
  
  // Kalan süre hesapla
  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    
    const deadlineDate = moment(deadline);
    const now = moment();
    
    if (now.isAfter(deadlineDate)) {
      return { expired: true, text: 'Süre doldu' };
    }
    
    const hours = deadlineDate.diff(now, 'hours');
    const minutes = deadlineDate.diff(now, 'minutes') % 60;
    
    return {
      expired: false,
      hours,
      minutes,
      text: `${hours} saat ${minutes} dakika`
    };
  };
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Bekleme listesi durumu yükleniyor...</div>
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
  
  // Bekleme listesinde değilse
  if (!waitingListData || !waitingListData.isOnWaitingList) {
    return (
      <Card>
        <Alert
          message="Bekleme listesinde değilsiniz"
          description={
            <Space direction="vertical">
              <Text>
                Bu etkinliğin bekleme listesinde bulunmuyorsunuz.
              </Text>
              {event && (
                <Link to={`/events/${eventId}/waitinglist/join`}>
                  <Button type="primary" icon={<UserAddOutlined />}>
                    Bekleme Listesine Katıl
                  </Button>
                </Link>
              )}
            </Space>
          }
          type="info"
          showIcon
        />
      </Card>
    );
  }
  
  // Kalan süre
  const timeRemaining = waitingListData.responseDeadline 
    ? getTimeRemaining(waitingListData.responseDeadline) 
    : null;
  
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>Bekleme Listesi Durumu</Title>
          {event && (
            <Link to={`/events/${eventId}`}>
              <Button type="link">{event.title}</Button>
            </Link>
          )}
        </div>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Descriptions title="Durum Bilgisi" bordered size="small" column={1}>
            <Descriptions.Item label="Durum">
              {getStatusTag(waitingListData.status)}
            </Descriptions.Item>
            
            <Descriptions.Item label="Katılma Tarihi">
              {moment(waitingListData.joinDate).format('LLL')}
            </Descriptions.Item>
            
            {waitingListData.position && (
              <Descriptions.Item label="Sıra">
                <Badge count={waitingListData.position} showZero style={{ backgroundColor: '#1890ff' }} />
              </Descriptions.Item>
            )}
            
            {waitingListData.notificationSent && (
              <Descriptions.Item label="Bildirim Tarihi">
                {moment(waitingListData.notificationDate).format('LLL')}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Col>
        
        <Col xs={24} sm={12} md={8}>
          {event && (
            <Descriptions title="Etkinlik Bilgisi" bordered size="small" column={1}>
              <Descriptions.Item label="Etkinlik">
                {event.title}
              </Descriptions.Item>
              
              <Descriptions.Item label="Tarih">
                {moment(event.startDate).format('LL')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Kapasite">
                {event.participantCount} / {event.capacity}
              </Descriptions.Item>
              
              <Descriptions.Item label="Bekleme Listesi">
                {waitingListData.totalInWaitingList || 0} kişi
              </Descriptions.Item>
            </Descriptions>
          )}
        </Col>
        
        <Col xs={24} md={8}>
          {waitingListData.status === 'NOTIFIED' && timeRemaining && (
            <Card 
              title="Etkinlik Davetiyesi" 
              className="invitation-card"
              bordered={true}
              style={{ backgroundColor: timeRemaining.expired ? '#fff2f0' : '#f6ffed' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  Boş kontenjan için davet aldınız!
                </Text>
                
                <Paragraph>
                  <Text>
                    Etkinliğe katılmak için yanıt vermelisiniz.
                  </Text>
                </Paragraph>
                
                {timeRemaining.expired ? (
                  <Alert 
                    message="Yanıt süresi doldu" 
                    description="Yanıt vermediğiniz için etkinlik hakkınız sıradaki kişiye geçmiş olabilir."
                    type="error" 
                    showIcon 
                    icon={<ClockCircleOutlined />}
                  />
                ) : (
                  <>
                    <Alert 
                      message="Kalan Süre" 
                      description={
                        <div>
                          <Progress 
                            percent={Math.round((timeRemaining.hours * 60 + timeRemaining.minutes) / (24 * 60) * 100)} 
                            status="active"
                            strokeColor={{
                              '0%': '#ff4d4f',
                              '100%': '#52c41a',
                            }}
                          />
                          <Text strong>{timeRemaining.text}</Text>
                        </div>
                      }
                      type="warning" 
                      showIcon 
                      icon={<ClockCircleOutlined />}
                    />
                    
                    <Space>
                      <Button 
                        type="primary" 
                        icon={<CheckCircleOutlined />} 
                        onClick={() => handleResponseToInvitation(true)}
                        loading={responseLoading}
                      >
                        Katılacağım
                      </Button>
                      
                      <Button 
                        danger 
                        icon={<CloseCircleOutlined />} 
                        onClick={() => handleResponseToInvitation(false)}
                        loading={responseLoading}
                      >
                        Katılamayacağım
                      </Button>
                    </Space>
                  </>
                )}
              </Space>
            </Card>
          )}
          
          {waitingListData.status === 'WAITING' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Space direction="vertical">
                <Statistic 
                  title="Bekleme Listesi Pozisyonu" 
                  value={waitingListData.position} 
                  prefix={<ArrowUpOutlined />} 
                  valueStyle={{ color: '#1890ff' }}
                />
                
                <Text type="secondary">
                  Etkinlikte boş kontenjan açıldığında bilgilendirileceksiniz.
                </Text>
              </Space>
            </div>
          )}
          
          {waitingListData.status === 'APPROVED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Space direction="vertical">
                <Alert
                  message="Katılımınız Onaylandı"
                  description="Etkinliğe katılımınız onaylanmıştır. Etkinlik bilgileri için e-posta adresinizi kontrol ediniz."
                  type="success"
                  showIcon
                  icon={<CheckCircleOutlined />}
                />
                
                <Link to={`/events/${eventId}`}>
                  <Button type="primary">
                    Etkinlik Detaylarını Görüntüle
                  </Button>
                </Link>
              </Space>
            </div>
          )}
          
          {waitingListData.status === 'REJECTED' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Alert
                message="Katılımınız Reddedildi"
                description="Etkinliğe katılım talebiniz reddedilmiştir."
                type="error"
                showIcon
                icon={<CloseCircleOutlined />}
              />
            </div>
          )}
        </Col>
      </Row>
      
      {waitingListData.status === 'WAITING' && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Popconfirm
            title="Bekleme listesinden ayrılmak istediğinize emin misiniz?"
            onConfirm={handleLeaveWaitingList}
            okText="Evet"
            cancelText="Hayır"
            icon={<QuestionCircleOutlined style={{ color: '#ff4d4f' }} />}
          >
            <Button 
              danger 
              icon={<UserDeleteOutlined />} 
              loading={leaveLoading}
            >
              Bekleme Listesinden Ayrıl
            </Button>
          </Popconfirm>
        </div>
      )}
    </Card>
  );
};

export default WaitingListStatus; 