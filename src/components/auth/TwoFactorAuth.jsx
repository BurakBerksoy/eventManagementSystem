import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Space, Alert, Typography, Steps, Divider, Modal, List, Tooltip } from 'antd';
import { QrcodeOutlined, SecurityScanOutlined, KeyOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';
import { twoFactorAuthService } from '../../services';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * İki faktörlü kimlik doğrulama bileşeni
 * Kullanıcının 2FA kurulumu ve yönetimini sağlar
 */
const TwoFactorAuth = ({ onSuccess, onCancel }) => {
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [backupCodesVisible, setBackupCodesVisible] = useState(false);

  // 2FA durumunu kontrol et
  useEffect(() => {
    const check2FAStatus = async () => {
      try {
        setLoading(true);
        const result = await twoFactorAuthService.getStatus();
        setIs2FAEnabled(result.enabled);
        setLoading(false);
      } catch (err) {
        setError('2FA durumu kontrol edilirken bir hata oluştu.');
        setLoading(false);
      }
    };

    check2FAStatus();
  }, []);

  // 2FA kurulumunu başlat
  const handleSetup = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const setup = await twoFactorAuthService.setup();
      setQrCode(setup.qrCodeUrl);
      setSecret(setup.secret);
      
      setLoading(false);
      setCurrent(1);
    } catch (err) {
      setError('2FA kurulumu başlatılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  // 2FA doğrulama kodunu kontrol et
  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await twoFactorAuthService.verify(verificationCode);
      
      if (result.success) {
        setIs2FAEnabled(true);
        setBackupCodes(result.backupCodes || []);
        setLoading(false);
        setCurrent(2);
      } else {
        setError('Doğrulama kodu geçersiz. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    } catch (err) {
      setError('Doğrulama yapılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  // 2FA devre dışı bırak
  const handleDisable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await twoFactorAuthService.disable(verificationCode);
      
      if (result.success) {
        setIs2FAEnabled(false);
        setLoading(false);
        if (onSuccess) onSuccess({ enabled: false });
      } else {
        setError('Doğrulama kodu geçersiz. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    } catch (err) {
      setError('2FA devre dışı bırakılırken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Yeni yedek kodlar oluştur
  const handleGenerateBackupCodes = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const result = await twoFactorAuthService.generateBackupCodes(verificationCode);
      
      if (result.backupCodes) {
        setBackupCodes(result.backupCodes);
        setBackupCodesVisible(true);
        setLoading(false);
      } else {
        setError('Yedek kodlar oluşturulamadı.');
        setLoading(false);
      }
    } catch (err) {
      setError('Yedek kodlar oluşturulurken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Yedek kodu panoya kopyala
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  // Kurulum tamamlandı, sonuçları göster
  const handleFinish = () => {
    if (onSuccess) onSuccess({ enabled: true, backupCodes });
  };

  // Kurulumu iptal et
  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Yedek kodlar modalı
  const renderBackupCodesModal = () => (
    <Modal
      title="Yedek Kodlar"
      open={backupCodesVisible}
      onOk={() => setBackupCodesVisible(false)}
      onCancel={() => setBackupCodesVisible(false)}
      footer={[
        <Button key="close" onClick={() => setBackupCodesVisible(false)}>
          Kapat
        </Button>
      ]}
    >
      <Alert
        message="Bu kodları güvenli bir yerde saklayın!"
        description="Bu kodlar 2FA kodunuzu unuttuğunuzda hesabınıza erişim sağlamanıza yardımcı olur. Her kod sadece bir kez kullanılabilir."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <List
        bordered
        dataSource={backupCodes}
        renderItem={(code) => (
          <List.Item actions={[
            <Tooltip title="Kopyala">
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => copyToClipboard(code)}
                type="text"
              />
            </Tooltip>
          ]}>
            <Text code>{code}</Text>
          </List.Item>
        )}
      />
    </Modal>
  );

  // 2FA Kurulum Adımları
  const steps = [
    {
      title: 'Başlat',
      content: (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4}>İki Faktörlü Kimlik Doğrulama</Title>
          <Paragraph>
            İki faktörlü kimlik doğrulama (2FA), hesabınızı daha güvenli hale getiren ek bir güvenlik katmanıdır.
            Etkinleştirdiğinizde, giriş yaparken şifrenize ek olarak mobil uygulamadan alacağınız bir doğrulama kodu da girmeniz gerekecektir.
          </Paragraph>
          
          {is2FAEnabled ? (
            <>
              <Alert
                message="İki faktörlü kimlik doğrulama etkinleştirildi"
                description="Hesabınızda şu anda iki faktörlü kimlik doğrulama etkin durumda."
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Space direction="vertical" style={{ width: '100%' }}>
                <Form layout="vertical">
                  <Form.Item
                    label="Doğrulama kodu"
                    extra="Mobil uygulamanızdaki mevcut kodu girin"
                  >
                    <Input 
                      placeholder="6 haneli kod" 
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                      style={{ width: '200px' }}
                    />
                  </Form.Item>
                </Form>
                <Button 
                  type="primary" 
                  danger 
                  onClick={handleDisable} 
                  loading={loading}
                >
                  2FA'yı Devre Dışı Bırak
                </Button>
                <Divider />
                <Button 
                  type="default" 
                  icon={<ReloadOutlined />} 
                  onClick={handleGenerateBackupCodes} 
                  loading={loading}
                >
                  Yeni Yedek Kodlar Oluştur
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Alert
                message="İki faktörlü kimlik doğrulama devre dışı"
                description="Hesabınızı korumak için iki faktörlü kimlik doğrulamayı etkinleştirmenizi öneririz."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
              <Button type="primary" onClick={handleSetup} loading={loading}>
                2FA Kurulumunu Başlat
              </Button>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Uygulama',
      content: (
        <div style={{ padding: '20px 0' }}>
          <Title level={4}>Kimlik Doğrulayıcı Uygulamanızı Ayarlayın</Title>
          <Paragraph>
            Google Authenticator, Microsoft Authenticator veya Authy gibi bir kimlik doğrulayıcı uygulamasına ihtiyacınız var.
            Uygulamayı açın ve QR kodunu tarayın veya gizli anahtarı manuel olarak girin.
          </Paragraph>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
            {qrCode && (
              <div style={{ textAlign: 'center', marginRight: 40 }}>
                <div style={{ border: '1px solid #d9d9d9', padding: 10, marginBottom: 10 }}>
                  <img src={qrCode} alt="QR Kodu" style={{ width: 200, height: 200 }} />
                </div>
                <Text type="secondary">QR Kodunu Tarayın</Text>
              </div>
            )}
            
            {secret && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  border: '1px solid #d9d9d9', 
                  padding: '15px 20px', 
                  marginBottom: 10,
                  borderRadius: 4,
                  background: '#f5f5f5',
                  fontSize: 18,
                  letterSpacing: 2,
                  position: 'relative',
                  width: 240
                }}>
                  <Text code copyable style={{ fontSize: 16 }}>{secret}</Text>
                </div>
                <Text type="secondary">veya Gizli Anahtarı Kullanın</Text>
              </div>
            )}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: 30 }}>
            <Form layout="vertical" style={{ maxWidth: 300, margin: '0 auto' }}>
              <Form.Item
                label="Doğrulama kodu"
                extra="Uygulamada görünen 6 haneli kodu girin"
              >
                <Input 
                  placeholder="6 haneli kod" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </Form.Item>
            </Form>
            
            <Button type="primary" onClick={handleVerify} loading={loading}>
              Doğrula ve Etkinleştir
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: 'Tamamla',
      content: (
        <div style={{ padding: '20px 0', textAlign: 'center' }}>
          <Title level={4}>İki Faktörlü Kimlik Doğrulama Etkinleştirildi</Title>
          
          <Alert
            message="2FA başarıyla etkinleştirildi!"
            description="Artık hesabınız daha güvenli. Her girişte kimlik doğrulayıcı uygulamanızdan alacağınız kod gerekecek."
            type="success"
            showIcon
            style={{ marginBottom: 24, textAlign: 'left' }}
          />
          
          <Divider>Yedek Kodlar</Divider>
          
          <Paragraph style={{ textAlign: 'left' }}>
            Telefonunuzu kaybederseniz veya uygulamaya erişemezseniz, bu yedek kodları kullanarak hesabınıza erişebilirsiniz.
            Her kod <strong>sadece bir kez kullanılabilir</strong>. Bu kodları güvenli bir yerde saklayın!
          </Paragraph>
          
          <List
            bordered
            style={{ marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}
            dataSource={backupCodes.slice(0, 3)}
            renderItem={(code) => (
              <List.Item actions={[
                <Tooltip title="Kopyala">
                  <Button 
                    icon={<CopyOutlined />} 
                    onClick={() => copyToClipboard(code)}
                    type="text"
                  />
                </Tooltip>
              ]}>
                <Text code>{code}</Text>
              </List.Item>
            )}
            footer={
              <Button 
                type="link" 
                onClick={() => setBackupCodesVisible(true)}
              >
                Tüm kodları görüntüle ({backupCodes.length})
              </Button>
            }
          />
          
          <Space>
            <Button type="primary" onClick={handleFinish}>
              Tamamla
            </Button>
          </Space>
        </div>
      ),
    },
  ];

  return (
    <Card loading={loading}>
      {error && (
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      
      <Steps
        current={current}
        items={[
          { title: 'Başlat', icon: <SecurityScanOutlined /> },
          { title: 'Uygulama', icon: <QrcodeOutlined /> },
          { title: 'Tamamla', icon: <KeyOutlined /> },
        ]}
        style={{ marginBottom: 24 }}
      />
      
      <div className="steps-content">
        {steps[current].content}
      </div>
      
      {!is2FAEnabled && (
        <div className="steps-action" style={{ marginTop: 24, textAlign: 'right' }}>
          {current > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => setCurrent(current - 1)}>
              Geri
            </Button>
          )}
          
          {current === steps.length - 1 && (
            <Button type="primary" onClick={handleFinish}>
              Tamamla
            </Button>
          )}
          
          <Button style={{ margin: '0 8px' }} onClick={handleCancel}>
            İptal
          </Button>
        </div>
      )}
      
      {renderBackupCodesModal()}
    </Card>
  );
};

export default TwoFactorAuth; 