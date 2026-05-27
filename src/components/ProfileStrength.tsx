'use client';

interface ProfileField {
  key: string;
  label: string;
  points: number;
  done: boolean;
  tip: string;
}

interface ProfileStrengthProps {
  fullName: string;
  trade: string;
  city: string;
  bio: string;
  phone: string;
  avatarUrl: string | null;
  avatarPreview: string | null;
  certificates: string[];
  experienceYears: number;
}

export function ProfileStrength({
  fullName, trade, city, bio, phone,
  avatarUrl, avatarPreview, certificates, experienceYears
}: ProfileStrengthProps) {

  const fields: ProfileField[] = [
    {
      key: 'name',
      label: 'Namn',
      points: 15,
      done: !!fullName.trim(),
      tip: 'Fyll i ditt fullständiga namn',
    },
    {
      key: 'trade',
      label: 'Yrkeskategori',
      points: 20,
      done: !!trade.trim(),
      tip: 'Välj ditt yrkesområde',
    },
    {
      key: 'city',
      label: 'Stad',
      points: 15,
      done: !!city.trim(),
      tip: 'Ange din stad',
    },
    {
      key: 'phone',
      label: 'Telefonnummer',
      points: 15,
      done: !!phone.trim(),
      tip: 'Lägg till ditt telefonnummer',
    },
    {
      key: 'bio',
      label: 'Bio',
      points: 15,
      done: bio.trim().length >= 30,
      tip: 'Skriv minst 30 tecken om dig själv',
    },
    {
      key: 'avatar',
      label: 'Profilbild',
      points: 10,
      done: !!(avatarUrl || avatarPreview),
      tip: 'Ladda upp en profilbild',
    },
    {
      key: 'experience',
      label: 'Erfarenhet',
      points: 5,
      done: experienceYears > 0,
      tip: 'Ange antal år erfarenhet',
    },
    {
      key: 'certificates',
      label: 'Certifikat',
      points: 5,
      done: certificates.filter(c => c.trim()).length > 0,
      tip: 'Lägg till minst ett certifikat eller utbildning',
    },
  ];

  const totalPoints = fields.reduce((sum, f) => sum + f.points, 0);
  const earnedPoints = fields.filter(f => f.done).reduce((sum, f) => sum + f.points, 0);
  const percentage = Math.round((earnedPoints / totalPoints) * 100);

  const missing = fields.filter(f => !f.done);

  let label = 'Svag';
  let color = '#ef4444';
  let bgColor = '#fee2e2';
  if (percentage >= 80) { label = 'Utmärkt'; color = '#16a34a'; bgColor = '#dcfce7'; }
  else if (percentage >= 60) { label = 'Bra'; color = '#1a5fa8'; bgColor = '#e6f1fb'; }
  else if (percentage >= 40) { label = 'OK'; color = '#f0a020'; bgColor = '#fff4e0'; }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e0eaf4',
      borderRadius: 16,
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#1a3a5c' }}>Profilstyrka</div>
        <div style={{
          fontSize: 11, fontWeight: 600, padding: '2px 10px',
          borderRadius: 99, background: bgColor, color,
        }}>
          {label} · {percentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#f5f9fd', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: percentage >= 80
            ? 'linear-gradient(90deg, #16a34a, #4ade80)'
            : percentage >= 60
            ? 'linear-gradient(90deg, #1a5fa8, #2a9fd6)'
            : percentage >= 40
            ? 'linear-gradient(90deg, #f0a020, #fbbf24)'
            : 'linear-gradient(90deg, #ef4444, #f87171)',
          borderRadius: 99,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Checkpoints */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
        {fields.map(f => (
          <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: f.done ? '#e6f1fb' : '#f5f5f5',
              color: f.done ? '#1a5fa8' : '#9ca3af',
              fontSize: 9, fontWeight: 700,
            }}>
              {f.done ? '✓' : '·'}
            </div>
            <span style={{ color: f.done ? '#1a3a5c' : '#9ca3af', textDecoration: f.done ? 'none' : 'none' }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* Next tip */}
      {missing.length > 0 && percentage < 100 && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: '#f5f9fd', border: '1px dashed #b8d0e8',
          borderRadius: 10, fontSize: 12, color: '#1a5fa8',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>💡</span>
          <span><strong>Tips:</strong> {missing[0].tip} (+{missing[0].points}p)</span>
        </div>
      )}

      {percentage === 100 && (
        <div style={{
          marginTop: 12, padding: '8px 12px',
          background: '#dcfce7', border: '1px solid #86efac',
          borderRadius: 10, fontSize: 12, color: '#16a34a',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>🎉</span>
          <span><strong>Perfekt!</strong> Din profil är helt komplett.</span>
        </div>
      )}
    </div>
  );
}
