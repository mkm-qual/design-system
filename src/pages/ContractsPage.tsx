import { useState } from 'react';
import {
  FileCode2, Plus, Play, Pause, Trash2, GitBranch,
  CheckCircle2, Clock, AlertCircle, Loader2, ChevronDown,
  ChevronRight, X, Zap, Database,
} from 'lucide-react';
import { useDSStore } from '../store/dsStore';
import { useAuthStore } from '../store/authStore';
import { UIContract } from '../types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { cn, timeAgo, formatDate } from '../lib/utils';

const STATUS_ICONS = {
  active: CheckCircle2,
  inactive: Clock,
  propagating: Loader2,
  error: AlertCircle,
};
const STATUS_COLORS = {
  active: 'text-green-500 bg-green-50 border-green-200 dark:bg-green-500/10 dark:border-green-500/30',
  inactive: 'text-gray-400 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
  propagating: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30',
  error: 'text-red-500 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/30',
};

export default function ContractsPage() {
  const { contracts, designSystems, createContract, deleteContract, propagateContract, addContractRule, removeContractRule } = useDSStore();
  const { currentUser } = useAuthStore();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<UIContract | null>(null);
  const [ruleOpen, setRuleOpen] = useState(false);
  const [propagatingId, setPropagatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', description: '', targetRepo: '', linkedDsId: '' });
  const [ruleForm, setRuleForm] = useState({ tokenPath: '', value: '', description: '' });

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';

  async function handlePropagate(contract: UIContract) {
    setPropagatingId(contract.id);
    await propagateContract(contract.id);
    setPropagatingId(null);
  }

  function handleCreateContract() {
    if (!form.name.trim()) return;
    createContract({
      name: form.name,
      description: form.description,
      targetRepo: form.targetRepo,
      linkedDsId: form.linkedDsId || designSystems[0]?.id || '',
      rules: [],
    });
    setForm({ name: '', description: '', targetRepo: '', linkedDsId: '' });
    setCreateOpen(false);
  }

  function handleAddRule() {
    if (!selectedContract || !ruleForm.tokenPath.trim()) return;
    addContractRule(selectedContract.id, {
      tokenPath: ruleForm.tokenPath,
      value: ruleForm.value,
      description: ruleForm.description,
    });
    setRuleForm({ tokenPath: '', value: '', description: '' });
    setRuleOpen(false);
  }

  // Refresh selected contract from store
  const liveSelectedContract = selectedContract
    ? contracts.find(c => c.id === selectedContract.id) ?? null
    : null;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Contract list */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">UI Contracts</h1>
              <p className="text-xs text-gray-400 mt-0.5">{contracts.length} contract{contracts.length !== 1 ? 's' : ''}</p>
            </div>
            {canEdit && (
              <Button variant="primary" size="sm" icon={<Plus size={13} />} onClick={() => setCreateOpen(true)}>
                New
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <FileCode2 size={32} className="text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-sm text-gray-500">No UI contracts yet.</p>
              {canEdit && <Button variant="primary" size="sm" className="mt-3" onClick={() => setCreateOpen(true)}>Create first contract</Button>}
            </div>
          ) : (
            contracts.map(contract => {
              const Ico = STATUS_ICONS[contract.status];
              const ds = designSystems.find(d => d.id === contract.linkedDsId);
              return (
                <button
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  className={cn(
                    'w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
                    liveSelectedContract?.id === contract.id && 'bg-brand-50 dark:bg-brand-500/10 border-l-2 border-l-brand-500'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{contract.name}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{ds?.name ?? '—'}</p>
                    </div>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 font-medium flex-shrink-0', STATUS_COLORS[contract.status])}>
                      <Ico size={9} className={contract.status === 'propagating' ? 'animate-spin' : ''} />
                      {contract.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Database size={9} /> {contract.totalScreens.toLocaleString()} screens
                    </span>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <GitBranch size={9} /> {contract.affectedFiles} files
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Contract detail */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
        {!liveSelectedContract ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <FileCode2 size={48} className="text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-medium">Select a contract to view details</p>
              <p className="text-sm text-gray-400 mt-1">UI Contracts propagate token changes across your entire codebase instantly.</p>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-8">
            {/* Contract header */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{liveSelectedContract.name}</h2>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1', STATUS_COLORS[liveSelectedContract.status])}>
                      {(() => { const Ico = STATUS_ICONS[liveSelectedContract.status]; return <Ico size={10} className={liveSelectedContract.status === 'propagating' ? 'animate-spin' : ''} />; })()}
                      {liveSelectedContract.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{liveSelectedContract.description}</p>
                </div>
                {canEdit && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={propagatingId === liveSelectedContract.id ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                      loading={propagatingId === liveSelectedContract.id}
                      onClick={() => handlePropagate(liveSelectedContract)}
                    >
                      Propagate Now
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={13} />}
                      onClick={() => { if (confirm('Delete this contract?')) { deleteContract(liveSelectedContract.id); setSelectedContract(null); } }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                {[
                  { label: 'Total Screens', value: liveSelectedContract.totalScreens.toLocaleString(), icon: Database },
                  { label: 'Affected Files', value: liveSelectedContract.affectedFiles.toLocaleString(), icon: FileCode2 },
                  { label: 'Contract Rules', value: liveSelectedContract.rules.length, icon: GitBranch },
                  { label: 'Last Propagated', value: liveSelectedContract.lastPropagated ? timeAgo(liveSelectedContract.lastPropagated) : 'Never', icon: Clock },
                ].map(stat => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>

              {liveSelectedContract.targetRepo && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <GitBranch size={13} className="text-gray-400" />
                  <span className="text-gray-400">Target:</span>
                  <code className="text-brand-600 dark:text-brand-400 text-xs">{liveSelectedContract.targetRepo}</code>
                </div>
              )}
            </div>

            {/* Rules */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Token Rules</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Rules enforced when this contract is propagated</p>
                </div>
                {canEdit && (
                  <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => { setSelectedContract(liveSelectedContract); setRuleOpen(true); }}>
                    Add Rule
                  </Button>
                )}
              </div>

              {liveSelectedContract.rules.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-gray-400">No rules defined yet.</p>
                  {canEdit && <Button variant="secondary" size="sm" className="mt-3" icon={<Plus size={13} />} onClick={() => setRuleOpen(true)}>Add first rule</Button>}
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {liveSelectedContract.rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-4 min-w-0">
                        <div>
                          <p className="text-sm font-mono text-brand-600 dark:text-brand-400">{rule.tokenPath}</p>
                          <p className="text-xs text-gray-400">{rule.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono text-gray-700 dark:text-gray-300">
                          {String(rule.value)}
                        </code>
                        {canEdit && (
                          <button
                            onClick={() => removeContractRule(liveSelectedContract.id, rule.id)}
                            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Propagation log */}
            {liveSelectedContract.lastPropagated && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mt-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Last Propagation</h3>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-xs">
                  <p className="text-green-400">✓ Contract propagation completed successfully</p>
                  <p className="text-gray-500 mt-1">Timestamp: {new Date(liveSelectedContract.lastPropagated).toISOString()}</p>
                  <p className="text-gray-500">Files modified: {liveSelectedContract.affectedFiles}</p>
                  <p className="text-gray-500">Screens updated: {liveSelectedContract.totalScreens.toLocaleString()}</p>
                  <p className="text-gray-500">Rules applied: {liveSelectedContract.rules.length}</p>
                  <p className="text-green-400 mt-2">All {liveSelectedContract.rules.length} token rules propagated across {liveSelectedContract.affectedFiles} files in project repo.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New UI Contract">
        <div className="flex flex-col gap-4">
          <Input
            label="Contract Name *"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="e.g. Brand Primary Contract"
          />
          <Input
            label="Description"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="What does this contract enforce?"
          />
          <Input
            label="Target Repository"
            value={form.targetRepo}
            onChange={e => setForm(f => ({ ...f, targetRepo: e.target.value }))}
            placeholder="github.com/org/repo"
          />
          <Select
            label="Link to Design System"
            value={form.linkedDsId}
            onChange={e => setForm(f => ({ ...f, linkedDsId: (e.target as HTMLSelectElement).value }))}
            options={designSystems.map(ds => ({ value: ds.id, label: ds.name }))}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateContract}>Create Contract</Button>
          </div>
        </div>
      </Modal>

      {/* Add Rule Modal */}
      <Modal open={ruleOpen} onClose={() => setRuleOpen(false)} title="Add Token Rule" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Token Path *"
            value={ruleForm.tokenPath}
            onChange={e => setRuleForm(f => ({ ...f, tokenPath: e.target.value }))}
            placeholder="seed.color.primaryColor"
            helpText="Dot-path to the token in the design system"
          />
          <Input
            label="Value *"
            value={ruleForm.value}
            onChange={e => setRuleForm(f => ({ ...f, value: e.target.value }))}
            placeholder="#1677ff or 14"
          />
          <Input
            label="Description"
            value={ruleForm.description}
            onChange={e => setRuleForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Why is this rule needed?"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setRuleOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddRule}>Add Rule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
