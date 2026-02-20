import { useState } from 'react';

export default function AuthScreen({ onAuth, T }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const handleSubmit = async () => {
    setErr('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        // Guardar código en localStorage antes del signup para procesarlo al confirmar email
        if (inviteCode.trim()) localStorage.setItem('pendingInviteCode', inviteCode.trim().toUpperCase());
        const { error } = await onAuth.signUp(email, pass, name);
        if (error) { localStorage.removeItem('pendingInviteCode'); setErr(error.message); }
        else setErr(inviteCode.trim() ? '¡Revisa tu email! Al confirmar, te unirás a la familia 👨‍👩‍👧' : '¡Revisa tu email para confirmar! 📧');
      } else {
        const { error } = await onAuth.signIn(email, pass);
        if (error) setErr(error.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : error.message);
      }
    } catch (e) {
      setErr('Error de conexión');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setErr('');
    const { error } = await onAuth.signInWithGoogle();
    if (error) setErr(error.message);
  };

  return (
    <div style={{ maxWidth: 430, margin: '0 auto', minHeight: '100vh', background: 'linear-gradient(-45deg,#FEF0EB,#DBEAFE,#FDE8F0,#E0E7FF)', backgroundSize: '400% 400%', animation: 'gradMove 8s ease infinite', fontFamily: "'Nunito',sans-serif", color: T.text, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 64, marginBottom: 8, animation: 'float 3s ease infinite' }}>👶</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1 }}>BabyTrack</h1>
        <p style={{ fontSize: 14, color: T.accent, fontWeight: 700 }}>Tracking inteligente</p>
      </div>

      {/* Google button */}
      <button onClick={handleGoogle} style={{ width: '100%', padding: 14, borderRadius: 16, background: '#fff', border: '1px solid #ddd', cursor: 'pointer', fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        Continuar con Google
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 1, background: '#ccc' }} />
        <span style={{ fontSize: 12, color: '#999' }}>o con email</span>
        <div style={{ flex: 1, height: 1, background: '#ccc' }} />
      </div>

      {mode === 'signup' && (
        <>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '2px solid #E8E5E0', fontSize: 16, outline: 'none', fontWeight: 700, background: '#fff', marginBottom: 10 }} />
          <button onClick={() => { setShowCode(!showCode); setInviteCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: showCode ? '#999' : T.accent, fontWeight: 700, textAlign: 'left', width: '100%', padding: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            🎟 {showCode ? 'Sin código de invitación' : '¿Te invitaron? Ingresa tu código'}
          </button>
          {showCode && (
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={6} style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: `2px solid ${T.accent}`, fontSize: 22, outline: 'none', fontWeight: 900, background: '#fff', marginBottom: 10, textAlign: 'center', letterSpacing: 8 }} />
          )}
        </>
      )}

      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '2px solid #E8E5E0', fontSize: 16, outline: 'none', fontWeight: 700, background: '#fff', marginBottom: 10 }} />

      <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Contraseña" onKeyDown={e => e.key === 'Enter' && handleSubmit()} style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: '2px solid #E8E5E0', fontSize: 16, outline: 'none', fontWeight: 700, background: '#fff', marginBottom: 10 }} />

      {err && <p style={{ fontSize: 13, color: err.includes('email') || err.includes('Revisa') ? '#10B981' : '#EF4444', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>{err}</p>}

      <button onClick={handleSubmit} disabled={loading || !email || !pass} style={{ width: '100%', padding: 16, borderRadius: 20, background: email && pass ? 'linear-gradient(135deg,#E36F47,#D4623C)' : '#ccc', color: '#fff', border: 'none', cursor: email && pass ? 'pointer' : 'default', fontSize: 17, fontWeight: 800, marginBottom: 12 }}>
        {loading ? '...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
      </button>

      <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); setShowCode(false); setInviteCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: T.accent, fontWeight: 700, textAlign: 'center', width: '100%' }}>
        {mode === 'login' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Entrar'}
      </button>
    </div>
  );
}
