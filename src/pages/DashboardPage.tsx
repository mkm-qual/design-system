import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, MoreHorizontal, Layers, CheckCircle2, Clock, Archive,
  Globe, Smartphone, Trash2, Edit2, ExternalLink, Search,
} from 'lucide-react';
import { useDSStore } from '../store/dsStore';
import { useAuthStore } from '../store/authStore';
import { DesignSystem, DSStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn, formatDate, timeAgo, initials } from '../lib/utils';

const STATUS_CONFIG: Record<DSStatus, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  published: { label: 'Published', cls: 'bg-green-500/10 text-green-400 border-green-500/30', icon: CheckCircle2 },
  draft: { label: 'Draft', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30', icon: Clock },
  archived: { label: 'Archived', cls: 'bg-gray-500/10 text-gray-400 border-gray-500/30', icon: Archive },
};

export default function DashboardPage() {
  const { designSystems, createDS, deleteDS, setActiveDS } = useDSStore();
  const { currentUser } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', organization: '', platform: 'Web' });
  const [formError, setFormError] = useState('');

  const filtered = designSystems.filter(ds =>
    ds.name.toLowerCase().includes(search.toLowerCase()) ||
    ds.organization.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  function handleCreate() {
    if (!form.name.trim()) { setFormError('Name is required.'); return; }
    const ds = createDS(form.name.trim(), form.description.trim(), form.organization.trim() || 'My Org', form.platform);
    setCreateOpen(false);
    setForm({ name: '', description: '', organization: '', platform: 'Web' });
    setFormError('');
    setActiveDS(ds.id);
    navigate(`/studio/${ds.id}`);
  }

  function openStudio(ds: DesignSystem) {
    setActiveDS(ds.id);
    navigate(`/studio/${ds.id}`);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-8 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Design Systems</h1>
            <p className="text-sm text-gray-500 mt-0.5">{designSystems.length} design system{designSystems.length !== 1 ? 's' : ''} across your organization</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search systems..."
                className="pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 outline-none focus:border-brand-500 w-60"
              />
            </div>
            {canEdit && (
              <Button variant="primary" icon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>
                New Design System
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Layers size={40} className="text-gray-300 dark:text-gray-700 mb-4" />
            <p className="text-gray-500 font-medium">No design systems found</p>
            {canEdit && <Button variant="primary" icon={<Plus size={14} />} className="mt-4" onClick={() => setCreateOpen(true)}>Create your first</Button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(ds => {
              const st = STATUS_CONFIG[ds.status];
              return (
                <div
                  key={ds.id}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-black/30 transition-all cursor-pointer"
                  onClick={() => openStudio(ds)}
                >
                  {/* Thumbnail */}
                  <div
                    className="h-32 relative flex items-center justify-center"
                    style={{ backgroundColor: ds.thumbnailColor + '18' }}
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg"
                      style={{ backgroundColor: ds.thumbnailColor }}
                    >
                      {initials(ds.name)}
                    </div>
                    {ds.unpublishedChanges > 0 && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {ds.unpublishedChanges} change{ds.unpublishedChanges !== 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex items-center gap-1">
                      {ds.platform === 'Mobile' ? <Smartphone size={12} className="text-gray-400" /> : <Globe size={12} className="text-gray-400" />}
                      <span className="text-xs text-gray-400">{ds.platform}</span>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink size={20} className="text-gray-500 dark:text-gray-300" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{ds.name}</h3>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{ds.organization}</p>
                      </div>
                      {canEdit && (
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                            onClick={() => setOpenMenu(openMenu === ds.id ? null : ds.id)}
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {openMenu === ds.id && (
                            <div className="absolute right-0 top-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 w-36">
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => { setOpenMenu(null); openStudio(ds); }}
                              >
                                <Edit2 size={12} /> Open Studio
                              </button>
                              <button
                                className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                onClick={() => { if (confirm(`Delete "${ds.name}"?`)) { deleteDS(ds.id); setOpenMenu(null); } }}
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{ds.description}</p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      <span className={cn('text-xs border px-2 py-0.5 rounded-full font-medium flex items-center gap-1', st.cls)}>
                        <st.icon size={10} /> {st.label}
                      </span>
                      <span className="text-xs text-gray-400">v{ds.version}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Updated {timeAgo(ds.updatedAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Design System" size="md">
        <div className="flex flex-col gap-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Marketing Web"
            error={formError}
          />
          <Input
            label="Organization"
            value={form.organization}
            onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
            placeholder="e.g. Acme Corp"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Brief description of this design system..."
          />
          <Select
            label="Platform"
            value={form.platform}
            onChange={e => setForm(f => ({ ...f, platform: (e.target as HTMLSelectElement).value }))}
            options={[
              { value: 'Web', label: 'Web' },
              { value: 'Mobile', label: 'Mobile (iOS/Android)' },
              { value: 'Desktop', label: 'Desktop' },
              { value: 'Cross-platform', label: 'Cross-platform' },
            ]}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate}>Create & Open</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
