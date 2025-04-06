import React, { useState, useEffect } from 'react';
import { Row, Col, Empty, Spin, Alert, Pagination, Select, Input, Button, Typography, Space, Card } from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import { certificateService } from '../../services';
import CertificateCard from './CertificateCard';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Sertifika Listesi Bileşeni
 * Kullanıcının sertifikalarını listeler ve filtreler
 */
const CertificateList = ({ userId = 'me', showFilters = true }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEvent, setFilterEvent] = useState('all');
  const [events, setEvents] = useState([]);

  // Sertifikaları yükle
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await certificateService.getUserCertificates(userId);
      
      setCertificates(data);
      setTotalCertificates(data.length);
      
      // Etkinlik filtresi için benzersiz etkinlikleri topla
      const uniqueEvents = [...new Set(data.map(cert => cert.eventId))];
      const eventNames = uniqueEvents.map(eventId => {
        const cert = data.find(c => c.eventId === eventId);
        return {
          id: eventId,
          title: cert ? cert.eventTitle : `Etkinlik ${eventId}`
        };
      });
      setEvents(eventNames);
      
      setLoading(false);
    } catch (error) {
      console.error('Sertifikalar yüklenirken hata oluştu:', error);
      setError('Sertifikalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    fetchCertificates();
  }, [userId]);

  // Filtreleme ve sayfalama
  const getFilteredCertificates = () => {
    return certificates
      .filter(cert => {
        const matchesSearch = searchText === '' || 
          cert.eventTitle.toLowerCase().includes(searchText.toLowerCase()) ||
          cert.description.toLowerCase().includes(searchText.toLowerCase()) ||
          cert.code.toLowerCase().includes(searchText.toLowerCase());
        
        const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
        
        const matchesEvent = filterEvent === 'all' || cert.eventId.toString() === filterEvent;
        
        return matchesSearch && matchesStatus && matchesEvent;
      })
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  };

  // Filtrelenmiş ve sayfalanmış sertifikalar
  const paginatedCertificates = () => {
    const filtered = getFilteredCertificates();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return filtered.slice(startIndex, endIndex);
  };

  // Filtrele
  const handleFilter = () => {
    setCurrentPage(1);
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setSearchText('');
    setFilterStatus('all');
    setFilterEvent('all');
    setCurrentPage(1);
  };

  // Sayfalama değişimi
  const handlePageChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Durum filtresi değişimi
  const handleStatusChange = (value) => {
    setFilterStatus(value);
  };

  // Etkinlik filtresi değişimi
  const handleEventChange = (value) => {
    setFilterEvent(value);
  };

  return (
    <div>
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
      
      {showFilters && (
        <Card style={{ marginBottom: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>Sertifikalarım</Title>
            
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                <Input
                  placeholder="Sertifika ara..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Col>
              
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Duruma göre filtrele"
                  value={filterStatus}
                  onChange={handleStatusChange}
                >
                  <Option value="all">Tüm Durumlar</Option>
                  <Option value="ACTIVE">Geçerli</Option>
                  <Option value="EXPIRED">Süresi Dolmuş</Option>
                  <Option value="REVOKED">İptal Edilmiş</Option>
                  <Option value="PENDING">Beklemede</Option>
                </Select>
              </Col>
              
              <Col xs={12} sm={12} md={6} lg={6} xl={6}>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Etkinliğe göre filtrele"
                  value={filterEvent}
                  onChange={handleEventChange}
                >
                  <Option value="all">Tüm Etkinlikler</Option>
                  {events.map(event => (
                    <Option key={event.id} value={event.id.toString()}>
                      {event.title}
                    </Option>
                  ))}
                </Select>
              </Col>
              
              <Col xs={24} sm={24} md={4} lg={4} xl={4}>
                <Space>
                  <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={handleFilter}
                  >
                    Filtrele
                  </Button>
                  
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleResetFilters}
                  >
                    Sıfırla
                  </Button>
                </Space>
              </Col>
            </Row>
          </Space>
        </Card>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      ) : getFilteredCertificates().length === 0 ? (
        <Empty
          description={
            <span>
              {searchText || filterStatus !== 'all' || filterEvent !== 'all'
                ? 'Filtrelere uygun sertifika bulunamadı'
                : 'Henüz sertifikanız bulunmuyor'}
            </span>
          }
          style={{ margin: '40px 0' }}
        />
      ) : (
        <>
          <Row gutter={[24, 24]}>
            {paginatedCertificates().map(certificate => (
              <Col xs={24} sm={12} md={12} lg={8} xl={6} key={certificate.id}>
                <CertificateCard certificate={certificate} />
              </Col>
            ))}
          </Row>
          
          <div style={{ textAlign: 'right', marginTop: 24 }}>
            <Text type="secondary" style={{ marginRight: 16 }}>
              Toplam {getFilteredCertificates().length} sertifika
            </Text>
            
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={getFilteredCertificates().length}
              onChange={handlePageChange}
              showSizeChanger
              pageSizeOptions={['4', '8', '12', '16']}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CertificateList; 