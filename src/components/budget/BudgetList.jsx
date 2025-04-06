import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Input, Space, Tag, Typography, Tooltip, Statistic, Row, Col, Badge, Alert, Spin } from 'antd';
import { SearchOutlined, PlusOutlined, DownloadOutlined, FilterOutlined, EyeOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import { budgetService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text } = Typography;

/**
 * Bütçe Listesi Bileşeni
 * Kulüp veya etkinliğe ait bütçeleri listeler
 */
const BudgetList = ({ 
  clubId = null, 
  eventId = null, 
  isAdmin = false, 
  showAddButton = true, 
  onAddClick = null,
  onEditClick = null,
  onDetailsClick = null
}) => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalExpense: 0,
    totalIncome: 0,
    remaining: 0,
    budgetCount: 0
  });
  
  // Bütçeleri yükle
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        
        let data;
        if (clubId) {
          data = await budgetService.getBudgetsByClub(clubId);
        } else if (eventId) {
          data = await budgetService.getBudgetsByEvent(eventId);
        } else {
          data = await budgetService.getAllBudgets();
        }
        
        setBudgets(data);
        
        // Özet istatistiklerini hesapla
        const totalBudget = data.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalExpense = data.reduce((sum, item) => sum + item.totalExpense, 0);
        const totalIncome = data.reduce((sum, item) => sum + item.totalIncome, 0);
        
        setSummary({
          totalBudget,
          totalExpense,
          totalIncome,
          remaining: totalBudget - totalExpense + totalIncome,
          budgetCount: data.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Bütçeler yüklenirken hata oluştu:', error);
        setError('Bütçeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        setLoading(false);
      }
    };
    
    fetchBudgets();
  }, [clubId, eventId]);
  
  // Bütçe durumu etiketi
  const getBudgetStatusTag = (budget) => {
    const remaining = budget.totalAmount - budget.totalExpense + budget.totalIncome;
    const percentage = budget.totalAmount > 0 ? (remaining / budget.totalAmount) * 100 : 0;
    
    if (percentage < 10) {
      return <Tag color="red">Kritik</Tag>;
    } else if (percentage < 30) {
      return <Tag color="orange">Düşük</Tag>;
    } else if (percentage < 60) {
      return <Tag color="blue">Normal</Tag>;
    } else {
      return <Tag color="green">İyi</Tag>;
    }
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
  
  // Excel'e aktar
  const handleExportToExcel = () => {
    budgetService.exportBudgetsToExcel(
      clubId ? `club_${clubId}` : eventId ? `event_${eventId}` : 'all_budgets'
    );
  };
  
  // Bütçeyi sil
  const handleDeleteBudget = async (id) => {
    try {
      await budgetService.deleteBudget(id);
      
      // Listeyi güncelle
      setBudgets(budgets.filter(budget => budget.id !== id));
      
      // Özet istatistiklerini güncelle
      const deletedBudget = budgets.find(budget => budget.id === id);
      setSummary({
        ...summary,
        totalBudget: summary.totalBudget - deletedBudget.totalAmount,
        totalExpense: summary.totalExpense - deletedBudget.totalExpense,
        totalIncome: summary.totalIncome - deletedBudget.totalIncome,
        remaining: summary.remaining - (deletedBudget.totalAmount - deletedBudget.totalExpense + deletedBudget.totalIncome),
        budgetCount: summary.budgetCount - 1
      });
      
    } catch (error) {
      console.error('Bütçe silinirken hata oluştu:', error);
      setError('Bütçe silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };
  
  // Arama sonuçlarını filtrele
  const getFilteredBudgets = () => {
    if (!searchText) return budgets;
    
    return budgets.filter(budget => 
      budget.title.toLowerCase().includes(searchText.toLowerCase()) ||
      budget.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      budget.category?.toLowerCase().includes(searchText.toLowerCase())
    );
  };
  
  // Sütunlar
  const columns = [
    {
      title: 'Bütçe Adı',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          {record.reference && (
            <Text type="secondary" style={{ fontSize: '12px' }}>Referans: {record.reference}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (text, record) => (
        <Space>
          {getBudgetTypeTag(record.type)}
          {text || '-'}
        </Space>
      ),
    },
    {
      title: 'Toplam Bütçe',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <Text strong>{amount.toLocaleString('tr-TR')} ₺</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Gider',
      dataIndex: 'totalExpense',
      key: 'totalExpense',
      render: (amount, record) => (
        <Text type="danger">{amount.toLocaleString('tr-TR')} ₺</Text>
      ),
      sorter: (a, b) => a.totalExpense - b.totalExpense,
    },
    {
      title: 'Gelir',
      dataIndex: 'totalIncome',
      key: 'totalIncome',
      render: (amount) => <Text type="success">{amount.toLocaleString('tr-TR')} ₺</Text>,
      sorter: (a, b) => a.totalIncome - b.totalIncome,
    },
    {
      title: 'Kalan',
      key: 'remaining',
      render: (_, record) => {
        const remaining = record.totalAmount - record.totalExpense + record.totalIncome;
        const color = remaining < 0 ? 'red' : 'green';
        return <Text style={{ color }}>{remaining.toLocaleString('tr-TR')} ₺</Text>;
      },
      sorter: (a, b) => {
        const remainingA = a.totalAmount - a.totalExpense + a.totalIncome;
        const remainingB = b.totalAmount - b.totalExpense + b.totalIncome;
        return remainingA - remainingB;
      },
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_, record) => getBudgetStatusTag(record),
    },
    {
      title: 'Tarih',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('LL'),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Detaylar">
            <Button
              icon={<EyeOutlined />}
              onClick={() => onDetailsClick && onDetailsClick(record)}
              size="small"
            />
          </Tooltip>
          
          {isAdmin && (
            <>
              <Tooltip title="Düzenle">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => onEditClick && onEditClick(record)}
                  size="small"
                  type="primary"
                  ghost
                />
              </Tooltip>
              <Tooltip title="Sil">
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteBudget(record.id)}
                  size="small"
                  danger
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];
  
  return (
    <div className="budget-list">
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
      
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col span={24} md={12}>
              <Title level={4} style={{ margin: 0 }}>Bütçe Listesi</Title>
            </Col>
            
            <Col span={24} md={12} style={{ textAlign: 'right' }}>
              <Space>
                <Input
                  placeholder="Ara..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  style={{ width: 200 }}
                />
                
                {isAdmin && showAddButton && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAddClick}
                  >
                    Yeni Bütçe
                  </Button>
                )}
                
                <Button
                  icon={<DownloadOutlined />}
                  onClick={handleExportToExcel}
                >
                  Excel'e Aktar
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
        
        <Row gutter={[16, 24]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6} lg={4}>
                <Statistic
                  title="Toplam Bütçe"
                  value={summary.totalBudget}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6} lg={4}>
                <Statistic
                  title="Toplam Gider"
                  value={summary.totalExpense}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6} lg={4}>
                <Statistic
                  title="Toplam Gelir"
                  value={summary.totalIncome}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6} lg={4}>
                <Statistic
                  title="Kalan Bütçe"
                  value={summary.remaining}
                  precision={2}
                  suffix="₺"
                  valueStyle={{ color: summary.remaining < 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Col>
              
              <Col xs={12} sm={8} md={6} lg={4}>
                <Statistic
                  title="Bütçe Sayısı"
                  value={summary.budgetCount}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
          </Col>
          
          <Col span={24}>
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={getFilteredBudgets()}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
              />
            </Spin>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default BudgetList; 