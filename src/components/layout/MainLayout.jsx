import NotificationCenter from '../notifications/NotificationCenter';

// Appbar içinde kullanıcı bölümüne NotificationCenter ekleyin
{/* Kullanıcı işlemleri */}
<Box sx={{ display: 'flex', alignItems: 'center' }}>
  {/* Bildirimler */}
  {isAuthenticated && <NotificationCenter />}
  
  {/* Kullanıcı menüsü */}
  <UserMenu />
</Box> 