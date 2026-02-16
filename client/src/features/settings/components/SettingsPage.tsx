import { useState, useEffect, useCallback } from 'react';
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
        'bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-6',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{children}</h3>;
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-[var(--text-secondary)] mb-6">{children}</p>;
}

function FormLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
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
          'w-full px-3.5 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg',
          'text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]',
          'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30',
          'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
        'transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-[var(--bg-primary)]',
        checked ? 'bg-primary-600' : 'bg-[var(--border-color)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0',
          'transform transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
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
        'flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg',
        'font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
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
    <div className="space-y-6 animate-fadeIn">
      {/* Avatar section */}
      <SectionCard>
        <SectionTitle>Profile Photo</SectionTitle>
        <SectionDescription>This is displayed across the CRM alongside your name.</SectionDescription>

        <div className="flex items-center gap-6">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${firstName} ${lastName}`}
              className="w-20 h-20 rounded-full object-cover border-2 border-[var(--border-color)]"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold select-none">
              {initials}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <FormLabel htmlFor="avatarUrl">Image URL</FormLabel>
            <FormInput
              id="avatarUrl"
              value={avatarUrl}
              onChange={setAvatarUrl}
              placeholder="https://example.com/avatar.jpg"
            />
            <p className="text-xs text-[var(--text-tertiary)]">
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
      className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      tabIndex={-1}
    >
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
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

          <hr className="border-[var(--border-color)]" />

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
              <p className="text-xs text-red-500 mt-1">Password must be at least 8 characters.</p>
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
              <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
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
    <div className="space-y-6 animate-fadeIn">
      {/* Theme */}
      <SectionCard>
        <SectionTitle>Theme</SectionTitle>
        <SectionDescription>Choose between light and dark appearance for the interface.</SectionDescription>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Moon className="w-5 h-5 text-indigo-400" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Sun className="w-5 h-5 text-amber-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
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
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center">
              {sidebarCollapsed ? (
                <PanelLeftClose className="w-5 h-5 text-[var(--text-secondary)]" />
              ) : (
                <PanelLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {sidebarCollapsed ? 'Sidebar Collapsed' : 'Sidebar Expanded'}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
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
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                  selected
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--text-tertiary)]',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    selected ? 'bg-primary-500/10' : 'bg-[var(--bg-primary)]',
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5',
                      selected ? 'text-primary-500' : 'text-[var(--text-tertiary)]',
                    )}
                  />
                </div>
                <p
                  className={cn(
                    'text-sm font-medium',
                    selected ? 'text-primary-500' : 'text-[var(--text-primary)]',
                  )}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] leading-snug">{opt.description}</p>
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
    <div className="space-y-6 animate-fadeIn">
      <SectionCard>
        <SectionTitle>Notification Preferences</SectionTitle>
        <SectionDescription>
          Choose which notifications you would like to receive. Changes are saved automatically.
        </SectionDescription>

        <div className="divide-y divide-[var(--border-color)]">
          {NOTIFICATION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isOn = prefs[opt.key];
            return (
              <div key={opt.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      isOn ? 'bg-primary-500/10' : 'bg-[var(--bg-secondary)]',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-5 h-5',
                        isOn ? 'text-primary-500' : 'text-[var(--text-tertiary)]',
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{opt.label}</p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">{opt.description}</p>
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
          <div className="w-10 h-10 rounded-xl bg-primary-600/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage your account, preferences, and notifications
            </p>
          </div>
        </div>
      </div>

      {/* Layout: sidebar tabs + content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tab Navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-1.5 flex lg:flex-col gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all w-full',
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]',
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
        <div className="flex-1 min-w-0">{renderContent()}</div>
      </div>
    </div>
  );
}
