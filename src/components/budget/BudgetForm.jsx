import React, { useState, useEffect } from 'react';
import { Form, Input, Select, InputNumber, DatePicker, Button, Card, Typography, Row, Col, Divider, Upload, Alert, Space, message, Spin } from 'antd';
import { UploadOutlined, PlusOutlined, MinusCircleOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { budgetService } from '../../services';
import { getAllClubs } from '../../services/clubService';
import { getAllEvents } from '../../services/eventService';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

/**
 * Bütçe Form Bileşeni
 * Yeni bütçe oluşturma veya mevcut bütçeyi düzenleme
 */
const BudgetForm = ({ 
  budgetId = null, 
  clubId = null, 
  eventId = null,
  onSuccess = null,
  onCancel = null
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);
  const [budget, setBudget] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [fileList, setFileList] = useState([]);
  
  // İlk yükleme
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Kulüpleri yükle
        const clubsData = await getAllClubs();
        setClubs(clubsData);
        
        // Etkinlikleri yükle
        const eventsData = await getAllEvents();
        setEvents(eventsData);
        
        // Eğer düzenleme modundaysa bütçeyi yükle
        if (budgetId) {
          const budgetData = await budgetService.getBudgetById(budgetId);
          setBudget(budgetData);
          
          // Form alanlarını doldur
          form.setFieldsValue({
            title: budgetData.title,
            type: budgetData.type,
            category: budgetData.category,
            totalAmount: budgetData.totalAmount,
            description: budgetData.description,
            reference: budgetData.reference,
            startDate: budgetData.startDate ? moment(budgetData.startDate) : null,
            endDate: budgetData.endDate ? moment(budgetData.endDate) : null,
            clubId: budgetData.clubId || clubId,
            eventId: budgetData.eventId || eventId,
            items: budgetData.items || [],
            notes: budgetData.notes
          });
          
          // Dosyaları yükle
          if (budgetData.attachments && budgetData.attachments.length > 0) {
            const files = budgetData.attachments.map((attachment, index) => ({
              uid: `-${index + 1}`,
              name: attachment.fileName || `dosya-${index + 1}`,
              status: 'done',
              url: attachment.fileUrl,
              response: {
                fileId: attachment.id,
                fileUrl: attachment.fileUrl
              }
            }));
            
            setFileList(files);
          }
        } else {
          // Yeni bütçe oluşturma modunda
          form.setFieldsValue({
            type: clubId ? 'CLUB' : eventId ? 'EVENT' : 'OTHER',
            clubId: clubId,
            eventId: eventId,
            startDate: moment(),
            items: [{}]
          });
        }
        
        setInitialLoading(false);
      } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        setError('Gerekli veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setInitialLoading(false);
      }
    };
    
    fetchData();
  }, [budgetId, clubId, eventId, form]);
  
  // Form gönderildiğinde
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Dosya eklerini hazırla
      const attachments = fileList
        .filter(file => file.status === 'done' && file.response)
        .map(file => ({
          id: file.response.fileId,
          fileUrl: file.response.fileUrl,
          fileName: file.name
        }));
      
      // Gönderilecek veriyi hazırla
      const budgetData = {
        ...values,
        attachments,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null
      };
      
      let result;
      
      if (budgetId) {
        // Mevcut bütçeyi güncelle
        result = await budgetService.updateBudget(budgetId, budgetData);
        message.success('Bütçe başarıyla güncellendi.');
      } else {
        // Yeni bütçe oluştur
        result = await budgetService.createBudget(budgetData);
        message.success('Bütçe başarıyla oluşturuldu.');
      }
      
      setLoading(false);
      
      // Başarı callback'ini çağır
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Bütçe kaydedilirken hata oluştu:', error);
      setError('Bütçe kaydedilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };
  
  // Bütçe türü değiştiğinde
  const handleTypeChange = (value) => {
    // Bütçe türüne göre klub/etkinlik alanını zorunlu/opsiyonel yap
    if (value === 'CLUB') {
      form.validateFields(['clubId']);
      form.resetFields(['eventId']);
    } else if (value === 'EVENT') {
      form.validateFields(['eventId']);
      form.resetFields(['clubId']);
    }
  };
  
  // Dosya yükleme seçenekleri
  const uploadProps = {
    name: 'file',
    action: '/api/upload/budget-attachment',
    headers: {
      authorization: 'authorization-text',
    },
    fileList: fileList,
    onChange(info) {
      // Dosya listesini güncelle
      let newFileList = [...info.fileList];
      
      // En fazla 5 dosya
      newFileList = newFileList.slice(-5);
      
      // Yükleme durumuna göre filtrele
      newFileList = newFileList.map(file => {
        if (file.response) {
          // Sunucu yanıtını dosyaya ekle
          file.url = file.response.fileUrl;
        }
        return file;
      });
      
      setFileList(newFileList);
      
      // Yükleme durumunu kontrol et
      if (info.file.status === 'done') {
        message.success(`${info.file.name} başarıyla yüklendi.`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} yüklenemedi.`);
      }
    },
    onRemove(file) {
      // Dosya silindi mi kontrol et
      if (file.response && file.response.fileId) {
        budgetService.deleteAttachment(file.response.fileId)
          .catch(error => {
            console.error('Dosya silinirken hata oluştu:', error);
          });
      }
    }
  };
  
  return (
    <Spin spinning={initialLoading}>
      <Card>
        <Title level={4}>{budgetId ? 'Bütçe Düzenle' : 'Yeni Bütçe Oluştur'}</Title>
        
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
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'OTHER',
            items: [{}]
          }}
        >
          <Row gutter={16}>
            <Col span={24} md={12}>
              <Form.Item
                name="title"
                label="Bütçe Adı"
                rules={[{ required: true, message: 'Lütfen bütçe adını girin' }]}
              >
                <Input placeholder="Bütçe adını girin" />
              </Form.Item>
            </Col>
            
            <Col span={24} md={12}>
              <Form.Item
                name="type"
                label="Bütçe Türü"
                rules={[{ required: true, message: 'Lütfen bütçe türünü seçin' }]}
              >
                <Select onChange={handleTypeChange}>
                  <Option value="CLUB">Kulüp Bütçesi</Option>
                  <Option value="EVENT">Etkinlik Bütçesi</Option>
                  <Option value="SPONSOR">Sponsor Bütçesi</Option>
                  <Option value="OTHER">Diğer</Option>
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24} md={12}>
              <Form.Item
                name="clubId"
                label="Kulüp"
                rules={[
                  { 
                    required: form.getFieldValue('type') === 'CLUB', 
                    message: 'Lütfen bir kulüp seçin' 
                  }
                ]}
              >
                <Select
                  placeholder="Kulüp seçin"
                  allowClear
                  disabled={!!clubId}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {clubs.map(club => (
                    <Option key={club.id} value={club.id}>{club.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24} md={12}>
              <Form.Item
                name="eventId"
                label="Etkinlik"
                rules={[
                  { 
                    required: form.getFieldValue('type') === 'EVENT', 
                    message: 'Lütfen bir etkinlik seçin' 
                  }
                ]}
              >
                <Select
                  placeholder="Etkinlik seçin"
                  allowClear
                  disabled={!!eventId}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {events.map(event => (
                    <Option key={event.id} value={event.id}>{event.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={24} md={8}>
              <Form.Item
                name="category"
                label="Kategori"
              >
                <Input placeholder="Bütçe kategorisi" />
              </Form.Item>
            </Col>
            
            <Col span={24} md={8}>
              <Form.Item
                name="totalAmount"
                label="Toplam Bütçe Tutarı"
                rules={[{ required: true, message: 'Lütfen toplam bütçe tutarını girin' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={100}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  placeholder="0.00"
                  prefix="₺"
                />
              </Form.Item>
            </Col>
            
            <Col span={24} md={8}>
              <Form.Item
                name="reference"
                label="Referans Kodu"
              >
                <Input placeholder="Referans veya takip kodu" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Başlangıç Tarihi"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY" 
                  placeholder="Başlangıç tarihi"
                />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Bitiş Tarihi"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  format="DD/MM/YYYY" 
                  placeholder="Bitiş tarihi" 
                />
              </Form.Item>
            </Col>
            
            <Col span={24}>
              <Form.Item
                name="description"
                label="Açıklama"
              >
                <TextArea rows={4} placeholder="Bütçe hakkında açıklama" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Bütçe Kalemleri</Divider>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={16} key={key} style={{ marginBottom: 16 }}>
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Kalem adı gerekli' }]}
                      >
                        <Input placeholder="Kalem adı" />
                      </Form.Item>
                    </Col>
                    
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'amount']}
                        rules={[{ required: true, message: 'Tutar gerekli' }]}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          min={0}
                          step={10}
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value.replace(/\$\s?|(,*)/g, '')}
                          placeholder="0.00"
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[{ required: true, message: 'Tür gerekli' }]}
                      >
                        <Select placeholder="Tür">
                          <Option value="EXPENSE">Gider</Option>
                          <Option value="INCOME">Gelir</Option>
                          <Option value="BUDGET">Bütçe</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={5}>
                      <Form.Item
                        {...restField}
                        name={[name, 'category']}
                      >
                        <Input placeholder="Kategori" />
                      </Form.Item>
                    </Col>
                    
                    <Col span={1} style={{ display: 'flex', alignItems: 'center' }}>
                      <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                    </Col>
                  </Row>
                ))}
                
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Bütçe Kalemi Ekle
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          
          <Divider orientation="left">Ek Dökümanlar</Divider>
          
          <Form.Item
            name="attachments"
            label="Dosya Ekleri"
            valuePropName="fileList"
            getValueFromEvent={e => {
              if (Array.isArray(e)) {
                return e;
              }
              return e && e.fileList;
            }}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Dosya Yükle</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Notlar"
          >
            <TextArea rows={3} placeholder="Ek notlar" />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
                {budgetId ? 'Güncelle' : 'Kaydet'}
              </Button>
              
              <Button onClick={onCancel} icon={<CloseOutlined />}>
                İptal
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </Spin>
  );
};

export default BudgetForm; 