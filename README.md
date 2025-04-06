# 🎯 Kampüs Etkinlik Yönetim Sistemi

<div align="center">
  <img src="public/assets/digital_events.jpg" alt="Etkinlik Yönetim Sistemi" width="800"/>
  <p><i>Kampüs etkinliklerini yönetmenin yeni ve modern yolu</i></p>
</div>

## 📋 Proje Hakkında

Kampüs Etkinlik Yönetim Sistemi, üniversite kampüslerindeki kulüp ve etkinliklerin organizasyonunu dijitalleştiren, **tam kapsamlı bir web uygulamasıdır**. Bu platform, etkinlik yönetimini merkezi bir sistemde toplayarak hem yöneticilerin hem de öğrencilerin deneyimini optimize etmektedir.

### 🌟 Temel Özellikler

- **Kulüp Yönetimi:** Kulüplerin oluşturulması, düzenlenmesi ve takibi
- **Etkinlik Organizasyonu:** Etkinliklerin planlanması, duyurulması ve katılımcı yönetimi
- **Öğrenci Katılımı:** Öğrencilerin etkinliklere kayıt olması ve bekleme listesi sistemi
- **Yönetici Paneli:** Kapsamlı raporlama ve yönetim araçları
- **Bildirim Sistemi:** Gerçek zamanlı bildirimler ve hatırlatmalar

<div align="center">
  <img src="public/assets/campus.jpg" alt="Kampüs Görünümü" width="800"/>
  <p><i>Modern kampüs yaşamını dijitalleştiriyoruz</i></p>
</div>

## 🚀 Teknoloji Yığını

Bu proje, modern web geliştirme teknolojilerinin zengin bir kombinasyonunu kullanmaktadır:

### 🖥️ Frontend
- **React:** Dinamik kullanıcı arayüzü
- **Material UI:** Modern ve duyarlı tasarım
- **React Router:** İstemci tarafı yönlendirme
- **Axios:** API istekleri
- **Framer Motion:** Akıcı ve profesyonel animasyonlar
- **React Toastify:** Kullanıcı bildirimleri
- **React DatePicker & MUI X Date Pickers:** Tarih ve zaman seçicileri
- **React Quill:** Zengin metin düzenleme

### ⚙️ Uygulama Mimarisi
- **Context API:** Durum yönetimi
- **Protected Routes:** Kimlik doğrulama ve yetkilendirme
- **Responsive Design:** Tüm cihazlarda uyumlu çalışma
- **Vite:** Hızlı geliştirme ortamı

<div align="center">
  <img src="public/assets/digital_events2.jpg" alt="Dijital Etkinlikler" width="800"/>
  <p><i>Etkinlik yönetiminin geleceği, bugün burada</i></p>
</div>

## 🔍 Temel Modüller

### 👥 Kullanıcı Yönetimi
- Kayıt ve giriş sistemi
- Profil yönetimi
- Rol tabanlı erişim kontrolü (öğrenci, kulüp yöneticisi, sistem yöneticisi)

### 🎭 Kulüp Yönetimi
- Kulüp profilleri
- Üye yönetimi
- Etkinlik planlama ve takip
- Bütçe izleme

### 📅 Etkinlik Yönetimi
- Etkinlik oluşturma ve düzenleme
- Katılımcı kaydı ve takibi
- Mekan rezervasyonu
- Zaman planlaması

### 📊 Raporlama ve Analizler
- Etkinlik katılım istatistikleri
- Kulüp performans raporları
- Kullanıcı katılım metrikleri
- Finansal raporlar

## 💻 Kurulum ve Çalıştırma

```bash
# Depoyu klonlayın
git clone https://github.com/BurakBerksoy/eventManagementSystem.git

# Proje dizinine gidin
cd eventManagementSystem

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev

# Tarayıcınızda http://localhost:5173 adresini açın
```

## 📱 Ekran Görüntüleri

<div align="center">
  <table>
    <tr>
      <td><img src="public/assets/digital_events.jpg" alt="Ana Sayfa" width="400"/></td>
      <td><img src="public/assets/campus.jpg" alt="Etkinlikler Sayfası" width="400"/></td>
    </tr>
    <tr>
      <td><b>Ana Sayfa</b> - Modern ve kullanıcı dostu arayüz</td>
      <td><b>Etkinlikler</b> - Kampüsteki tüm etkinlikleri görüntüleyin</td>
    </tr>
    <tr>
      <td><img src="public/assets/digital_events2.jpg" alt="Kulüp Profili" width="400"/></td>
      <td><img src="public/assets/digital_events.jpg" alt="Etkinlik Detayı" width="400"/></td>
    </tr>
    <tr>
      <td><b>Kulüp Profili</b> - Kulüp bilgileri ve etkinlikleri</td>
      <td><b>Etkinlik Detayı</b> - Detaylı etkinlik bilgileri ve katılım</td>
    </tr>
  </table>
</div>

## 🛠️ Proje Yapısı

```
/src
  /assets           # Resimler ve statik dosyalar
  /components       # Yeniden kullanılabilir UI bileşenleri
    /auth           # Kimlik doğrulama bileşenleri
    /layouts        # Sayfa düzenleri
    /notifications  # Bildirim bileşenleri
  /contexts         # React Context API
  /pages            # Ana sayfa bileşenleri
  /services         # API ve dış servis entegrasyonları
  /utils            # Yardımcı fonksiyonlar ve araçlar
  App.jsx           # Ana uygulama bileşeni
  theme.js          # Material UI tema yapılandırması
  main.jsx          # Uygulama giriş noktası
```

## 🚧 Gelecek Özellikler

- **Mobil Uygulama:** iOS ve Android için özel mobil uygulamalar
- **İleri Analitik:** Etkinlik ve kulüp başarısını ölçmek için gelişmiş analitik
- **QR Kod Entegrasyonu:** Etkinliklere giriş için QR kod tarama
- **Ödeme Entegrasyonu:** Bilet satışı ve bağış toplama 
- **Canlı Akış:** Etkinlikler için canlı video akışı

## 📄 Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Burak Berksoy** - [GitHub](https://github.com/BurakBerksoy) - [LinkedIn](https://linkedin.com/in/BurakBerksoy)

---

<div align="center">
  <p>
    <b>Kampüs etkinliklerinizi yönetmenin en akıllı yolu</b><br>
    <a href="mailto:burak.berksoy@example.com">İletişim</a> | 
    <a href="https://github.com/BurakBerksoy/eventManagementSystem/issues">Hata Bildir</a> | 
    <a href="https://github.com/BurakBerksoy/eventManagementSystem/wiki">Dokümantasyon</a>
  </p>
</div>
