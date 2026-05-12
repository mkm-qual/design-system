import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Undo2, Redo2, Upload, RotateCcw,
  Sun, Moon, Eye, ChevronDown, ChevronRight,
  Pencil, Shapes,
} from 'lucide-react';
import { useDSStore } from '../store/dsStore';
import { useAuthStore } from '../store/authStore';
import { TokenCategory, ComponentCategory, ComponentConfig, TokenSet, FontFile } from '../types';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { FontUploader, injectFontFaces } from '../components/studio/FontUploader';
import { IconBrowser } from '../components/studio/IconBrowser';

// ── Token category list ───────────────────────────────────────────────────────
const SEED_CATS: { id: TokenCategory; label: string }[] = [
  { id: 'all',    label: 'All'    },
  { id: 'color',  label: 'Color'  },
  { id: 'font',   label: 'Font'   },
  { id: 'line',   label: 'Line'   },
  { id: 'motion', label: 'Motion' },
  { id: 'other',  label: 'Other'  },
  { id: 'radius', label: 'Radius' },
  { id: 'size',   label: 'Size'   },
  { id: 'style',  label: 'Style'  },
  { id: 'layout', label: 'Layout' },
];

const DERIVED_CATS = ['All','Breakpoint','Color','Control','Font','Line','Link','Motion','Radius','Size'];
const COMP_CATS: ComponentCategory[] = ['General','Layout','Navigation','Data Entry','Data Display','Feedback','Other'];

// ── Small helpers ─────────────────────────────────────────────────────────────
function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5 gap-2">
      <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">{label}</span>
      <div className="flex items-center gap-1.5">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
        <span className="text-xs font-mono text-gray-500 w-16">{value}</span>
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="py-1.5">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
        <input type="number" value={value} min={min} max={max}
          onChange={e => onChange(Number(e.target.value))}
          className="w-14 text-xs text-right bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-gray-700 dark:text-gray-300 outline-none" />
      </div>
      <input type="range" min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 accent-orange-400" />
    </div>
  );
}

