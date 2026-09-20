import { useState, useEffect } from 'react';
import { getCapsules, createCapsule, updateCapsule, deleteCapsule } from '../api/capsules.js';
import CapsuleForm from './CapsuleForm.jsx';

function Dashboard() {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCapsule, setEditingCapsule] = useState(null);

  useEffect(() => {
    getCapsules()
      .then((data) => {
        setCapsules(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
    async function handleSave(data) {
    if (editingCapsule) {
      const updated = await updateCapsule(editingCapsule.id, data);
      setCapsules(capsules.map((c) => (c.id === updated.id ? updated : c)));
      setEditingCapsule(null);
    } else {
      const newCapsule = await createCapsule(data);
      setCapsules([newCapsule, ...capsules]);
    }
  }
  async function handleDelete(id) {
    await deleteCapsule(id);
    setCapsules(capsules.filter((c) => c.id !== id));
  }

  if (loading) {
    return <p>Loading capsules...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

    return (
    <div className="page">
      <div className="brand" style={{ marginBottom: '28px' }}>
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="12" fill="url(#capsuleGradient2)" stroke="#7CF29C" strokeWidth="1.5"/>
          <path d="M14 2V26" stroke="#17102B" strokeWidth="1.5"/>
          <defs>
            <linearGradient id="capsuleGradient2" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7CF29C"/>
              <stop offset="1" stopColor="#4FD67C"/>
            </linearGradient>
          </defs>
        </svg>
        <span className="brand-text">My AI Capsules</span>
      </div>
            <div className="panel">
        {editingCapsule && (
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: 'var(--accent)', fontSize: '14px' }}>Editing "{editingCapsule.prompt_title}"</p>
            <button className="btn-secondary" onClick={() => setEditingCapsule(null)}>Cancel</button>
          </div>
        )}
        <CapsuleForm
          key={editingCapsule ? editingCapsule.id : 'new'}
          onSubmit={handleSave}
          editingCapsule={editingCapsule}
        />
      </div>
      {capsules.length === 0 ? (
        <p>No capsules yet. Add your first one above.</p>
      ) : (
        capsules.map((capsule) => (
          <div className="capsule-card" key={capsule.id}>
            <div className="info">
              <h3>{capsule.prompt_title}</h3>
              <p>{capsule.project_name}</p>
            </div>
            <div className="actions">
              <button className="btn-secondary" onClick={() => setEditingCapsule(capsule)}>Edit</button>
              <button className="btn-danger" onClick={() => handleDelete(capsule.id)}>Delete</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;
