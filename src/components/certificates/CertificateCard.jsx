import React, { useState } from 'react';
import { Card, Typography, Button, Space, Modal, Badge, Tag, Descriptions, Tooltip, message } from 'antd';
import { DownloadOutlined, QrcodeOutlined, ShareAltOutlined, MailOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { certificateService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text } = Typography;

/**
 * Sertifika Kartı Bileşeni
 * Kullanıcının sahip olduğu sertifika bilgilerini gösterir
 */
const CertificateCard = ({ certificate }) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [qrCode, setQrCode] = useState('');

  // Sertifika PDF'ini indir
  const handleDownload = async () => {
    try {
      setLoading(true);
      await certificateService.downloadCertificate(certificate.id);
      setLoading(false);
    } catch (error) {
      console.error('Sertifika indirilirken hata oluştu:', error);
      message.error('Sertifika indirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  // QR kodunu görüntüle
  const handleShowQR = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getCertificateQR(certificate.id);
      setQrCode(data.qrCodeUrl);
      setQrModalVisible(true);
      setLoading(false);
    } catch (error) {
      console.error('QR kodu yüklenirken hata oluştu:', error);
      message.error('QR kodu yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  // Sertifikayı e-posta ile gönder
  const handleEmail = async () => {
    try {
      setLoading(true);
      await certificateService.emailCertificates(certificate.userId);
      message.success('Sertifika e-posta ile gönderildi.');
      setLoading(false);
    } catch (error) {
      console.error('Sertifika e-posta ile gönderilirken hata oluştu:', error);
      message.error('Sertifika e-posta ile gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  // Sertifikayı paylaş
  const handleShare = async () => {
    try {
      setLoading(true);
      const data = await certificateService.shareCertificate(certificate.id);
      setShareUrl(data.shareUrl);
      setShareModalVisible(true);
      setLoading(false);
    } catch (error) {
      console.error('Sertifika paylaşım linki oluşturulurken hata oluştu:', error);
      message.error('Sertifika paylaşım linki oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setLoading(false);
    }
  };

  // URL'i panoya kopyala
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Paylaşım linki panoya kopyalandı!');
  };

  // Sertifika durumuna göre renk ve metin belirleme
  const getStatusTag = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">Geçerli</Tag>;
      case 'EXPIRED':
        return <Tag color="red">Süresi Dolmuş</Tag>;
      case 'REVOKED':
        return <Tag color="volcano">İptal Edilmiş</Tag>;
      case 'PENDING':
        return <Tag color="gold">Beklemede</Tag>;
      default:
        return <Tag color="default">Bilinmiyor</Tag>;
    }
  };

  return (
    <Badge.Ribbon
      text={certificate.status === 'ACTIVE' ? 'Geçerli' : 'Süresi Dolmuş'}
      color={certificate.status === 'ACTIVE' ? 'green' : 'red'}
    >
      <Card 
        hoverable
        style={{ height: '100%' }}
        actions={[
          <Tooltip title="PDF'i İndir">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              loading={loading}
            />
          </Tooltip>,
          <Tooltip title="QR Kodu">
            <Button
              type="text"
              icon={<QrcodeOutlined />}
              onClick={handleShowQR}
              loading={loading}
            />
          </Tooltip>,
          <Tooltip title="Paylaş">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
              loading={loading}
            />
          </Tooltip>,
          <Tooltip title="E-posta ile Gönder">
            <Button
              type="text"
              icon={<MailOutlined />}
              onClick={handleEmail}
              loading={loading}
            />
          </Tooltip>,
          <Tooltip title="Önizleme">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => setPreviewModalVisible(true)}
            />
          </Tooltip>
        ]}
      >
        <div style={{ marginBottom: 12 }}>
          {getStatusTag(certificate.status)}
        </div>
        
        <Title level={4} style={{ marginBottom: 8 }}>
          {certificate.eventTitle}
        </Title>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {certificate.description}
        </Text>
        
        <div style={{ marginBottom: 16 }}>
          <Space direction="vertical" size="small">
            <Text strong>Tarih: </Text>
            <Text>{moment(certificate.issueDate).format('LL')}</Text>
            
            <Text strong>Kod: </Text>
            <Text copyable>{certificate.code}</Text>
            
            {certificate.expiryDate && (
              <>
                <Text strong>Geçerlilik Süresi: </Text>
                <Text>{moment(certificate.expiryDate).format('LL')}</Text>
              </>
            )}
          </Space>
        </div>
      </Card>

      {/* QR Kod Modalı */}
      <Modal
        title="Doğrulama QR Kodu"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <img src={qrCode} alt="QR Kodu" style={{ maxWidth: '100%', maxHeight: 300 }} />
          <div style={{ marginTop: 16 }}>
            <Text>
              Bu QR kodu, sertifikayı doğrulamak için kullanılabilir.
              Telefonunuzun kamera uygulamasıyla tarayın veya QR kod okuyucu ile kontrol edin.
            </Text>
          </div>
        </div>
      </Modal>

      {/* Paylaşım Modalı */}
      <Modal
        title="Sertifika Paylaşım Linki"
        open={shareModalVisible}
        onCancel={() => setShareModalVisible(false)}
        footer={[
          <Button key="copy" type="primary" onClick={() => copyToClipboard(shareUrl)}>
            Kopyala
          </Button>,
          <Button key="close" onClick={() => setShareModalVisible(false)}>
            Kapat
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Text strong>Bu linki paylaşarak sertifikanızı başkalarıyla paylaşabilirsiniz:</Text>
          <div 
            style={{ 
              padding: '10px', 
              background: '#f5f5f5', 
              borderRadius: '4px', 
              marginTop: '10px',
              wordBreak: 'break-all'  
            }}
          >
            <Text copyable>{shareUrl}</Text>
          </div>
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">
              Not: Bu link, sertifika geçerlilik bilgilerini ve doğrulama sayfasını içerir.
            </Text>
          </div>
        </div>
      </Modal>

      {/* Önizleme Modalı */}
      <Modal
        title="Sertifika Detayları"
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="download" type="primary" onClick={handleDownload}>
            İndir
          </Button>,
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Kapat
          </Button>
        ]}
        width={600}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={3}>{certificate.eventTitle}</Title>
            <div style={{ margin: '16px 0' }}>
              {certificate.status === 'ACTIVE' && (
                <div style={{ color: 'green', marginBottom: 8 }}>
                  <CheckCircleOutlined style={{ fontSize: 36 }} />
                </div>
              )}
              <Text>{certificate.description}</Text>
            </div>
          </div>
          
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Veriliş Tarihi">
              {moment(certificate.issueDate).format('LL')}
            </Descriptions.Item>
            <Descriptions.Item label="Geçerlilik Tarihi">
              {certificate.expiryDate ? moment(certificate.expiryDate).format('LL') : 'Süresiz'}
            </Descriptions.Item>
            <Descriptions.Item label="Sertifika Kodu">
              <Text copyable>{certificate.code}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Durum">
              {getStatusTag(certificate.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Katılımcı">
              {certificate.userName}
            </Descriptions.Item>
            <Descriptions.Item label="Etkinlik">
              {certificate.eventTitle}
            </Descriptions.Item>
            <Descriptions.Item label="Açıklama">
              {certificate.description}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>
    </Badge.Ribbon>
  );
};

export default CertificateCard; 