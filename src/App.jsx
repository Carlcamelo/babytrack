import { useAuth } from './hooks/useAuth';
import { useData } from './hooks/useData';
import AuthScreen from './components/AuthScreen';
import BabyTrack from './components/BabyTrack';

const T_LIGHT = { bg: "#F8F7F4", card: "#FFFFFF", text: "#1C1917", soft: "#78716C", accent: "#E36F47", accentL: "#FEF0EB", border: "#E8E5E0", ok: "#10B981", warn: "#F59E0B", danger: "#EF4444", glass: "rgba(255,255,255,0.85)" };

const css = `@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
@keyframes gradMove{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`;

export default function App() {
  const auth = useAuth();

  // Loading
  if (auth.loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8F7F4', fontFamily: "'Nunito',sans-serif" }}>
      <style>{css}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, animation: 'float 2s ease infinite' }}>👶</div>
        <p style={{ color: '#999', marginTop: 12, fontSize: 14 }}>Cargando...</p>
      </div>
    </div>
  );

  // Not logged in → show auth screen
  if (!auth.user) return (
    <>
      <style>{css}</style>
      <AuthScreen onAuth={auth} T={T_LIGHT} />
    </>
  );

  // Logged in → show app
  return <BabyTrackWrapper auth={auth} />;
}

function BabyTrackWrapper({ auth }) {
  const familyId = auth.profile?.family_id;
  const data = useData(familyId);

  if (data.loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8F7F4', fontFamily: "'Nunito',sans-serif" }}>
      <style>{css}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, animation: 'float 2s ease infinite' }}>👶</div>
        <p style={{ color: '#999', marginTop: 12, fontSize: 14 }}>Cargando datos...</p>
      </div>
    </div>
  );

  return <BabyTrack auth={auth} data={data} />;
}
