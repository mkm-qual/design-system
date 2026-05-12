import { useState } from 'react';
import { KeyRound, User as UserIcon, Save, CheckCircle2, Bell, Palette } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { initials } from '../lib/utils';

export default function SettingsPage() {
  const { currentUser, updateUser, changeOwnPassword } = useAuthStore();
  const [tab, setTab] = useState<'profile' | 'password' | 'notifications'>('profile');

  const [profileForm, setProfileForm] = useState({ name: currentUser?.name ?? '' });
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState(false);

  function handleSaveProfile() {
    if (!currentUser || !profileForm.name.trim()) return;
    updateUser(currentUser.id, { name: profileForm.name.trim() });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  }

  function handleChangePassword() {
    setPwError('');
    if (pwForm.next.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Passwords do not match.'); return; }
    const result = changeOwnPassword(pwForm.current, pwForm.next);
    if (!result.ok) { setPwError(result.error ?? 'Error'); return; }
    setPwSuccess(true);
    setPwForm({ current: '', next: '', confirm: '' });
    setTimeout(() => setPwSuccess(false), 3000);
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: UserIcon },
    { id: 'password' as const, label: 'Password', icon: KeyRound },
    { id: 'notifications' as const, label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-52 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 pt-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${tab === t.id ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-medium' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {tab === 'profile' && (
            <div className="max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Profile</h2>
              <p className="text-sm text-gray-400 mb-6">Update your display name and account details.</p>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-600 flex items-center justify-center text-white text-xl font-bold">
                  {initials(currentUser?.name ?? 'U')}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{currentUser?.name}</p>
                  <p className="text-sm text-gray-400">{currentUser?.email}</p>
                  <span className="text-xs capitalize bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{currentUser?.role}</span>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Input
                  label="Display Name"
                  value={profileForm.name}
                  onChange={e => setProfileForm({ name: e.target.value })}
                />
                <Input label="Email" value={currentUser?.email ?? ''} disabled helpText="Email cannot be changed." />
                <Input label="Role" value={currentUser?.role ?? ''} disabled helpText="Role is managed by your admin." />
                <div className="flex items-center gap-3">
                  <Button variant="primary" icon={profileSaved ? <CheckCircle2 size={14} /> : <Save size={14} />} onClick={handleSaveProfile}>
                    {profileSaved ? 'Saved!' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <div className="max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Change Password</h2>
              <p className="text-sm text-gray-400 mb-6">Update your password. You'll need your current password to proceed.</p>

              {pwSuccess && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-lg px-4 py-3 mb-4 text-green-700 dark:text-green-400 text-sm">
                  <CheckCircle2 size={16} /> Password changed successfully!
                </div>
              )}

              <div className="flex flex-col gap-4">
                <Input label="Current Password" type="password" value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} placeholder="••••••••" />
                <Input label="New Password" type="password" value={pwForm.next} onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))} placeholder="Min 6 characters" />
                <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Repeat new password" error={pwError} />
                <Button variant="primary" icon={<KeyRound size={14} />} onClick={handleChangePassword} className="self-start">
                  Change Password
                </Button>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="max-w-md">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Preferences</h2>
              <p className="text-sm text-gray-400 mb-6">Customize your DS Studio experience.</p>
              <div className="flex flex-col gap-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                {[
                  { label: 'Contract propagation alerts', desc: 'Get notified when a UI contract finishes propagating' },
                  { label: 'Design system publish events', desc: 'Alerts when a design system is published' },
                  { label: 'Weekly summary digest', desc: 'Email summary of changes across all design systems' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 2} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
