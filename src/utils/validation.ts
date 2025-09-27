// Phone number validation utility
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check if phone number has exactly 10 digits
  if (cleanPhone.length !== 10) {
    return {
      isValid: false,
      error: 'Phone number must have exactly 10 digits'
    };
  }
  
  return { isValid: true };
};

// Format phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    // Format as XXX-XXX-XXXX
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  } else if (cleanPhone.length > 10) {
    // For international numbers, just add spaces every 3-4 digits
    return cleanPhone.replace(/(\d{3,4})(?=\d)/g, '$1 ');
  }
  
  return phone; // Return original if not a standard format
};

// Real-time phone input formatter
export const formatPhoneInput = (value: string): string => {
  // Remove all non-digit characters
  const cleanValue = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const limitedValue = cleanValue.slice(0, 10);
  
  // Format based on length
  if (limitedValue.length <= 3) {
    return limitedValue;
  } else if (limitedValue.length <= 6) {
    return limitedValue.replace(/(\d{3})(\d+)/, '$1-$2');
  } else {
    return limitedValue.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
  }
};
