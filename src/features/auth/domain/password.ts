export interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

// Reglas de seguridad de contraseña (las mismas que valida el backend al restablecerla)
export const PASSWORD_RULES: readonly PasswordRule[] = [
  { label: 'Mínimo 8 caracteres', test: (p) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p) => /[A-Z]/.test(p) },
  { label: 'Al menos un número', test: (p) => /\d/.test(p) },
]

/** Primera regla que no cumple la contraseña, o null si las cumple todas. */
export const firstFailedRule = (password: string): PasswordRule | null =>
  PASSWORD_RULES.find(r => !r.test(password)) ?? null

export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
