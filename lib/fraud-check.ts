export async function isUserFlagged(userId: string): Promise<boolean> {
  // In production, check 'profiles.is_fraud' or similar
  // For now, assume safe
  return false;
}