// ── Preview pane ──────────────────────────────────────────────────────────────
function PreviewPane({ tokens, activeComp, customFonts }: {
  tokens: TokenSet;
  activeComp: ComponentConfig | null;
  customFonts: FontFile[];
}) {
  const c = tokens.seed.color;
  const r = tokens.seed.radius;
  const f = tokens.seed.font;

  // Build a complete font-family string: custom fonts first, then system fallbacks
  const customFamilies = customFonts.map(cf => `'${cf.familyName}'`).join(', ');
  const fontFamily = customFamilies
    ? `${customFamilies}, ${f.fontFamily}`
    : f.fontFamily;

  const previewStyle = {
    fontFamily,
    fontSize: f.fontSize,
    color: c.textBaseColor,
    backgroundColor: c.backgroundBase,
  } as React.CSSProperties;

  return (
    <div className="h-full overflow-y-auto p-8" style={previewStyle}>
      <h2 className="text-base font-bold mb-1">Component Preview</h2>
      <p className="text-xs mb-1" style={{ color: '#888' }}>
        {activeComp ? activeComp.name : 'Showing design tokens live'}
      </p>
      {customFonts.length > 0 && (
        <p className="text-xs mb-5 inline-flex items-center gap-1 bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">
          ✓ Custom font: {customFonts.map(cf => cf.familyName).join(', ')}
        </p>
      )}

      {/* Buttons */}
      <section className="mb-6">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Buttons</p>
        <div className="flex flex-wrap gap-2">
          {['Primary', 'Default', 'Dashed', 'Text'].map((type, i) => (
            <button key={type} className="px-3 py-1.5 text-sm font-medium transition-all" style={{
              borderRadius: r.borderRadius, fontFamily,
              border: i === 0 ? 'none' : i === 2 ? `1px dashed ${c.primaryColor}` : `1px solid ${i === 3 ? 'transparent' : c.primaryColor}`,
              backgroundColor: i === 0 ? c.primaryColor : 'transparent',
              color: i === 0 ? '#fff' : c.primaryColor,
            }}>
              {type}
            </button>
          ))}
        </div>
      </section>

      {/* Alerts */}
      <section className="mb-6">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Alerts</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Success — Operation completed successfully.', color: c.successColor },
            { label: 'Warning — Please review before continuing.',  color: c.warningColor },
            { label: 'Error — Something went wrong.',               color: c.errorColor   },
            { label: 'Info — Here is some useful information.',     color: c.infoColor    },
          ].map(a => (
            <div key={a.label} style={{ borderRadius: r.borderRadius, border: `1px solid ${a.color}40`, backgroundColor: a.color + '14', padding: '8px 12px', display: 'flex', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: a.color, marginTop: 5, flexShrink: 0 }} />
              <span style={{ fontSize: f.fontSize, fontFamily }}>{a.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tags */}
      <section className="mb-6">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Tags</p>
        <div className="flex flex-wrap gap-2">
          {[c.primaryColor, c.successColor, c.warningColor, c.errorColor, c.magenta, c.orange].map((color, i) => (
            <span key={i} style={{ borderRadius: r.borderRadiusSM, border: `1px solid ${color}`, backgroundColor: color + '14', color, fontSize: 11, padding: '2px 8px', fontWeight: 500, fontFamily }}>
              Tag {i + 1}
            </span>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="mb-6">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Typography</p>
        <div style={{ fontFamily }}>
          {[
            { label: 'Heading 1', size: f.fontSize * 2.25, weight: f.fontWeightStrong },
            { label: 'Heading 2', size: f.fontSize * 1.75, weight: f.fontWeightStrong },
            { label: 'Heading 3', size: f.fontSize * 1.375, weight: f.fontWeightStrong },
            { label: 'Body',      size: f.fontSize,         weight: 400 },
            { label: 'Small',     size: f.fontSizeSM,       weight: 400 },
          ].map(t => (
            <div key={t.label} style={{ fontSize: t.size, fontWeight: t.weight, marginBottom: 6, color: c.textBaseColor, lineHeight: 1.3 }}>
              {t.label} — The quick brown fox jumps
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="mb-6">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Form Controls</p>
        <div className="flex flex-col gap-2 max-w-sm">
          <div>
            <label style={{ fontSize: 12, color: '#888', marginBottom: 4, display: 'block', fontFamily }}>Username</label>
            <input readOnly value="john.doe@company.com" style={{ width: '100%', borderRadius: r.borderRadius, border: '1px solid #d9d9d9', padding: '6px 12px', fontSize: f.fontSize, outline: 'none', color: c.textBaseColor, backgroundColor: c.backgroundBase, fontFamily }} />
          </div>
          <button style={{ backgroundColor: c.primaryColor, color: '#fff', borderRadius: r.borderRadius, border: 'none', padding: '7px 20px', fontSize: f.fontSize, fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start', fontFamily }}>
            Sign In
          </button>
        </div>
      </section>

      {/* Progress */}
      <section className="mb-6">
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Progress</p>
        {[30, 65, 88].map((pct, i) => (
          <div key={i} className="mb-2">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#888', fontFamily }}>Task {i + 1}</span>
              <span style={{ fontSize: 11, color: '#888', fontFamily }}>{pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, backgroundColor: '#f0f0f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, backgroundColor: i === 2 ? c.successColor : i === 1 ? c.warningColor : c.primaryColor }} />
            </div>
          </div>
        ))}
      </section>

      {/* Table */}
      <section>
        <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#888' }}>Table</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              {['Name', 'Role', 'Status', 'Last Active'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#888', fontSize: 11 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'Jordan Lee',  role: 'Admin',  status: 'Active',   date: 'Today' },
              { name: 'Alex Morgan', role: 'Editor', status: 'Active',   date: 'Yesterday' },
              { name: 'Sam Rivera',  role: 'Viewer', status: 'Inactive', date: '3 days ago' },
            ].map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 12px', color: c.textBaseColor }}>{row.name}</td>
                <td style={{ padding: '8px 12px', color: '#888' }}>{row.role}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: r.borderRadiusSM, backgroundColor: row.status === 'Active' ? c.successColor + '20' : '#f5f5f5', color: row.status === 'Active' ? c.successColor : '#888', fontSize: 11, fontWeight: 500 }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '8px 12px', color: '#888' }}>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ── Main Studio Page ──────────────────────────────────────────────────────────
export default function StudioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { designSystems, updateTokens, publishDS, setActiveDS, editDS, addFontFile, removeFontFile } = useDSStore();
  const { currentUser } = useAuthStore();

  const ds = designSystems.find(d => d.id === id);

  const [darkMode, setDarkMode]           = useState(false);
  const [tokenCat, setTokenCat]           = useState<TokenCategory>('color');
  const [selectedComp, setSelectedComp]   = useState<ComponentConfig | null>(null);
  const [collapsedCats, setCollapsedCats] = useState<Set<ComponentCategory>>(new Set());
  const [localTokens, setLocalTokens]     = useState<TokenSet | null>(null);
  const [publishing, setPublishing]       = useState(false);

  // Modals
  const [editOpen, setEditOpen]           = useState(false);
  const [iconBrowserOpen, setIconBrowserOpen] = useState(false);
  const [editForm, setEditForm]           = useState({ name: '', description: '', organization: '', platform: '' });

  useEffect(() => { if (id) setActiveDS(id); }, [id]);
  useEffect(() => { if (ds) setLocalTokens(JSON.parse(JSON.stringify(ds.tokens))); }, [ds?.id]);

  // Re-inject @font-face whenever font list changes
  useEffect(() => {
    if (ds?.fontFiles?.length) injectFontFaces(ds.fontFiles);
  }, [ds?.fontFiles]);

  if (!ds || !localTokens) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <p className="font-medium mb-2">Design system not found.</p>
          <Button variant="secondary" onClick={() => navigate('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const canEdit = currentUser?.role === 'admin' || currentUser?.role === 'editor';
  const fonts: FontFile[] = ds.fontFiles ?? [];

  // Token patch helpers — ds/localTokens are guaranteed non-null past the early return above
  function patchColor(key: string, v: string) {
    if (!canEdit || !localTokens || !ds) return;
    const next = { ...localTokens, seed: { ...localTokens.seed, color: { ...localTokens.seed.color, [key]: v } } } as TokenSet;
    setLocalTokens(next); updateTokens(ds.id, next);
  }
  function patchSize(key: string, v: number) {
    if (!canEdit || !localTokens || !ds) return;
    const next = { ...localTokens, seed: { ...localTokens.seed, size: { ...localTokens.seed.size, [key]: v } } } as TokenSet;
    setLocalTokens(next); updateTokens(ds.id, next);
  }
  function patchFont(key: string, v: string | number) {
    if (!canEdit || !localTokens || !ds) return;
    const next = { ...localTokens, seed: { ...localTokens.seed, font: { ...localTokens.seed.font, [key]: v } } } as TokenSet;
    setLocalTokens(next); updateTokens(ds.id, next);
  }
  function patchLine(key: string, v: string | number) {
    if (!canEdit || !localTokens || !ds) return;
    const next = { ...localTokens, seed: { ...localTokens.seed, line: { ...localTokens.seed.line, [key]: v } } } as TokenSet;
    setLocalTokens(next); updateTokens(ds.id, next);
  }
  function patchRadius(key: string, v: number) {
    if (!canEdit || !localTokens || !ds) return;
    const next = { ...localTokens, seed: { ...localTokens.seed, radius: { ...localTokens.seed.radius, [key]: v } } } as TokenSet;
    setLocalTokens(next); updateTokens(ds.id, next);
  }

  function toggleCat(cat: ComponentCategory) {
    setCollapsedCats(s => { const n = new Set(s); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  }

  async function handlePublish() {
    if (!ds) return;
    setPublishing(true);
    await new Promise(r => setTimeout(r, 800));
    publishDS(ds.id);
    setPublishing(false);
  }

  function openEditModal() {
    if (!ds) return;
    setEditForm({ name: ds.name, description: ds.description, organization: ds.organization, platform: ds.platform });
    setEditOpen(true);
  }

  function saveEdit() {
    if (!ds || !editForm.name.trim()) return;
    editDS(ds.id, editForm.name.trim(), editForm.description.trim(), editForm.organization.trim(), editForm.platform);
    setEditOpen(false);
  }

  const c = localTokens.seed.color;
  const s = localTokens.seed.size;
  const f = localTokens.seed.font;
  const l = localTokens.seed.line;
  const m = localTokens.seed.motion;
  const rad = localTokens.seed.radius;

  return (
    <div className={cn('flex flex-col h-full', darkMode && 'dark')}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0 text-sm">
        <Link to="/" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft size={14} /><span className="text-xs">Back</span>
        </Link>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
        <span className="font-semibold text-gray-900 dark:text-white">{ds.name}</span>
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium border',
          ds.status === 'published'
            ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30'
            : 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30'
        )}>
          {ds.status === 'published' ? 'Published' : 'Draft'}
        </span>
        {ds.unpublishedChanges > 0 && (
          <span className="text-xs text-orange-500 font-medium">{ds.unpublishedChanges} Unpublished Change{ds.unpublishedChanges !== 1 ? 's' : ''}</span>
        )}
        <span className="text-xs text-gray-400 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded-full">{ds.platform}</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Icon browser */}
          <Button variant="secondary" size="sm" icon={<Shapes size={13} />} onClick={() => setIconBrowserOpen(true)}>
            Icons
          </Button>

          {canEdit && (
            <Button variant="secondary" size="sm" icon={<Pencil size={12} />} onClick={openEditModal}>
              Edit
            </Button>
          )}

          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Undo2 size={14} /></button>
          <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Redo2 size={14} /></button>

          {canEdit && (
            <>
              <Button variant="secondary" size="sm" icon={<RotateCcw size={12} />}>Reset</Button>
              <Button variant="secondary" size="sm">Save changes</Button>
              <Button variant="primary" size="sm" icon={<Upload size={12} />} loading={publishing} onClick={handlePublish}>Publish</Button>
            </>
          )}
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
          <button
            onClick={() => setDarkMode(d => !d)}
            className={cn('p-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors', darkMode ? 'bg-gray-800 text-gray-200' : 'text-gray-500 hover:bg-gray-100')}
          >
            {darkMode ? <Moon size={13} /> : <Sun size={13} />}
            <span>{darkMode ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>

      {/* ── 5-panel body ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Panel 1 — Token categories */}
        <div className="w-[120px] flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Seed Tokens</p>
          </div>
          {SEED_CATS.map(cat => (
            <button key={cat.id} onClick={() => setTokenCat(cat.id)}
              className={cn('w-full text-left px-3 py-1.5 text-xs transition-colors',
                tokenCat === cat.id
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}>
              {cat.label}
            </button>
          ))}

          {/* Fonts shortcut */}
          <button onClick={() => setTokenCat('font')}
            className={cn('w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center gap-1',
              tokenCat === 'font'
                ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            )}>
            Fonts {fonts.length > 0 && <span className="ml-auto bg-brand-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">{fonts.length}</span>}
          </button>

          <div className="px-3 pt-3 pb-1 mt-1 border-t border-gray-200 dark:border-gray-800">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Derived (Map)</p>
          </div>
          {DERIVED_CATS.map(cat => (
            <button key={cat} className="w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-500">
              {cat}
            </button>
          ))}
        </div>

        {/* Panel 2 — Token editor */}
        <div className="w-[230px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="px-3 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 capitalize">
              {tokenCat === 'all' ? 'All Tokens' : tokenCat}
            </p>
          </div>
          <div className="p-3">

            {/* ── Color ── */}
            {(tokenCat === 'all' || tokenCat === 'color') && (
              <div className="mb-4">
                {tokenCat === 'all' && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Color</p>}
                <ColorRow label="Primary Color"    value={c.primaryColor}    onChange={v => patchColor('primaryColor', v)} />
                <ColorRow label="Success Color"    value={c.successColor}    onChange={v => patchColor('successColor', v)} />
                <ColorRow label="Warning Color"    value={c.warningColor}    onChange={v => patchColor('warningColor', v)} />
                <ColorRow label="Error Color"      value={c.errorColor}      onChange={v => patchColor('errorColor', v)} />
                <ColorRow label="Info Color"       value={c.infoColor}       onChange={v => patchColor('infoColor', v)} />
                <ColorRow label="Text Base Color"  value={c.textBaseColor}   onChange={v => patchColor('textBaseColor', v)} />
                <ColorRow label="Background Base"  value={c.backgroundBase}  onChange={v => patchColor('backgroundBase', v)} />
                <ColorRow label="Link Color"       value={c.linkColor}       onChange={v => patchColor('linkColor', v)} />
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] text-gray-400 mb-1">Extended Palette</p>
                  <ColorRow label="Geek Blue" value={c.geekBlue}  onChange={v => patchColor('geekBlue', v)} />
                  <ColorRow label="Gold"      value={c.gold}       onChange={v => patchColor('gold', v)} />
                  <ColorRow label="Green"     value={c.green}      onChange={v => patchColor('green', v)} />
                  <ColorRow label="Lime"      value={c.lime}       onChange={v => patchColor('lime', v)} />
                  <ColorRow label="Magenta"   value={c.magenta}    onChange={v => patchColor('magenta', v)} />
                  <ColorRow label="Orange"    value={c.orange}     onChange={v => patchColor('orange', v)} />
                </div>
              </div>
            )}

            {/* ── Size ── */}
            {(tokenCat === 'all' || tokenCat === 'size') && (
              <div className="mb-4">
                {tokenCat === 'all' && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Size</p>}
                <SliderRow label="Control Height"   value={s.controlHeight}   min={24} max={56} onChange={v => patchSize('controlHeight', v)} />
                <SliderRow label="Popup Arrow Size" value={s.popupArrowSize}  min={4}  max={32} onChange={v => patchSize('popupArrowSize', v)} />
                <SliderRow label="Size Step"        value={s.sizeStep}        min={1}  max={8}  onChange={v => patchSize('sizeStep', v)} />
                <SliderRow label="Size Unit"        value={s.sizeUnit}        min={1}  max={8}  onChange={v => patchSize('sizeUnit', v)} />
              </div>
            )}

            {/* ── Font + Font Upload ── */}
            {(tokenCat === 'all' || tokenCat === 'font') && (
              <div className="mb-4">
                {tokenCat === 'all' && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Font</p>}
                <div className="py-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Font Family</label>
                  <input type="text" value={f.fontFamily} onChange={e => patchFont('fontFamily', e.target.value)}
                    className="w-full text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none truncate"
                    disabled={!canEdit} />
                </div>
                <SliderRow label="Base Font Size"   value={f.fontSize}         min={10} max={22} onChange={v => patchFont('fontSize', v)} />
                <SliderRow label="Large Font Size"  value={f.fontSizeLG}       min={12} max={28} onChange={v => patchFont('fontSizeLG', v)} />
                <SliderRow label="Small Font Size"  value={f.fontSizeSM}       min={8}  max={16} onChange={v => patchFont('fontSizeSM', v)} />
                <SliderRow label="Font Weight (Strong)" value={f.fontWeightStrong} min={400} max={900} onChange={v => patchFont('fontWeightStrong', v)} />

                {/* Font file uploader */}
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Custom Font Files</p>
                  <FontUploader
                    dsId={ds.id}
                    fonts={fonts}
                    onAdd={font => addFontFile(ds.id, font)}
                    onRemove={fontId => removeFontFile(ds.id, fontId)}
                    readOnly={!canEdit}
                  />
                </div>
              </div>
            )}

            {/* ── Line ── */}
            {(tokenCat === 'all' || tokenCat === 'line') && (
              <div className="mb-4">
                {tokenCat === 'all' && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Line</p>}
                <SliderRow label="Line Width" value={l.lineWidth} min={1} max={4} onChange={v => patchLine('lineWidth', v)} />
                <div className="py-1.5">
                  <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Line Type</label>
                  <select value={l.lineType} onChange={e => patchLine('lineType', e.target.value)} disabled={!canEdit}
                    className="w-full text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none">
                    <option>solid</option><option>dashed</option><option>dotted</option>
                  </select>
                </div>
              </div>
            )}

            {/* ── Motion ── */}
            {(tokenCat === 'all' || tokenCat === 'motion') && (
              <div className="mb-4">
                {tokenCat === 'all' && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Motion</p>}
                {(['motionDurationFast','motionDurationMid','motionDurationSlow'] as const).map(key => (
                  <div key={key} className="py-1.5">
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      {key.replace('motionDuration', '')} Duration
                    </label>
                    <input type="text" value={(m as unknown as Record<string, string>)[key]}
                      onChange={e => {
                        if (!localTokens || !ds) return;
                        const next = { ...localTokens, seed: { ...localTokens.seed, motion: { ...localTokens.seed.motion, [key]: e.target.value } } } as TokenSet;
                        setLocalTokens(next);
                        if (canEdit) updateTokens(ds.id, next);
                      }}
                      className="w-full text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 text-gray-700 dark:text-gray-300 outline-none"
                      disabled={!canEdit} />
                  </div>
                ))}
              </div>
            )}

            {/* ── Radius ── */}
            {(tokenCat === 'all' || tokenCat === 'radius') && (
              <div className="mb-4">
                {tokenCat === 'all' && <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Radius</p>}
                <SliderRow label="Border Radius"    value={rad.borderRadius}   min={0} max={20} onChange={v => patchRadius('borderRadius', v)} />
                <SliderRow label="Border Radius LG" value={rad.borderRadiusLG} min={0} max={24} onChange={v => patchRadius('borderRadiusLG', v)} />
                <SliderRow label="Border Radius SM" value={rad.borderRadiusSM} min={0} max={12} onChange={v => patchRadius('borderRadiusSM', v)} />
                <SliderRow label="Border Radius XS" value={rad.borderRadiusXS} min={0} max={8}  onChange={v => patchRadius('borderRadiusXS', v)} />
              </div>
            )}
          </div>
        </div>

        {/* Panel 3 — Components list */}
        <div className="w-[160px] flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Components</p>
          </div>
          {COMP_CATS.map(cat => {
            const comps = ds.components.filter(c => c.category === cat);
            if (!comps.length) return null;
            const collapsed = collapsedCats.has(cat);
            return (
              <div key={cat}>
                <button onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-300">
                  {cat}
                  {collapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                </button>
                {!collapsed && comps.map(comp => (
                  <button key={comp.id} onClick={() => setSelectedComp(comp)}
                    className={cn('w-full text-left px-3 py-1.5 text-xs transition-colors',
                      selectedComp?.id === comp.id
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}>
                    {comp.name}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Panel 4 — Component editor */}
        <div className="w-[220px] flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <div className="px-3 pt-3 pb-1 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              {selectedComp ? selectedComp.name : 'Components Editor'}
            </p>
          </div>
          <div className="p-3">
            {!selectedComp ? (
              <p className="text-xs text-gray-400 mt-4 text-center">Select a component to edit its token overrides.</p>
            ) : (
              <>
                <p className="text-[10px] text-gray-400 mb-3">Overrides for <span className="font-medium">{selectedComp.name}</span></p>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Color</p>
                    <ChevronDown size={12} className="text-gray-400" />
                  </div>
                  <ColorRow label="Primary Color"   value={c.primaryColor}   onChange={v => patchColor('primaryColor', v)} />
                  <ColorRow label="Success Color"   value={c.successColor}   onChange={v => patchColor('successColor', v)} />
                  <ColorRow label="Warning Color"   value={c.warningColor}   onChange={v => patchColor('warningColor', v)} />
                  <ColorRow label="Error Color"     value={c.errorColor}     onChange={v => patchColor('errorColor', v)} />
                  <ColorRow label="Info Color"      value={c.infoColor}      onChange={v => patchColor('infoColor', v)} />
                  <ColorRow label="Text Base Color" value={c.textBaseColor}  onChange={v => patchColor('textBaseColor', v)} />
                  <ColorRow label="Background Base" value={c.backgroundBase} onChange={v => patchColor('backgroundBase', v)} />
                  <ColorRow label="Link Color"      value={c.linkColor}      onChange={v => patchColor('linkColor', v)} />
                </div>
                <div className="mb-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Font</p>
                  <div className="py-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">Family</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono">
                      {fonts.length > 0 ? fonts[0].familyName : f.fontFamily.split(',')[0]}
                    </p>
                  </div>
                  <div className="py-1">
                    <p className="text-[10px] text-gray-400 mb-0.5">Base Size</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{f.fontSize}px</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Line</p>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Width</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300">{l.lineWidth}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Type</span>
                    <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">{l.lineType}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Panel 5 — Preview */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Eye size={13} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Preview</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            </div>
          </div>
          <PreviewPane tokens={localTokens} activeComp={selectedComp} customFonts={fonts} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <span className="text-[10px] text-gray-400">DS Studio &nbsp;·&nbsp; v{ds.version}</span>
        <span className="text-[10px] text-gray-400">Last updated {new Date(ds.updatedAt).toLocaleString()}</span>
      </div>

      {/* ── Edit DS Modal ──────────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Design System" size="md">
        <div className="flex flex-col gap-4">
          <Input label="Name *" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Marketing Web" />
          <Input label="Organization" value={editForm.organization} onChange={e => setEditForm(f => ({ ...f, organization: e.target.value }))} placeholder="e.g. Acme Corp" />
          <Input label="Description" value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description…" />
          <Select label="Platform" value={editForm.platform}
            onChange={e => setEditForm(f => ({ ...f, platform: (e.target as HTMLSelectElement).value }))}
            options={[
              { value: 'Web',            label: 'Web'            },
              { value: 'Mobile',         label: 'Mobile (iOS/Android)' },
              { value: 'Desktop',        label: 'Desktop'        },
              { value: 'Cross-platform', label: 'Cross-platform' },
            ]}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* ── Icon Browser Modal ─────────────────────────────────────────── */}
      <IconBrowser open={iconBrowserOpen} onClose={() => setIconBrowserOpen(false)} />
    </div>
  );
}
