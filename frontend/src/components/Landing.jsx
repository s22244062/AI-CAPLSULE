function Landing({ onLogin }) {
  return (
        <div className="page">
      <div className="brand" style={{ marginBottom: '28px' }}>
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="2" y="2" width="24" height="24" rx="12" fill="url(#capsuleGradient)" stroke="#7CF29C" strokeWidth="1.5"/>
          <path d="M14 2V26" stroke="#17102B" strokeWidth="1.5"/>
          <defs>
            <linearGradient id="capsuleGradient" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop stopColor="#7CF29C"/>
              <stop offset="1" stopColor="#4FD67C"/>
            </linearGradient>
          </defs>
        </svg>
                <span className="brand-text">AI Capsule</span>
      </div>
      <h1 style={{ fontSize: '44px', lineHeight: 1.15, marginBottom: '20px' }}>
        Your AI prompts, kept somewhere that isn't a random notes app.
      </h1>
      <p style={{ fontSize: '17px', marginBottom: '32px' }}>
        AI Capsule is a private prompt library for saving, reviewing, and improving
        the prompts you use for coding, writing, debugging, and study.
      </p>
      <button className="btn-primary" onClick={onLogin}>
        Log in with Google
      </button>
    </div>
  );
}

export default Landing;
