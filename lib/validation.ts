export interface ValidationError {
  [key: string]: string;
}

export function validateLocationInput(data: any): ValidationError | null {
  const errors: ValidationError = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = "الاسم يجب أن يكون 2 أحرف على الأقل";
  }

  if (!data.city || data.city.trim().length === 0) {
    errors.city = "المدينة مطلوبة";
  }

  if (typeof data.latitude !== "number" || typeof data.longitude !== "number") {
    errors.coordinates = "الإحداثيات غير صحيحة";
  }

  if (!data.category || data.category.trim().length === 0) {
    errors.category = "الفئة مطلوبة";
  }

  if (data.photoConfidence && ![100, 90].includes(data.photoConfidence)) {
    errors.photoConfidence = "قيمة غير صحيحة";
  }

  return Object.keys(errors).length === 0 ? null : errors;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): ValidationError | null {
  const errors: ValidationError = {};

  if (password.length < 6) {
    errors.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
  }

  return Object.keys(errors).length === 0 ? null : errors;
}
