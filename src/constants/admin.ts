export const SYSTEM_ADMIN_EMAILS = [
  'sheriffdeenalade@gmail.com',
  'sheriff.saka@cloudcraves.com'
];

export const isSystemAdmin = (email?: string) => {
  if (!email) return false;
  return SYSTEM_ADMIN_EMAILS.includes(email.toLowerCase());
};
