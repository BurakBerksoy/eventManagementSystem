import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert, Card, Typography, Divider, Result, Spin, Modal, message, Checkbox, Space, Select } from 'antd';
import { UserAddOutlined, InfoCircleOutlined, CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { waitingListService } from '../../services';
import { getEventById } from '../../services/eventService';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

/**
 * Bekleme Listesine Katılma Formu
 * Kullanıcıların etkinlik bekleme listesine katılmasını sağlar
 */
const WaitingListJoinForm = ({ 
  eventId, 
  currentUser = null, 
  onSuccess = () => {},
  onCancel = null
}) => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [event, setEvent] = useState(null);
  const [isOnWaitingList, setIsOnWaitingList] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [form] = Form.useForm();
  
  // Etkinlik ve bekleme listesi durumunu yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Etkinlik bilgilerini yükle
        const eventData = await getEventById(eventId);
        setEvent(eventData);
        
        // Eğer kullanıcı zaten giriş yapmışsa bilgilerini form alanlarına doldur
        if (currentUser) {
          form.setFieldsValue({
            name: currentUser.name || currentUser.fullName,
            email: currentUser.email,
            phone: currentUser.phone,
            department: currentUser.department
          });
          
          // Kullanıcının bekleme listesinde olup olmadığını kontrol et
          const waitingListStatus = await waitingListService.checkWaitingListStatus(eventId, currentUser.id);
          setIsOnWaitingList(waitingListStatus.isOnWaitingList);
        }
        
        setInitialLoading(false);
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
        setError('Etkinlik bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [eventId, currentUser, form]);
  
  // Bekleme listesine katılma
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Bekleme listesi kaydı oluştur
      const waitingListEntry = {
        eventId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        department: values.department,
        studentId: values.studentId,
        notes: values.notes,
        userId: currentUser?.id, // Kullanıcı giriş yapmışsa ID'sini ekle
        joinDate: new Date().toISOString()
      };
      
      const result = await waitingListService.joinWaitingList(waitingListEntry);
      
      if (result) {
        message.success('Bekleme listesine başarıyla kaydoldunuz!');
        setJoinSuccess(true);
        onSuccess(result);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Bekleme listesine katılırken hata oluştu:', error);
      setError('Bekleme listesine katılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // İptal
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  // Yükleniyor durumu
  if (initialLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Bilgiler yükleniyor...</div>
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
          action={
            <Button size="small" onClick={handleCancel}>
              Geri Dön
            </Button>
          }
        />
      </Card>
    );
  }
  
  // Kullanıcı zaten bekleme listesindeyse
  if (isOnWaitingList) {
    return (
      <Card>
        <Result
          status="info"
          title="Zaten Bekleme Listesindesiniz"
          subTitle="Bu etkinlik için bekleme listesine daha önce kaydoldunuz."
          extra={[
            <Button key="back" onClick={handleCancel}>
              Geri Dön
            </Button>
          ]}
        />
      </Card>
    );
  }
  
  // Kayıt başarılı olduysa
  if (joinSuccess) {
    return (
      <Card>
        <Result
          status="success"
          title="Bekleme Listesine Kaydoldunuz!"
          subTitle="Etkinlikte yer açıldığında size bildirim gönderilecektir."
          extra={[
            <Button key="back" onClick={handleCancel}>
              Tamam
            </Button>
          ]}
        />
      </Card>
    );
  }
  
  return (
    <Card>
      <Title level={4}>Bekleme Listesine Katıl</Title>
      
      {event && (
        <div style={{ marginBottom: 16 }}>
          <Paragraph>
            <Text strong>{event.title}</Text> etkinliği için bekleme listesine katılmak üzeresiniz.
          </Paragraph>
          
          <Alert
            message="Bekleme Listesi Hakkında"
            description="Etkinlik kontenjanı dolduğunda, bekleme listesine kaydolan kullanıcılar sırayla bilgilendirilir. Yer açıldığında size e-posta ile bildirim gönderilecektir."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 16 }}
          />
        </div>
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Ad Soyad"
          rules={[{ required: true, message: 'Lütfen adınızı ve soyadınızı giriniz' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          name="email"
          label="E-posta"
          rules={[
            { required: true, message: 'Lütfen e-posta adresinizi giriniz' },
            { type: 'email', message: 'Geçerli bir e-posta adresi giriniz' }
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
          label="Notlar (İsteğe Bağlı)"
        >
          <Input.TextArea rows={4} placeholder="Eklemek istediğiniz notlar..." />
        </Form.Item>
        
        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            { 
              validator: (_, value) => 
                value ? Promise.resolve() : Promise.reject(new Error('Devam etmek için kabul etmelisiniz'))
            }
          ]}
        >
          <Checkbox>
            Etkinlik bekleme listesine katılarak bildirim almayı ve kişisel bilgilerimin saklanmasını kabul ediyorum.
          </Checkbox>
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<UserAddOutlined />}
            >
              Bekleme Listesine Katıl
            </Button>
            
            {onCancel && (
              <Button onClick={handleCancel}>
                İptal
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default WaitingListJoinForm; 