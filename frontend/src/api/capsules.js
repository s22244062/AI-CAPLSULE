export async function getCapsules() {
  const res = await fetch('/api/capsules');
  if (!res.ok) throw new Error('Failed to fetch capsules');
  return res.json();
}

export async function createCapsule(data) {
  const res = await fetch('/api/capsules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create capsule');
  return res.json();
}

export async function updateCapsule(id, data) {
  const res = await fetch(`/api/capsules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update capsule');
  return res.json();
}

export async function deleteCapsule(id) {
  const res = await fetch(`/api/capsules/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete capsule');
}
