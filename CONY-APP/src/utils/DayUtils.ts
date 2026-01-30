const calculateDaysUntilExpiration = (expirationDate: string): number => {
  if (!expirationDate) {
    return 0;
  }
  
  const today = new Date();
  const expiration = new Date(expirationDate);
  
  // 유효하지 않은 날짜 체크
  if (isNaN(expiration.getTime())) {
    return 0;
  }
  
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // NaN 체크
  if (isNaN(diffDays)) {
    return 0;
  }
  
  return diffDays;
};

export { calculateDaysUntilExpiration };
