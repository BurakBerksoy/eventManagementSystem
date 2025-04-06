import React, { useState, useEffect } from 'react';
import { Card, Typography, Descriptions, Table, Row, Col, Statistic, Divider, Tag, Button, Spin, Empty, Alert, List, Avatar, Space, Progress, Tooltip } from 'antd';
import { FileOutlined, DownloadOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined, PieChartOutlined, TeamOutlined, CalendarOutlined, LinkOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { budgetService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';
import { Link } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

/**
 * Bütçe Detayları Bileşeni
 * Bütçe detaylarını görüntüler
 */
const BudgetDetails = ({ 
  budgetId, 
  isAdmin = false, 
  onEditClick = null,
  onDeleteClick = null,
  onBackClick = null
}) => {
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState({
    statusText: 'Yükleniyor...',
    statusColor: 'default',
    percentComplete: 0,
    daysLeft: 0
  });
  
  // Bütçe verilerini yükle
  useEffect(() => {
    const fetchBudget = async () => {
      try {
        setLoading(true);
        const data = await budgetService.getBudgetById(budgetId);
        setBudget(data);
        
        // Bütçe durumunu hesapla
        const status = calculateBudgetStatus(data);
        setBudgetStatus(status);
        
        setLoading(false);
      } catch (error) {
        console.error('Bütçe detayları yüklenirken hata oluştu:', error);
        setError('Bütçe detayları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };
    
    fetchBudget();
  }, [budgetId]);
  
  // Bütçe durumunu hesapla
  const calculateBudgetStatus = (budget) => {
    const totalExpense = budget.totalExpense || 0;
    const totalIncome = budget.totalIncome || 0;
    const totalAmount = budget.totalAmount || 0;
    
    const remaining = totalAmount - totalExpense + totalIncome;
    const percentComplete = totalAmount > 0 ? ((totalExpense - totalIncome) / totalAmount) * 100 : 0;
    
    let statusText = '';
    let statusColor = '';
    
    if (percentComplete >= 100) {
      statusText = 'Bütçe Tamamlandı';
      statusColor = 'red';
    } else if (percentComplete >= 85) {
      statusText = 'Kritik Seviye';
      statusColor = 'orange';
    } else if (percentComplete >= 50) {
      statusText = 'İlerleme Var';
      statusColor = 'blue';
    } else {
      statusText = 'İyi Durumda';
      statusColor = 'green';
    }
    
    // Kalan gün hesaplama
    let daysLeft = 0;
    if (budget.endDate) {
      const endDate = moment(budget.endDate);
      if (endDate.isAfter(moment())) {
        daysLeft = endDate.diff(moment(), 'days');
      }
    }
    
    return {
      statusText,
      statusColor,
      percentComplete: parseFloat(percentComplete.toFixed(2)),
      daysLeft
    };
  };
  
  // Bütçe türü etiketi
  const getBudgetTypeTag = (type) => {
    switch (type) {
      case 'EVENT':
        return <Tag color="purple">Etkinlik</Tag>;
      case 'CLUB':
        return <Tag color="blue">Kulüp</Tag>;
      case 'SPONSOR':
        return <Tag color="green">Sponsor</Tag>;
      case 'OTHER':
        return <Tag color="default">Diğer</Tag>;
      default:
        return <Tag>Bilinmiyor</Tag>;
    }
  };
  
  // Bütçe kalemi türü etiketi
  const getItemTypeTag = (type) => {
    switch (type) {
      case 'EXPENSE':
        return <Tag color="red">Gider</Tag>;
      case 'INCOME':
        return <Tag color="green">Gelir</Tag>;
      case 'BUDGET':
        return <Tag color="blue">Bütçe</Tag>;
      default:
        return <Tag>Bilinmiyor</Tag>;
    }
  };
  
  // Excel'e aktar
  const handleExportToExcel = () => {
    budgetService.exportBudgetToExcel(budgetId);
  };
  
  // Dosya indir
  const handleDownloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'dosya';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Kalem tablosu sütunları
  const itemColumns = [
    {
      title: 'Kalem Adı',
      dataIndex: 'name',
      key: 'name',
      render: text => <Text strong>{text}</Text>,
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: text => text || '-',
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      render: type => getItemTypeTag(type),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => {
        const color = record.type === 'EXPENSE' ? 'red' : record.type === 'INCOME' ? 'green' : 'inherit';
        return <Text style={{ color }}>{amount.toLocaleString('tr-TR')} ₺</Text>;
      },
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      render: text => text || '-',
    },
  ];
  
  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Bütçe bilgileri yükleniyor...</div>
        </div>
      </Card>
    );
  }
  
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
  
  if (!budget) {
    return (
      <Card>
        <Empty description="Bütçe bulunamadı" />
      </Card>
    );
  }
  
  return (
    <div className="budget-details">
      <Card
        title={
          <Space>
            <Title level={4} style={{ margin: 0 }}>{budget.title}</Title>
            {getBudgetTypeTag(budget.type)}
          </Space>
        }
        extra={
          <Space>
            {onBackClick && (
              <Button onClick={onBackClick}>
                Geri
              </Button>
            )}
            
            <Button
              icon={<FileExcelOutlined />}
              onClick={handleExportToExcel}
            >
              Excel'e Aktar
            </Button>
            
            {isAdmin && (
              <>
                <Button
                  type="primary"
                  ghost
                  icon={<EditOutlined />}
                  onClick={() => onEditClick && onEditClick(budget)}
                >
                  Düzenle
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDeleteClick && onDeleteClick(budget.id)}
                >
                  Sil
                </Button>
              </>
            )}
          </Space>
        }
      >
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Statistic
                  title="Toplam Bütçe"
                  value={budget.totalAmount}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6}>
                <Statistic
                  title="Toplam Gider"
                  value={budget.totalExpense || 0}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6}>
                <Statistic
                  title="Toplam Gelir"
                  value={budget.totalIncome || 0}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6}>
                <Statistic
                  title="Kalan Bütçe"
                  value={(budget.totalAmount - (budget.totalExpense || 0) + (budget.totalIncome || 0))}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ 
                    color: budget.totalAmount - budget.totalExpense + budget.totalIncome < 0 
                      ? '#ff4d4f' 
                      : '#52c41a' 
                  }}
                />
              </Col>
            </Row>
          </Col>
          
          <Col span={24}>
            <Card>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div style={{ marginBottom: 16 }}>
                    <Text strong>Bütçe Kullanımı:</Text>
                    <Progress 
                      percent={budgetStatus.percentComplete} 
                      status={budgetStatus.percentComplete >= 100 ? 'exception' : 'active'}
                      strokeColor={{
                        '0%': '#108ee9',
                        '100%': budgetStatus.percentComplete >= 100 ? '#ff4d4f' : '#87d068',
                      }}
                    />
                  </div>
                  
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Durum">
                      <Tag color={budgetStatus.statusColor}>{budgetStatus.statusText}</Tag>
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Kategori">
                      {budget.category || '-'}
                    </Descriptions.Item>
                    
                    <Descriptions.Item label="Referans Kodu">
                      {budget.reference || '-'}
                    </Descriptions.Item>
                    
                    {budget.clubId && (
                      <Descriptions.Item label="Kulüp">
                        <Link to={`/clubs/${budget.clubId}`}>
                          <Space>
                            <TeamOutlined />
                            {budget.clubName || 'Kulüp Detayları'}
                          </Space>
                        </Link>
                      </Descriptions.Item>
                    )}
                    
                    {budget.eventId && (
                      <Descriptions.Item label="Etkinlik">
                        <Link to={`/events/${budget.eventId}`}>
                          <Space>
                            <CalendarOutlined />
                            {budget.eventTitle || 'Etkinlik Detayları'}
                          </Space>
                        </Link>
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Col>
                
                <Col xs={24} md={12}>
                  <Descriptions bordered size="small" column={1}>
                    <Descriptions.Item label="Oluşturulma Tarihi">
                      {moment(budget.createdAt).format('LLL')}
                    </Descriptions.Item>
                    
                    {budget.creator && (
                      <Descriptions.Item label="Oluşturan">
                        {budget.creator.name || budget.creator.username || budget.creator.email || '-'}
                      </Descriptions.Item>
                    )}
                    
                    <Descriptions.Item label="Başlangıç - Bitiş Tarihi">
                      {budget.startDate ? moment(budget.startDate).format('LL') : '-'} - {budget.endDate ? moment(budget.endDate).format('LL') : '-'}
                    </Descriptions.Item>
                    
                    {budgetStatus.daysLeft > 0 && (
                      <Descriptions.Item label="Kalan Süre">
                        <Text type="warning">{budgetStatus.daysLeft} gün</Text>
                      </Descriptions.Item>
                    )}
                    
                    {budget.lastModified && (
                      <Descriptions.Item label="Son Güncelleme">
                        {moment(budget.lastModified).format('LLL')}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card title="Açıklama">
              <Paragraph>{budget.description || 'Bu bütçe için açıklama bulunmuyor.'}</Paragraph>
            </Card>
          </Col>
          
          <Col span={24}>
            <Card 
              title={
                <Space>
                  <span>Bütçe Kalemleri</span>
                  <Tag color="blue">{budget.items ? budget.items.length : 0} kalem</Tag>
                </Space>
              }
            >
              {budget.items && budget.items.length > 0 ? (
                <Table 
                  dataSource={budget.items} 
                  columns={itemColumns} 
                  rowKey={(record, index) => `${record.id || index}`}
                  pagination={false}
                  size="middle"
                />
              ) : (
                <Empty description="Bütçe kalemi bulunamadı" />
              )}
            </Card>
          </Col>
          
          {budget.attachments && budget.attachments.length > 0 && (
            <Col span={24}>
              <Card title="Dosya Ekleri">
                <List
                  itemLayout="horizontal"
                  dataSource={budget.attachments}
                  renderItem={(item, index) => (
                    <List.Item
                      actions={[
                        <Button 
                          key="download" 
                          type="link" 
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownloadFile(item.fileUrl, item.fileName)}
                        >
                          İndir
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileOutlined />} />}
                        title={item.fileName || `Dosya ${index + 1}`}
                        description={
                          <Space>
                            {item.fileSize && <Text type="secondary">{item.fileSize}</Text>}
                            {item.uploadDate && <Text type="secondary">{moment(item.uploadDate).format('LLL')}</Text>}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          )}
          
          {budget.notes && (
            <Col span={24}>
              <Card title="Notlar">
                <Paragraph>{budget.notes}</Paragraph>
              </Card>
            </Col>
          )}
        </Row>
      </Card>
    </div>
  );
};

export default BudgetDetails; 