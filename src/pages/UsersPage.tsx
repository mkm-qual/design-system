import { useState } from 'react';
import {
  Users, Plus, Edit2, Trash2, KeyRound,
  CheckCircle2, XCircle, Search, ShieldCheck, User as UserIcon, Eye,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { User, Role } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn, formatDate, initials } from '../lib/utils';

const ROLE_CONFIG: Record<Role, { label: string; cls: string; icon: typeof ShieldCheck }> = {
  admin: { label: 'Admin', cls: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/30', icon: ShieldCheck },
  editor: { label: 'Editor', cls: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30', icon: Edit2 },
  viewer: { label: 'Viewer', cls: 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700', icon: Eye },
};

export default function UsersPage() {
  const { users, currentUser, addUser, updateUser, deleteUser, resetPassword } = useAuthStore();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' as Role });
  const [formError, setFormError] = useState('');
  const [editForm, setEditForm] = useState({ name: '', role: 'editor' as Role, active: true });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  function handleAdd() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('All fields are required.'); return;
    }
    if (form.password.length < 6) {
      setFormError('Password must be at least 6 characters.'); return;
    }
    const result = addUser(form.name.trim(), form.email.trim(), form.password, form.role);
    if (!result.ok) { setFormError(result.error ?? 'Error'); return; }
    setAddOpen(false);
    setForm({ name: '', email: '', password: '', role: 'editor' });
    setFormError('');
  }

  function openEdit(user: User) {
    setEditUser(user);
    setEditForm({ name: user.name, role: user.role, active: user.active });
  }

  function handleEdit() {
    if (!editUser) return;
    updateUser(editUser.id, { name: editForm.name, role: editForm.role, active: editForm.active });
    setEditUser(null);
  }

  function handleResetPassword() {
    if (!resetUser) return;
    if (newPassword.length < 6) { setResetError('Password must be at least 6 characters.'); return; }
    resetPassword(resetUser.id, newPassword);
    setResetSuccess(true);
    setTimeout(() => { setResetUser(null); setNewPassword(''); setResetError(''); setResetSuccess(false); }, 1500);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="text-sm text-gray-400 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''} in your organization</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500 w-56"
              />
            </div>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => setAddOpen(true)}>
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map(user => {
                const RoleInfo = ROLE_CONFIG[user.role];
                const isMe = user.id === currentUser?.id;
                return (
                  <tr key={user.id} className={cn('hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors', !user.active && 'opacity-50')}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                          user.role === 'admin' ? 'bg-purple-500' : user.role === 'editor' ? 'bg-blue-500' : 'bg-gray-400'
                        )}>
                          {initials(user.name)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                            {user.name}
                            {isMe && <span className="text-[10px] bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 px-1.5 py-0.5 rounded-full font-medium">You</span>}
                          </p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 w-fit', RoleInfo.cls)}>
                        <RoleInfo.icon size={10} />
                        {RoleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn('flex items-center gap-1.5 text-xs font-medium', user.active ? 'text-green-500' : 'text-gray-400')}>
                        {user.active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {user.lastLogin ? formatDate(user.lastLogin) : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          title="Edit user"
                          onClick={() => openEdit(user)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          title="Reset password"
                          onClick={() => setResetUser(user)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                        >
                          <KeyRound size={13} />
                        </button>
                        {!isMe && (
                          <button
                            title="Delete user"
                            onClick={() => { if (confirm(`Delete ${user.name}?`)) deleteUser(user.id); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => { setAddOpen(false); setFormError(''); }} title="Add New User">
        <div className="flex flex-col gap-4">
          <Input label="Full Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" />
          <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@company.com" />
          <Input label="Initial Password *" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" helpText="User should change this after first login." />
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: (e.target as HTMLSelectElement).value as Role }))}
            options={[
              { value: 'viewer', label: 'Viewer — Read-only access' },
              { value: 'editor', label: 'Editor — Can edit design systems' },
              { value: 'admin', label: 'Admin — Full access' },
            ]}
          />
          {formError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg px-3 py-2">{formError}</p>}
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd}>Add User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" size="sm">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
          <Select
            label="Role"
            value={editForm.role}
            onChange={e => setEditForm(f => ({ ...f, role: (e.target as HTMLSelectElement).value as Role }))}
            options={[
              { value: 'viewer', label: 'Viewer' },
              { value: 'editor', label: 'Editor' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active-toggle"
              checked={editForm.active}
              onChange={e => setEditForm(f => ({ ...f, active: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="active-toggle" className="text-sm text-gray-700 dark:text-gray-300">Account active</label>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal open={!!resetUser} onClose={() => { setResetUser(null); setNewPassword(''); setResetError(''); setResetSuccess(false); }} title="Reset Password" size="sm">
        {resetSuccess ? (
          <div className="flex flex-col items-center py-4">
            <CheckCircle2 size={40} className="text-green-500 mb-3" />
            <p className="font-medium text-gray-900 dark:text-white">Password reset successfully!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">Setting a new password for <span className="font-medium text-gray-800 dark:text-white">{resetUser?.name}</span>.</p>
            <Input
              label="New Password *"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
              error={resetError}
            />
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="secondary" onClick={() => setResetUser(null)}>Cancel</Button>
              <Button variant="primary" icon={<KeyRound size={13} />} onClick={handleResetPassword}>Reset Password</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
