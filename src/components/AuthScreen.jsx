import { useState } from 'react';

export default function AuthScreen({ onAuth, T }) {
  const [mode, setMode] = useState('login'); // login | signup | invitation
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [showCode, setShowCode] = useState(false);

  const glInput = {
    width: '100%', boxSizing: 'border-box',
    padding: '15px 18px', borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.78)',
    fontSize: 16, outline: 'none', fontWeight: 600,
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    color: T.text, fontFamily: "'Nunito',sans-serif",
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.95), 0 2px 8px rgba(0,0,0,0.04)',
  };

  const isSuccess = err.includes('Revisa') || err.includes('creada') || err.includes('confirmar');

  const switchMode = newMode => {
    setMode(newMode); setErr('');
    setEmail(''); setPass(''); setName('');
    if (newMode !== 'signup') { setShowCode(false); setInviteCode(''); }
  };

  const handleSubmit = async () => {
    setErr(''); setLoading(true);
    try {
      if (mode === 'signup') {
        if (inviteCode.trim()) localStorage.setItem('pendingInviteCode', inviteCode.trim().toUpperCase());
        const { error } = await onAuth.signUp(email, pass, name);
        if (error) { localStorage.removeItem('pendingInviteCode'); setErr(error.message); }
        else setErr(inviteCode.trim() ? '¡Cuenta creada! Al confirmar tu correo te unirás a la familia 👨‍👩‍👧' : '¡Cuenta creada! Revisa tu correo para confirmar 📧');
      } else {
        const { error } = await onAuth.signIn(email, pass);
        if (error) setErr(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos' : error.message);
      }
    } catch { setErr('Error de conexión'); }
    setLoading(false);
  };

  const handleJoin = () => {
    if (!inviteCode.trim()) return;
    // Pre-fill invite code and go to signup
    setMode('signup');
    setShowCode(true);
  };

  const canSubmit = mode === 'invitation' ? inviteCode.trim().length === 6 : (email && pass);

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: 'linear-gradient(-45deg,#FEF0EB,#DBEAFE,#FDE8F0,#E0E7FF)',
      backgroundSize: '400% 400%', animation: 'gradMove 8s ease infinite',
      fontFamily: "'Nunito',sans-serif", color: T.text,
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '32px 20px',
    }}>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 64, marginBottom: 6, animation: 'float 3s ease infinite', display: 'inline-block' }}>👶</div>
        <h1 style={{ fontSize: 30, fontWeight: 900, letterSpacing: -0.5, margin: '0 0 4px' }}>BabyTrack</h1>
        <p style={{ fontSize: 13, color: T.accent, fontWeight: 700, margin: 0 }}>Tracking inteligente</p>
      </div>

      {/* Glass card */}
      <div style={{
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        background: 'rgba(255,255,255,0.52)',
        border: '1px solid rgba(255,255,255,0.85)',
        borderRadius: 28,
        boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
        padding: '28px 24px 24px',
      }}>

        {/* Fields — re-mounts with animation on mode change */}
        <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp 0.3s ease' }}>

          {/* ── LOGIN ── */}
          {mode === 'login' && <>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Tu correo electrónico" style={glInput} />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="Tu contraseña" onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={glInput} />
          </>}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && <>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="¿Cómo te llamas?" style={glInput} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Tu correo electrónico" style={glInput} />
            <input type="password" value={pass} onChange={e => setPass(e.target.value)}
              placeholder="Tu contraseña" onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={glInput} />

            {/* Invite code toggle */}
            {!showCode
              ? <button onClick={() => setShowCode(true)} style={{
                  background: 'rgba(227,111,71,0.08)', border: '1px solid rgba(227,111,71,0.22)',
                  borderRadius: 14, cursor: 'pointer', padding: '10px 0',
                  fontSize: 13, color: T.accent, fontWeight: 700, textAlign: 'center', width: '100%',
                  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
                }}>
                  🎟 ¿Tienes código de invitación?
                </button>
              : <>
                  <div style={{ position: 'relative' }}>
                    <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="ABC123" maxLength={6}
                      style={{ ...glInput, fontSize: 26, fontWeight: 900, textAlign: 'center', letterSpacing: 12, border: '1.5px solid rgba(227,111,71,0.45)' }} />
                  </div>
                  <button onClick={() => { setShowCode(false); setInviteCode(''); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 12, color: '#aaa', textAlign: 'center', padding: '0 0 2px',
                  }}>
                    Sin código de invitación
                  </button>
                </>
            }
          </>}

          {/* ── INVITATION ── */}
          {mode === 'invitation' && <>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <p style={{ fontSize: 16, fontWeight: 900, margin: '0 0 6px' }}>🎟 Código de invitación</p>
              <p style={{ fontSize: 13, color: T.soft, margin: 0, fontWeight: 600 }}>
                Ingresa el código de 6 caracteres que te enviaron
              </p>
            </div>
            <input value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123" maxLength={6}
              style={{ ...glInput, fontSize: 28, fontWeight: 900, textAlign: 'center', letterSpacing: 14, border: '1.5px solid rgba(227,111,71,0.45)' }} />
          </>}

        </div>

        {/* Error / success */}
        {err && (
          <div style={{
            marginTop: 14, padding: '11px 16px', borderRadius: 14, textAlign: 'center',
            background: isSuccess ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
            border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.28)' : 'rgba(239,68,68,0.28)'}`,
            fontSize: 13, fontWeight: 700,
            color: isSuccess ? '#059669' : '#DC2626',
            animation: 'fadeUp 0.2s ease',
          }}>
            {err}
          </div>
        )}

        {/* Main button */}
        <button
          onClick={mode === 'invitation' ? handleJoin : handleSubmit}
          disabled={loading || !canSubmit}
          style={{
            width: '100%', marginTop: 16, padding: '16px', borderRadius: 22,
            background: canSubmit ? 'linear-gradient(135deg,#E36F47,#D4623C)' : 'rgba(200,195,190,0.55)',
            color: '#fff', border: 'none',
            cursor: canSubmit ? 'pointer' : 'default',
            fontSize: 17, fontWeight: 800,
            boxShadow: canSubmit ? '0 4px 20px rgba(227,111,71,0.32), inset 0 1px 0 rgba(255,255,255,0.22)' : 'none',
            transition: 'background 0.25s, box-shadow 0.25s',
            fontFamily: "'Nunito',sans-serif",
          }}
        >
          {loading ? '…'
            : mode === 'login' ? 'Iniciar sesión'
            : mode === 'signup' ? 'Crear mi cuenta'
            : 'Continuar →'}
        </button>

        {/* Secondary links */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {mode !== 'invitation' && (
            <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: T.accent, fontWeight: 700, textAlign: 'center',
            }}>
              {mode === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          )}

          {mode === 'login' && (
            <button onClick={() => switchMode('invitation')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: T.soft, fontWeight: 600, textAlign: 'center',
            }}>
              ¿Tienes un código de invitación?
            </button>
          )}

          {mode === 'invitation' && (
            <button onClick={() => switchMode('login')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, color: T.soft, fontWeight: 600, textAlign: 'center',
            }}>
              ← Volver al inicio de sesión
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
