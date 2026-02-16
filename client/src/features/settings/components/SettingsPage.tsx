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
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Lock },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

const DENSITY_OPTIONS: { value: DisplayDensity; label: string; description: string; icon: React.ElementType }[] = [
  { value: 'compact', label: 'Compact', description: 'Tighter spacing, more content visible', icon: Rows4 },
  { value: 'comfortable', label: 'Comfortable', description: 'Balanced spacing for everyday use', icon: Rows3 },
  { value: 'spacious', label: 'Spacious', description: 'Generous spacing, easier to scan', icon: SquareStack },
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

// ---------------------------------------------------------------------------
// Sub-components: shared
// ---------------------------------------------------------------------------

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative bg-white/70 dark:bg-white/[0.025] backdrop-blur-xl backdrop-saturate-150 border border-[var(--border-color)] rounded-2xl p-6',
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
  return <h3 className="text-[15px] font-bold tracking-tight text-[var(--text-primary)] mb-1">{children}</h3>;
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-[12px] text-[var(--text-secondary)] mb-6 leading-relaxed">{children}</p>;
}

function FormLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5">
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
          'w-full px-3.5 py-2.5 bg-[var(--bg-secondary)]/60 border border-[var(--border-color)] rounded-xl',
          'text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
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
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
        checked ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-md shadow-indigo-500/20' : 'bg-[var(--border-color)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white ring-0',
          'transform transition-all duration-300 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]',
          checked ? 'translate-x-5 shadow-lg shadow-indigo-500/30' : 'translate-x-0 shadow-md',
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
        'flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl',
        'text-[13px] font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/25',
        'transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {loading ? 'Saving...' : 'Save Changes'}
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
      toast.error('First name, last name, and email are required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim(), phone: phone.trim(), avatarUrl: avatarUrl.trim() };
      const { data } = await api.put('/auth/me', payload);
      const updated = data.data ?? { ...user, ...payload };
      setUser(updated);
      toast.success('Profile updated successfully.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Avatar section */}
      <SectionCard>
        <SectionTitle>Profile Photo</SectionTitle>
        <SectionDescription>This is displayed across the CRM alongside your name.</SectionDescription>

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
              <Camera className="w-5 h-5 text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <FormLabel htmlFor="avatarUrl">Image URL</FormLabel>
            <FormInput
              id="avatarUrl"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Paste a direct link to your profile image. Recommended size: 256 x 256px.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Personal info */}
      <SectionCard>
        <SectionTitle>Personal Information</SectionTitle>
        <SectionDescription>Update your name, email, and phone number.</SectionDescription>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <FormInput id="firstName" value={firstName} onChange={setFirstName} placeholder="Jane" />
          </div>
          <div>
            <FormLabel htmlFor="lastName">Last Name</FormLabel>
            <FormInput id="lastName" value={lastName} onChange={setLastName} placeholder="Doe" />
          </div>
          <div>
            <FormLabel htmlFor="email">Email Address</FormLabel>
            <FormInput id="email" type="email" value={email} onChange={setEmail} placeholder="jane@company.com" />
          </div>
          <div>
            <FormLabel htmlFor="phone">Phone Number</FormLabel>
            <FormInput id="phone" type="tel" value={phone} onChange={setPhone} placeholder="+1 (555) 000-0000" />
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
        toast.error('New passwords do not match.');
      } else if (newPassword.length < 8) {
        toast.error('New password must be at least 8 characters.');
      }
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/password', { currentPassword, newPassword, confirmNewPassword });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to change password.');
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
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeInUp">
      <SectionCard>
        <SectionTitle>Change Password</SectionTitle>
        <SectionDescription>
          Ensure your account stays secure by using a strong, unique password.
        </SectionDescription>

        <div className="max-w-md space-y-5">
          <div>
            <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
            <FormInput
              id="currentPassword"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="Enter current password"
              autoComplete="current-password"
              rightElement={visibilityToggle(showCurrent, () => setShowCurrent(!showCurrent))}
            />
          </div>

          <div className="relative">
            <hr className="border-[var(--border-color)]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-white dark:bg-[var(--bg-primary)] px-2 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">New Password</span>
            </div>
          </div>

          <div>
            <FormLabel htmlFor="newPassword">New Password</FormLabel>
            <FormInput
              id="newPassword"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={setNewPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              rightElement={visibilityToggle(showNew, () => setShowNew(!showNew))}
            />
            {newPassword.length > 0 && newPassword.length < 8 && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          <div>
            <FormLabel htmlFor="confirmNewPassword">Confirm New Password</FormLabel>
            <FormInput
              id="confirmNewPassword"
              type={showConfirm ? 'text' : 'password'}
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              rightElement={visibilityToggle(showConfirm, () => setShowConfirm(!showConfirm))}
            />
            {confirmNewPassword.length > 0 && !passwordsMatch && (
              <p className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                Passwords do not match.
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
    toast.success(`Display density set to ${d}.`);
  }, []);

  return (
    <div className="space-y-6 animate-fadeInUp">
      {/* Theme */}
      <SectionCard>
        <SectionTitle>Theme</SectionTitle>
        <SectionDescription>Choose between light and dark appearance for the interface.</SectionDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500',
                isDark ? 'bg-indigo-500/10' : 'bg-amber-500/10',
              )}
            >
              {isDark ? (
                <Moon className="w-5 h-5 text-indigo-400 transition-transform duration-500" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500 transition-transform duration-500" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {isDark ? 'Easier on the eyes in low-light environments' : 'Classic bright interface'}
              </p>
            </div>
          </div>
          <ToggleSwitch checked={isDark} onChange={toggleTheme} />
        </div>
      </SectionCard>

      {/* Sidebar */}
      <SectionCard>
        <SectionTitle>Sidebar</SectionTitle>
        <SectionDescription>Control the navigation sidebar layout.</SectionDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/60 flex items-center justify-center transition-all duration-300">
              {sidebarCollapsed ? (
                <PanelLeftClose className="w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300" />
              ) : (
                <PanelLeft className="w-5 h-5 text-[var(--text-secondary)] transition-transform duration-300" />
              )}
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--text-primary)]">
                {sidebarCollapsed ? 'Sidebar Collapsed' : 'Sidebar Expanded'}
              </p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                {sidebarCollapsed
                  ? 'Sidebar shows icons only for more workspace'
                  : 'Sidebar shows full navigation labels'}
              </p>
            </div>
          </div>
          <ToggleSwitch checked={sidebarCollapsed} onChange={toggleSidebar} />
        </div>
      </SectionCard>

      {/* Display Density */}
      <SectionCard>
        <SectionTitle>Display Density</SectionTitle>
        <SectionDescription>Adjust the spacing of elements throughout the interface.</SectionDescription>

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
                  'relative flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-300 text-center group/density',
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
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300',
                    selected ? 'bg-indigo-500/10 scale-110' : 'bg-[var(--bg-primary)] group-hover/density:scale-105',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-300',
                      selected ? 'text-indigo-500' : 'text-[var(--text-tertiary)]',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-[13px] font-semibold transition-colors duration-300',
                    selected ? 'text-indigo-500' : 'text-[var(--text-primary)]',
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-snug">{opt.description}</p>
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
    label: 'Email Notifications',
    description: 'Receive important updates and activity summaries via email',
    icon: Mail,
  },
  {
    key: 'pushNotifications',
    label: 'Push Notifications',
    description: 'Get real-time browser notifications for critical events',
    icon: BellRing,
  },
  {
    key: 'taskReminders',
    label: 'Task Reminders',
    description: 'Reminders for upcoming and overdue tasks assigned to you',
    icon: CheckSquare,
  },
  {
    key: 'dealUpdates',
    label: 'Deal Updates',
    description: 'Notifications when deals you own change stage or status',
    icon: Handshake,
  },
  {
    key: 'ticketAssignments',
    label: 'Ticket Assignments',
    description: 'Alerts when a support ticket is assigned to you',
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
        <SectionTitle>Notification Preferences</SectionTitle>
        <SectionDescription>
          Choose which notifications you would like to receive. Changes are saved automatically.
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
                      'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300',
                      isOn ? 'bg-indigo-500/10 shadow-sm shadow-indigo-500/10' : 'bg-[var(--bg-secondary)]/60',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5 transition-all duration-300',
                        isOn ? 'text-indigo-500 scale-100' : 'text-[var(--text-tertiary)] scale-90',
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text-primary)]">{opt.label}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] truncate">{opt.description}</p>
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
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-indigo-500" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">Settings</h1>
            <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">
              Manage your account, preferences, and notifications
            </p>
          </div>
        </div>
      </div>

      {/* Layout: sidebar tabs + content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation with animated indicator */}
        <nav className="lg:w-56 flex-shrink-0">
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
                    'relative z-10 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 w-full',
                    isActive
                      ? 'text-white'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/60 hover:text-[var(--text-primary)]',
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
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
