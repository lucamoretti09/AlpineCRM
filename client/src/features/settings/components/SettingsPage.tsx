import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import {
  User,
  Lock,
  Palette,
  Bell,
  Save,
  Camera,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  Rows3,
  Rows4,
  SquareStack,
  Mail,
  BellRing,
  CheckSquare,
  Handshake,
  Ticket,
  Eye,
  EyeOff,
  Loader2,
  Settings,
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabId = 'profile' | 'account' | 'appearance' | 'notifications';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

type DisplayDensity = 'compact' | 'comfortable' | 'spacious';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  dealUpdates: boolean;
  ticketAssignments: boolean;
}

const TABS: Tab[] = [
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'account', label: 'Cont', icon: Lock },
  { id: 'appearance', label: 'Aspect', icon: Palette },
  { id: 'notifications', label: 'Notificări', icon: Bell },
];

const DENSITY_OPTIONS: { value: DisplayDensity; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'compact', label: 'Compact', description: 'Spațiere redusă, mai mult conținut vizibil', icon: Rows4 },
  { value: 'comfortable', label: 'Standard', description: 'Spațiere echilibrată pentru utilizare zilnică', icon: Rows3 },
  { value: 'spacious', label: 'Confortabil', description: 'Spațiere generoasă, mai ușor de parcurs', icon: SquareStack },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadNotificationPrefs(): NotificationPreferences {
  try {
    const stored = localStorage.getItem('alpine-notification-prefs');
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore parse errors
  }
  return {
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    dealUpdates: true,
    ticketAssignments: true,
  };
}

function saveNotificationPrefs(prefs: NotificationPreferences) {
  localStorage.setItem('alpine-notification-prefs', JSON.stringify(prefs));
}

function loadDensity(): DisplayDensity {
  const stored = localStorage.getItem('alpine-display-density');
  if (stored === 'compact' || stored === 'comfortable' || stored === 'spacious') return stored;
  return 'comfortable';
}

function saveDensity(d: DisplayDensity) {
  localStorage.setItem('alpine-display-density', d);
}

const DENSITY_LABEL_MAP: Record<string, string> = {
  compact: 'Compact',
  comfortable: 'Standard',
  spacious: 'Confortabil',
};

// ---------------------------------------------------------------------------
// Sub-components: shared
// ---------------------------------------------------------------------------

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-7',
        'hover:border-[var(--border-color)]/80 transition-all duration-300',
        'group/card',
        className,
      )}
    >
      {/* Subtle top accent line on hover */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/0 to-transparent group-hover/card:via-indigo-500/20 transition-all duration-500 rounded-full" />
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] mb-1">{children}</h3>;
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] text-[var(--text-secondary)] mb-6 leading-relaxed">{children}</p>;
}

function FormLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
      {children}
    </label>
  );
}

function FormInput({
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
  rightElement,
}: {
  id?: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
  rightElement?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={cn(
          'w-full px-3.5 py-3 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl',
          'text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'focus:outline-none focus:border-primary-500/40 focus:ring-2 focus:ring-primary-500/10',
          'transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
          rightElement && 'pr-11',
        )}
      />
      {rightElement && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
      )}
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
        checked ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-[var(--border-color)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-6 w-6 rounded-full bg-white ring-0',
          'transform transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
          checked ? 'translate-x-7 shadow-lg shadow-indigo-500/30' : 'translate-x-0 shadow-md',
        )}
      />
    </button>
  );
}

