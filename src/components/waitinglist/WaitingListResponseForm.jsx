import React, { useState, useEffect } from 'react';
import { Form, Radio, Button, Alert, Card, Typography, Space, Divider, Result, Spin, Modal, Badge, Countdown } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { waitingListService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

/**
 * Bekleme Listesi Bildirim Yanıt Formu Bileşeni
 * Kullanıcıların boş kontenjan bildirimlerine yanıt vermelerini sağlar
 */
const WaitingListResponseForm = ({ 
  waitingListId, 
  eventId, 
  eventName, 
  userId, 
  notificationSent = false, 
  responseDeadline = null,
  onSuccess,
  onDecline
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState(null);
  const [waitingListData, setWaitingListData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [timeExpired, setTimeExpired] = useState(false);
  
  // Veri yükle
  const fetchData = async () => {
    try {
      setDataLoading(true);
      const data = await waitingListService.getWaitingListItemById(waitingListId);
      setWaitingListData(data);
      
      if (data && data.status === 'DECLINED') {
        setDeclined(true);
      } else if (data && data.status === 'ACCEPTED') {
        setSuccess(true);
      }
      
      // Süre kontrolü
      if (responseDeadline && moment().isAfter(moment(responseDeadline))) {
        setTimeExpired(true);
      }
      
      setDataLoading(false);
    } catch (error) {
      console.error('Bekleme listesi verisi yüklenirken hata oluştu:', error);
      setError('Bekleme listesi verisi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setDataLoading(false);
    }
  };
  
  // İlk yükleme
  useEffect(() => {
    fetchData();
  }, [waitingListId, eventId, userId]);
  
  // Form gönderme
  const handleSubmit = async (values) => {
    if (!notificationSent || timeExpired) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (values.response === 'accept') {
        await waitingListService.acceptInvitation(waitingListId);
        setSuccess(true);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Reddetmeyi onayla
        showConfirmDecline();
        setLoading(false);
        return;
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Yanıt gönderilirken hata oluştu:', error);
      setError('Yanıt gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // Reddetme onayı
  const showConfirmDecline = () => {
    confirm({
      title: 'Etkinliğe katılmayı reddetmek istediğinizden emin misiniz?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bu işlem geri alınamaz. Bekleme listesindeki sıranızı kaybedeceksiniz ve sıradaki kişiye hak tanınacaktır.',
      okText: 'Evet, Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          setLoading(true);
          await waitingListService.declineInvitation(waitingListId);
          setDeclined(true);
          
          if (onDecline) {
            onDecline();
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Davet reddedilirken hata oluştu:', error);
          setError('Davet reddedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
          setLoading(false);
        }
      },
    });
  };
  
  // Başarılı durumu göster
  if (success) {
    return (
      <Card>
        <Result
          status="success"
          title="Etkinliğe katılımınız onaylandı!"
          subTitle={`${eventName} etkinliğine katılımınız başarıyla onaylandı. Etkinlik detaylarını inceleyebilirsiniz.`}
          extra={[
            <Button type="primary" key="details" href={`/events/${eventId}`}>
              Etkinlik Detayları
            </Button>
          ]}
        />
      </Card>
    );
  }
  
  // Reddedilme durumu göster
  if (declined) {
    return (
      <Card>
        <Result
          status="info"
          title="Etkinliğe katılımı reddettiniz"
          subTitle={`${eventName} etkinliğine katılım davetini reddettiğiniz için bekleme listesinden çıkarıldınız.`}
          icon={<CloseCircleOutlined />}
        />
      </Card>
    );
  }
  
  // Zaman aşımı durumu
  if (timeExpired) {
    return (
      <Card>
        <Result
          status="warning"
          title="Yanıt süresi doldu"
          subTitle={`${eventName} etkinliği için yanıt süresi doldu. Yanıt vermediğiniz için sıranız sonraki kişiye geçti.`}
          icon={<ClockCircleOutlined />}
        />
      </Card>
    );
  }
  
  // Bildirim gönderilmemiş durumu
  if (!notificationSent) {
    return (
      <Card>
        <Result
          status="info"
          title="Henüz bildirim gönderilmedi"
          subTitle={`${eventName} etkinliği için henüz boş kontenjan bildirimi almadınız. Sıranız geldiğinde bilgilendirileceksiniz.`}
        />
      </Card>
    );
  }
  
  return (
    <Spin spinning={dataLoading}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>Etkinlik Katılım Daveti</Title>
          
          {responseDeadline && (
            <Badge 
              count={
                <Space>
                  <ClockCircleOutlined />
                  <Countdown 
                    value={moment(responseDeadline).valueOf()} 
                    format="DD gün HH:mm:ss" 
                    onFinish={() => setTimeExpired(true)}
                  />
                </Space>
              } 
              style={{ backgroundColor: '#faad14' }}
            />
          )}
        </div>
        
        <Alert
          message="Etkinlikte boş kontenjan bulunmaktadır"
          description={
            <div>
              <Paragraph>
                <Text strong>{eventName}</Text> etkinliğinde boş kontenjan açıldı ve bekleme listesindeki sıranıza göre size katılım hakkı tanındı.
              </Paragraph>
              <Paragraph>
                <Text type="warning">Lütfen yanıt süresinin dolmasını beklemeden kararınızı bildiriniz. Yanıt vermezseniz, hakkınız sıradaki kişiye geçecektir.</Text>
              </Paragraph>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        {error && (
          <Alert
            message="Hata"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: 16 }}
            onClose={() => setError(null)}
          />
        )}
        
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              response: 'accept'
            }}
          >
            <Form.Item
              name="response"
              label="Yanıtınız"
              rules={[{ required: true, message: 'Lütfen bir yanıt seçin' }]}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="accept">
                    <Space>
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      <Text strong>Etkinliğe katılmak istiyorum</Text>
                    </Space>
                    <div style={{ marginLeft: 24 }}>
                      <Text type="secondary">Etkinliğe katılımınız onaylanacak ve bekleme listesinden çıkarılacaksınız.</Text>
                    </div>
                  </Radio>
                  <Radio value="decline">
                    <Space>
                      <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                      <Text strong>Etkinliğe katılmak istemiyorum</Text>
                    </Space>
                    <div style={{ marginLeft: 24 }}>
                      <Text type="secondary">Bekleme listesinden çıkarılacaksınız ve sıradaki kişiye hak tanınacaktır.</Text>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            
            <Divider />
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                Yanıtı Gönder
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </Spin>
  );
};

export default WaitingListResponseForm; 