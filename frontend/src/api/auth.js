export async function checkAuth() {
  const res = await fetch('/api/capsules');
  return res.ok;
}