function SaveButton({
  onClick,
  loading,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        'flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl',
        'text-[15px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25',
        'transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
      {loading ? 'Se salvează...' : 'Salvează Modificările'}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Profile Tab
// ---------------------------------------------------------------------------

function ProfileTab() {
  const { user, setUser } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);

  // Sync form when user changes (e.g. after a fresh fetch)
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const initials =
    firstName && lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : '??';

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast.error('Prenumele, numele și emailul sunt obligatorii.');
      return;
    }
    setSaving(true);
    try {
      const payload = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim(), avatarUrl: avatarUrl.trim() };
      const { data } = await api.put('/auth/me', payload);
      const updated = data.data ?? { ...user, ...payload };
      setUser(updated);
      toast.success('Profil actualizat cu succes.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Actualizarea profilului a eșuat.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Avatar section */}
      <SectionCard>
        <SectionTitle>Fotografie Profil</SectionTitle>
        <SectionDescription>Aceasta este afișată în tot CRM-ul alături de numele tău.</SectionDescription>

        <div className="flex items-center gap-6">
          {/* Avatar with animated gradient ring */}
          <div className="relative group/avatar">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-50 group-hover/avatar:opacity-80 blur-sm transition-all duration-500 animate-[spin_6s_linear_infinite]" style={{ backgroundSize: '200% 200%', animation: 'gradient-spin 4s linear infinite' }} />
            <div className="absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-60 group-hover/avatar:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={`${firstName} ${lastName}`}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white dark:border-gray-900 shadow-lg relative z-10"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold select-none shadow-lg shadow-indigo-500/20 border-2 border-white dark:border-gray-900 relative z-10">
                  {initials}
                </div>
              )}
            </div>
            {/* Camera overlay */}
            <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover/avatar:bg-black/30 transition-all duration-300 flex items-center justify-center z-20 cursor-pointer">
              <Camera className="w-6 h-6 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <FormLabel htmlFor="avatarUrl">URL Imagine</FormLabel>
            <FormInput
              id="avatarUrl"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://exemplu.com/avatar.jpg"
            />
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Lipește un link direct către imaginea de profil. Dimensiune recomandată: 256 x 256px.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard>
        <SectionTitle>Informații Personale</SectionTitle>
        <SectionDescription>Actualizează numele, emailul și telefonul.</SectionDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FormLabel htmlFor="firstName">Prenume</FormLabel>
            <FormInput id="firstName" value={firstName} onChange={setFirstName} placeholder="Ion" />
          </div>
          <div>
            <FormLabel htmlFor="lastName">Nume</FormLabel>
            <FormInput id="lastName" value={lastName} onChange={setLastName} placeholder="Popescu" />
          </div>
          <div>
            <FormLabel htmlFor="email">Adresă Email</FormLabel>
            <FormInput id="email" type="email" value={email} onChange={setEmail} placeholder="ion@companie.ro" />
          </div>
          <div>
            <FormLabel htmlFor="phone">Număr Telefon</FormLabel>
            <FormInput id="phone" type="tel" value={phone} onChange={setPhone} placeholder="+40 (700) 000-000" />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <SaveButton onClick={handleSave} loading={saving} />
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account Tab
// ---------------------------------------------------------------------------

function AccountTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const passwordsMatch = newPassword === confirmNewPassword;
  const isValid = currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch;

  const handleSave = async () => {
    if (!isValid) {
      if (!passwordsMatch) {
        toast.error('Parolele nu se potrivesc.');
      } else if (newPassword.length < 8) {
        toast.error('Parola trebuie să aibă minim 8 caractere.');
      }
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword, confirmNewPassword });
      toast.success('Parola a fost schimbată cu succes.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Schimbarea parolei a eșuat.');
    } finally {
      setSaving(false);
    }
  };

  const visibilityToggle = (show: boolean, toggle: () => void) => (
    <button
      type="button"
      onClick={toggle}
      className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-200"
      tabIndex={-1}
    >
      {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
      <SectionCard>
        <SectionTitle>Schimbă Parola</SectionTitle>
        <SectionDescription>
          Asigură-te că contul tău rămâne securizat folosind o parolă puternică și unică.
        </SectionDescription>

        <div className="max-w-md space-y-5">
          <div>
            <FormLabel htmlFor="currentPassword">Parola Curentă</FormLabel>
            <FormInput
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Introdu parola curentă"
              autoComplete="current-password"
              rightElement={visibilityToggle(showCurrent, () => setShowCurrent(!showCurrent))}
            />
          </div>

          <div className="relative">
            <hr className="border-[var(--border-color)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white dark:bg-[var(--bg-primary)] px-2 text-[12px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">Parolă Nouă</span>
            </div>
          </div>

          <div>
            <FormLabel htmlFor="newPassword">Parolă Nouă</FormLabel>
            <FormInput
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Minim 8 caractere"
              autoComplete="new-password"
              rightElement={visibilityToggle(showNew, () => setShowNew(!showNew))}
            />
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                Parola trebuie să aibă minim 8 caractere.
              </p>
            )}
          </div>

          <div>
            <FormLabel htmlFor="confirmNewPassword">Confirmă Parola Nouă</FormLabel>
            <FormInput
              id="confirmNewPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              placeholder="Re-introdu parola nouă"
              autoComplete="new-password"
              rightElement={visibilityToggle(showConfirm, () => setShowConfirm(!showConfirm))}
            />
            {confirmNewPassword.length > 0 && !passwordsMatch && (
              <p className="text-[13px] text-red-500 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                Parolele nu se potrivesc.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <SaveButton onClick={handleSave} loading={saving} disabled={!isValid} />
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Appearance Tab
// ---------------------------------------------------------------------------

function AppearanceTab() {
  const { isDark, toggleTheme, sidebarCollapsed, toggleSidebar } = useThemeStore();
  const [density, setDensity] = useState<DisplayDensity>(loadDensity);

  const handleDensityChange = useCallback((d: DisplayDensity) => {
    setDensity(d);
    saveDensity(d);
    toast.success(`Densitatea afișării setată la ${DENSITY_LABEL_MAP[d] ?? d}.`);
  }, []);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Theme */}
      <SectionCard>
        <SectionTitle>Temă</SectionTitle>
        <SectionDescription>Alege între aspect luminos și întunecat pentru interfață.</SectionDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500',
                isDark ? 'bg-indigo-500/10' : 'bg-amber-500/10',
              )}
            >
              {isDark ? (
                <Moon className="w-6 h-6 text-indigo-400 transition-transform duration-500" />
              ) : (
                <Sun className="w-6 h-6 text-amber-500 transition-transform duration-500" />
              )}
            </div>
            <div>
              <p className="text-[15px] font-medium text-[var(--text-primary)]">
                {isDark ? 'Mod Întunecat' : 'Mod Luminos'}
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)]">
                {isDark ? 'Mai ușor pentru ochi în medii cu lumină slabă' : 'Interfață clasică luminoasă'}
              </p>
            </div>
          </div>
          <ToggleSwitch checked={isDark} onChange={toggleTheme} />
        </div>
      </SectionCard>

      {/* Sidebar */}
      <SectionCard>
        <SectionTitle>Bară Laterală</SectionTitle>
        <SectionDescription>Controlează bara de navigare laterală.</SectionDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--bg-secondary)]/60 flex items-center justify-center transition-all duration-300">
              {sidebarCollapsed ? (
                <PanelLeftClose className="w-6 h-6 text-[var(--text-secondary)] transition-transform duration-300" />
              ) : (
                <PanelLeft className="w-6 h-6 text-[var(--text-secondary)] transition-transform duration-300" />
              )}
            </div>
            <div>
              <p className="text-[15px] font-medium text-[var(--text-primary)]">
                {sidebarCollapsed ? 'Bară Laterală Restrânsă' : 'Bară Laterală Extinsă'}
              </p>
              <p className="text-[13px] text-[var(--text-tertiary)]">
                {sidebarCollapsed
                  ? 'Bara laterală afișează doar pictograme'
                  : 'Bara laterală afișează etichete complete de navigare'}
              </p>
            </div>
          </div>
          <ToggleSwitch checked={sidebarCollapsed} onChange={toggleSidebar} />
        </div>
      </SectionCard>

      {/* Display Density */}
      <SectionCard>
        <SectionTitle>Densitate Afișare</SectionTitle>
        <SectionDescription>Ajustează spațierea elementelor din interfață.</SectionDescription>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DENSITY_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const selected = density === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleDensityChange(opt.value)}
                className={cn(
                  'relative flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-300 text-center group/density',
                  selected
                    ? 'border-indigo-500 bg-indigo-500/5 shadow-lg shadow-indigo-500/10'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/40 hover:border-[var(--text-tertiary)]/50 hover:bg-[var(--bg-secondary)]/60',
                )}
              >
                {/* Selected indicator accent */}
                {selected && (
                  <div className="absolute top-0 left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent rounded-full" />
                )}
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                    selected ? 'bg-indigo-500/10 scale-110' : 'bg-[var(--bg-primary)] group-hover/density:scale-105',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-6 h-6 transition-colors duration-300',
                      selected ? 'text-indigo-500' : 'text-[var(--text-tertiary)]',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-[15px] font-semibold transition-colors duration-300',
                    selected ? 'text-indigo-500' : 'text-[var(--text-primary)]',
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-[13px] text-[var(--text-tertiary)] leading-snug">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Notifications Tab
// ---------------------------------------------------------------------------

interface NotificationOptionConfig {
  key: keyof NotificationPreferences;
  label: string;
  description: string;
  icon: React.ElementType;
}

