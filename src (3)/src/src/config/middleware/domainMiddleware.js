// ÖNCEKİ MULTI-TENANT MIDDLEWARE - ARTIK KULLANILMIYOR
// Tek veritabanı modunda bu middleware gereksizdir
// Ancak route'larda hala kullanıldığı için boş bir middleware olarak bırakıldı

export const domainMiddleware = async (req, res, next) => {
  // Artık hiçbir şey yapmıyor, sadece geçiyor
  next();
};
