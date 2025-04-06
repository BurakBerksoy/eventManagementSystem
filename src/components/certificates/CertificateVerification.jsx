import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Result, Alert, Descriptions, Divider, Space, Skeleton } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SearchOutlined, QrcodeOutlined } from '@ant-design/icons';
import { certificateService } from '../../services';
import moment from 'moment';
import 'moment/locale/tr';

const { Title, Text, Paragraph } = Typography;

/**
 * Sertifika Doğrulama Bileşeni
 * Sertifika kodunu doğrulama işlemini gerçekleştirir
 */
const CertificateVerification = () => {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);
  const [form] = Form.useForm();

  // Sertifika kodunu doğrula
  const verifyCertificate = async (values) => {
    try {
      setVerifying(true);
      setError(null);
      setVerified(false);
      setCertificate(null);
      
      const data = await certificateService.verifyCertificate(values.code);
      
      setCertificate(data);
      setVerified(true);
      setVerifying(false);
    } catch (error) {
      console.error('Sertifika doğrulanırken hata oluştu:', error);
      setError('Geçersiz sertifika kodu. Lütfen kodu kontrol edip tekrar deneyin.');
      setVerified(false);
      setCertificate(null);
      setVerifying(false);
    }
  };

  // Formu sıfırla
  const handleReset = () => {
    form.resetFields();
    setVerified(false);
    setCertificate(null);
    setError(null);
  };

  // Doğrulama sonucunu göster
  const renderVerificationResult = () => {
    if (!verified || !certificate) {
      return null;
    }

    const isValid = certificate.status === 'ACTIVE';

    return (
      <div style={{ marginTop: 24 }}>
        <Result
          status={isValid ? 'success' : 'error'}
          title={isValid ? 'Sertifika Doğrulandı' : 'Geçersiz Sertifika'}
          icon={isValid ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
          subTitle={
            isValid
              ? 'Bu sertifika geçerlidir ve doğrulanmıştır.'
              : certificate.status === 'EXPIRED'
                ? 'Bu sertifikanın geçerlilik süresi dolmuştur.'
                : certificate.status === 'REVOKED'
                  ? 'Bu sertifika iptal edilmiştir.'
                  : 'Bu sertifika geçerli değildir.'
          }
        />

        <Divider orientation="left">Sertifika Bilgileri</Divider>
        
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Sertifika Kodu">
            {certificate.code}
          </Descriptions.Item>
          <Descriptions.Item label="Etkinlik">
            {certificate.eventTitle}
          </Descriptions.Item>
          <Descriptions.Item label="Katılımcı">
            {certificate.userName}
          </Descriptions.Item>
          <Descriptions.Item label="Veriliş Tarihi">
            {moment(certificate.issueDate).format('LL')}
          </Descriptions.Item>
          {certificate.expiryDate && (
            <Descriptions.Item label="Geçerlilik Tarihi">
              {moment(certificate.expiryDate).format('LL')}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Durum">
            {certificate.status === 'ACTIVE' ? (
              <Text type="success">Geçerli</Text>
            ) : certificate.status === 'EXPIRED' ? (
              <Text type="danger">Süresi Dolmuş</Text>
            ) : certificate.status === 'REVOKED' ? (
              <Text type="danger">İptal Edilmiş</Text>
            ) : (
              <Text type="warning">Bilinmiyor</Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Açıklama">
            {certificate.description}
          </Descriptions.Item>
        </Descriptions>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Button type="primary" onClick={handleReset}>
            Başka Bir Sertifika Doğrula
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3}>Sertifika Doğrulama</Title>
        <Paragraph>
          Sertifika kodunu girerek sertifikanın geçerliliğini kontrol edebilirsiniz.
          Doğrulamak istediğiniz sertifika kodunu aşağıya girin.
        </Paragraph>
      </div>

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

      {!verified && (
        <Form
          form={form}
          onFinish={verifyCertificate}
          layout="vertical"
        >
          <Form.Item
            name="code"
            label="Sertifika Kodu"
            rules={[
              {
                required: true,
                message: 'Lütfen sertifika kodunu girin',
              },
            ]}
          >
            <Input
              prefix={<SearchOutlined />}
              placeholder="Sertifika kodunu girin"
              size="large"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SearchOutlined />}
                loading={verifying}
              >
                Doğrula
              </Button>
              <Button onClick={handleReset}>
                Sıfırla
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}

      {verifying ? (
        <div style={{ marginTop: 24 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </div>
      ) : (
        renderVerificationResult()
      )}

      <Divider dashed style={{ margin: '24px 0' }} />

      <div style={{ textAlign: 'center' }}>
        <Paragraph type="secondary">
          <QrcodeOutlined style={{ fontSize: 20, marginRight: 8 }} />
          QR kodunu tarayarak da sertifika doğrulama yapabilirsiniz.
        </Paragraph>
      </div>
    </Card>
  );
};

export default CertificateVerification; 