const NOTIFICATION_OPTIONS: NotificationOptionConfig[] = [
  {
    key: 'emailNotifications',
    label: 'Notificări Email',
    description: 'Primește actualizări importante și rezumate ale activității prin email',
    icon: Mail,
  },
  {
    key: 'pushNotifications',
    label: 'Notificări Push',
    description: 'Primește notificări în timp real în browser pentru evenimente critice',
    icon: BellRing,
  },
  {
    key: 'taskReminders',
    label: 'Memento-uri Sarcini',
    description: 'Memento-uri pentru sarcinile viitoare și întârziate atribuite ție',
    icon: CheckSquare,
  },
  {
    key: 'dealUpdates',
    label: 'Actualizări Tranzacții',
    description: 'Notificări când tranzacțiile tale schimbă etapa sau statusul',
    icon: Handshake,
  },
  {
    key: 'ticketAssignments',
    label: 'Atribuiri Tichete',
    description: 'Alerte când un tichet de suport ți se atribuie',
    icon: Ticket,
  },
];

function NotificationsTab() {
  const [prefs, setPrefs] = useState<NotificationPreferences>(loadNotificationPrefs);

  const toggle = useCallback(
    (key: keyof NotificationPreferences) => {
      setPrefs((prev) => {
        const updated = { ...prev, [key]: !prev[key] };
        saveNotificationPrefs(updated);
        return updated;
      });
    },
    [],
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
      <SectionCard>
        <SectionTitle>Preferințe Notificări</SectionTitle>
        <SectionDescription>
          Alege ce notificări dorești să primești. Modificările sunt salvate automat.
        </SectionDescription>

        <div className="divide-y divide-[var(--border-color)]/60">
          {NOTIFICATION_OPTIONS.map((opt, index) => {
            const Icon = opt.icon;
            const isOn = prefs[opt.key];
            return (
              <div
                key={opt.key}
                className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                      isOn ? 'bg-indigo-500/10 shadow-sm shadow-indigo-500/10' : 'bg-[var(--bg-secondary)]/60',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-all duration-300',
                        isOn ? 'text-indigo-500 scale-100' : 'text-[var(--text-tertiary)] scale-90',
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[var(--text-primary)]">{opt.label}</p>
                    <p className="text-[13px] text-[var(--text-tertiary)] truncate">{opt.description}</p>
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <ToggleSwitch checked={isOn} onChange={() => toggle(opt.key)} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main SettingsPage
// ---------------------------------------------------------------------------

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ top: number; height: number; opacity: number }>({ top: 0, height: 0, opacity: 0 });
  const [indicatorStyleH, setIndicatorStyleH] = useState<{ left: number; width: number; opacity: number }>({ left: 0, width: 0, opacity: 0 });

  // Animated indicator position calculation
  const updateIndicator = useCallback(() => {
    const btn = tabRefs.current[activeTab];
    const nav = navRef.current;
    if (!btn || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();

    // Vertical indicator for lg+ screens
    setIndicatorStyle({
      top: btnRect.top - navRect.top,
      height: btnRect.height,
      opacity: 1,
    });

    // Horizontal indicator for smaller screens
    setIndicatorStyleH({
      left: btnRect.left - navRect.left,
      width: btnRect.width,
      opacity: 1,
    });
  }, [activeTab]);

  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'account':
        return <AccountTab />;
      case 'appearance':
        return <AppearanceTab />;
      case 'notifications':
        return <NotificationsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div>
        <p className="text-[14px] text-[var(--text-secondary)]">
          Gestionează contul, preferințele și notificările
        </p>
      </div>

      {/* Layout: sidebar tabs + content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation with animated indicator */}
        <nav className="lg:w-60 flex-shrink-0">
          <div
            ref={navRef}
            className="relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-1.5 flex lg:flex-col gap-1"
          >
            {/* Animated indicator - vertical (lg+) */}
            <div
              className="absolute left-1.5 right-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hidden lg:block z-0"
              style={{
                top: indicatorStyle.top,
                height: indicatorStyle.height,
                opacity: indicatorStyle.opacity,
              }}
            />
            {/* Animated indicator - horizontal (< lg) */}
            <div
              className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden z-0"
              style={{
                left: indicatorStyleH.left,
                width: indicatorStyleH.width,
                opacity: indicatorStyleH.opacity,
              }}
            />
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[tab.id] = el; }}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative z-10 flex items-center gap-2.5 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 w-full',
                    isActive
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)]',
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 min-w-0" key={activeTab}>{renderContent()}</div>
      </div>
    </div>
  );
}
