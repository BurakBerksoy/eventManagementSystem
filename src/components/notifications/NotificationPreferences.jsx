import React, { useState, useEffect } from 'react';
import { Card, Form, Switch, Button, Alert, Divider, Typography, Skeleton, Collapse, TimePicker, Select, Space } from 'antd';
import { BellOutlined, MailOutlined, MobileOutlined, CalendarOutlined, TeamOutlined, TrophyOutlined, UserOutlined } from '@ant-design/icons';
import { notificationService } from '../../services';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

/**
 * Bildirim Tercihleri Bileşeni
 * Kullanıcının bildirim ayarlarını yönetir
 */
const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [form] = Form.useForm();

  // Bildirim tercihlerini yükle
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const data = await notificationService.getNotificationPreferences();
        setPreferences(data);
        form.setFieldsValue({
          ...data,
          quietHoursStart: data.quietHoursStart ? dayjs(data.quietHoursStart, 'HH:mm') : null,
          quietHoursEnd: data.quietHoursEnd ? dayjs(data.quietHoursEnd, 'HH:mm') : null
        });
        setLoading(false);
      } catch (error) {
        console.error('Bildirim tercihleri yüklenirken hata oluştu:', error);
        setError('Bildirim tercihleri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [form]);

  // Bildirim tercihlerini güncelle
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      // Zaman değerlerini formatlama
      const formattedValues = {
        ...values,
        quietHoursStart: values.quietHoursStart ? values.quietHoursStart.format('HH:mm') : null,
        quietHoursEnd: values.quietHoursEnd ? values.quietHoursEnd.format('HH:mm') : null
      };

      await notificationService.updateNotificationPreferences(formattedValues);
      
      setPreferences(formattedValues);
      setSuccess(true);
      setSubmitting(false);
    } catch (error) {
      console.error('Bildirim tercihleri güncellenirken hata oluştu:', error);
      setError('Bildirim tercihleri güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setSubmitting(false);
    }
  };

  // Tüm bildirimleri kapat/aç
  const handleToggleAll = (checked) => {
    form.setFieldsValue({
      emailNotifications: checked,
      pushNotifications: checked,
      eventReminders: checked,
      clubAnnouncements: checked,
      membershipUpdates: checked,
      certificateNotifications: checked,
      systemAnnouncements: checked
    });
  };

  return (
    <Card title={<Title level={4}>Bildirim Tercihleri</Title>}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 10 }} />
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            emailNotifications: true,
            pushNotifications: true,
            eventReminders: true,
            clubAnnouncements: true,
            membershipUpdates: true,
            certificateNotifications: true,
            systemAnnouncements: true,
            reminderTime: '24',
            notificationFrequency: 'instant'
          }}
        >
          {error && (
            <Alert
              message="Hata"
              description={error}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => setError(null)}
            />
          )}

          {success && (
            <Alert
              message="Başarılı"
              description="Bildirim tercihleriniz başarıyla güncellendi."
              type="success"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => setSuccess(false)}
            />
          )}

          <div style={{ marginBottom: 24 }}>
            <Space>
              <Text strong>Tüm Bildirimleri Aç/Kapat:</Text>
              <Switch
                checked={
                  form.getFieldValue('emailNotifications') &&
                  form.getFieldValue('pushNotifications') &&
                  form.getFieldValue('eventReminders') &&
                  form.getFieldValue('clubAnnouncements') &&
                  form.getFieldValue('membershipUpdates') &&
                  form.getFieldValue('certificateNotifications') &&
                  form.getFieldValue('systemAnnouncements')
                }
                onChange={handleToggleAll}
              />
            </Space>
          </div>

          <Divider orientation="left">Bildirim Kanalları</Divider>

          <Form.Item
            name="emailNotifications"
            label={<Space><MailOutlined /> E-posta Bildirimleri</Space>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="pushNotifications"
            label={<Space><BellOutlined /> Anlık Bildirimler</Space>}
            valuePropName="checked"
            extra="Tarayıcı ve mobil bildirimleri"
          >
            <Switch />
          </Form.Item>

          <Divider orientation="left">Bildirim Türleri</Divider>

          <Form.Item
            name="eventReminders"
            label={<Space><CalendarOutlined /> Etkinlik Hatırlatmaları</Space>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="clubAnnouncements"
            label={<Space><TeamOutlined /> Kulüp Duyuruları</Space>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="membershipUpdates"
            label={<Space><UserOutlined /> Üyelik Güncellemeleri</Space>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="certificateNotifications"
            label={<Space><TrophyOutlined /> Sertifika Bildirimleri</Space>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="systemAnnouncements"
            label={<Space><BellOutlined /> Sistem Duyuruları</Space>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Collapse ghost style={{ marginBottom: 24 }}>
            <Panel header="Gelişmiş Ayarlar" key="1">
              <Form.Item
                name="reminderTime"
                label="Etkinlik Hatırlatmaları"
                extra="Etkinlikler başlamadan ne kadar önce hatırlatma gönderilsin"
              >
                <Select>
                  <Option value="1">1 saat önce</Option>
                  <Option value="3">3 saat önce</Option>
                  <Option value="12">12 saat önce</Option>
                  <Option value="24">1 gün önce</Option>
                  <Option value="48">2 gün önce</Option>
                  <Option value="168">1 hafta önce</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notificationFrequency"
                label="Bildirim Sıklığı"
              >
                <Select>
                  <Option value="instant">Anlık (her bildirim anında gönderilir)</Option>
                  <Option value="hourly">Saatlik Özet</Option>
                  <Option value="daily">Günlük Özet</Option>
                  <Option value="weekly">Haftalık Özet</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Sessiz Saatler">
                <Paragraph type="secondary">
                  Bu saatler arasında bildirim almak istemiyorsanız başlangıç ve bitiş saati belirleyin.
                </Paragraph>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Form.Item name="quietHoursEnabled" valuePropName="checked" noStyle>
                    <Switch />
                  </Form.Item>
                  <span style={{ marginLeft: 8, marginRight: 16 }}>Sessiz saatler:</span>
                  <Form.Item
                    name="quietHoursStart"
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.quietHoursEnabled !== curValues.quietHoursEnabled
                    }
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Başlangıç"
                      disabled={!form.getFieldValue('quietHoursEnabled')}
                      style={{ marginRight: 8 }}
                    />
                  </Form.Item>
                  <span style={{ marginRight: 8 }}>-</span>
                  <Form.Item
                    name="quietHoursEnd"
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                      prevValues.quietHoursEnabled !== curValues.quietHoursEnabled
                    }
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Bitiş"
                      disabled={!form.getFieldValue('quietHoursEnabled')}
                    />
                  </Form.Item>
                </div>
              </Form.Item>
            </Panel>
          </Collapse>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              style={{ marginRight: 8 }}
            >
              Kaydet
            </Button>
            <Button onClick={() => form.resetFields()}>
              Sıfırla
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default NotificationPreferences; 