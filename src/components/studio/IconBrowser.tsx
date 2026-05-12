import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Copy, Check, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

// ── Load Google Material Symbols font once ──────────────────────────────────
function ensureMaterialFont() {
  if (document.getElementById('material-symbols-css')) return;
  const link = document.createElement('link');
  link.id = 'material-symbols-css';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
  document.head.appendChild(link);
}

// ── Material Symbols icon catalogue (≈ 300 common icons by category) ────────
const MATERIAL_ICONS: { category: string; icons: string[] }[] = [
  { category: 'Navigation', icons: ['home','menu','close','search','arrow_back','arrow_forward','arrow_upward','arrow_downward','chevron_left','chevron_right','expand_more','expand_less','more_vert','more_horiz','first_page','last_page','apps','grid_view','view_list','view_module','drag_handle'] },
  { category: 'Action', icons: ['add','edit','delete','save','share','download','upload','refresh','filter_list','sort','search','settings','build','tune','lock','lock_open','visibility','visibility_off','favorite','bookmark','star','flag','print','link','copy_all','cut','paste','undo','redo','check','done','done_all','clear','block','report'] },
  { category: 'Communication', icons: ['email','phone','chat','forum','message','send','reply','reply_all','forward','inbox','drafts','outbox','markunread','contact_mail','contacts','group','person','person_add','person_remove','notifications','notifications_off','call','videocam','mic','mic_off','voicemail','chat_bubble'] },
  { category: 'Content', icons: ['add_circle','remove_circle','create','archive','backspace','clear','content_copy','content_cut','content_paste','filter_list','flag','forward','gesture','inbox','link','mail','move_to_inbox','redo','report','save','select_all','send','sort','undo','waves','weekend','where_to_vote'] },
  { category: 'Data & Files', icons: ['folder','folder_open','file_copy','insert_drive_file','attach_file','cloud','cloud_upload','cloud_download','cloud_done','storage','database','table_chart','bar_chart','pie_chart','show_chart','trending_up','trending_down','analytics','assessment','equalizer','data_usage'] },
  { category: 'UI Controls', icons: ['check_box','check_box_outline_blank','radio_button_checked','radio_button_unchecked','toggle_on','toggle_off','slider','tune','input','output','keyboard','keyboard_arrow_down','keyboard_arrow_up','keyboard_backspace','keyboard_return','keyboard_tab','space_bar','format_bold','format_italic','format_underlined'] },
  { category: 'Media', icons: ['play_arrow','pause','stop','skip_next','skip_previous','fast_forward','fast_rewind','replay','shuffle','repeat','volume_up','volume_down','volume_off','music_note','headphones','videocam','camera','photo','image','movie','live_tv','radio','audiotrack','queue_music','playlist_play'] },
  { category: 'Maps & Places', icons: ['map','location_on','place','navigation','near_me','directions','route','traffic','local_parking','local_hospital','local_pharmacy','local_grocery_store','restaurant','hotel','flight','train','directions_car','directions_bus','directions_bike','directions_walk','explore','terrain','satellite','layers'] },
  { category: 'Status & Alerts', icons: ['info','warning','error','help','check_circle','cancel','dangerous','new_releases','notifications_active','priority_high','report_problem','verified','shield','security','lock','https','vpn_lock','admin_panel_settings','privacy_tip','policy','gpp_good','gpp_bad','gpp_maybe'] },
  { category: 'Shopping', icons: ['shopping_cart','shopping_bag','store','storefront','sell','local_offer','discount','redeem','card_giftcard','payment','credit_card','account_balance','account_balance_wallet','attach_money','money','currency_exchange','price_check','receipt','receipt_long','request_quote','point_of_sale'] },
  { category: 'Social', icons: ['thumb_up','thumb_down','share','person','group','groups','public','language','emoji_emotions','sentiment_satisfied','mood','face','psychology','self_improvement','spa','fitness_center','sports','sports_esports','sports_soccer','sports_basketball','celebrate','cake','child_care','elderly','pets'] },
  { category: 'Device & Hardware', icons: ['smartphone','tablet','laptop','desktop_windows','tv','watch','headset','keyboard','mouse','print','scanner','camera_alt','memory','storage','battery_full','battery_low','wifi','bluetooth','signal_cellular_4_bar','network_wifi','router','usb','sd_card','sim_card','power'] },
];

const ALL_MATERIAL = MATERIAL_ICONS.flatMap(c => c.icons.map(icon => ({ icon, category: c.category })));

// ── Fluent icon name list (≈ 260 common icons, 24px regular style) ───────────
const FLUENT_ICONS = [
  'accessibility','add','airplane','alert','animal_cat','animal_dog','app_folder','apps','archive',
  'arrow_autofit_height','arrow_autofit_width','arrow_back','arrow_circle_down','arrow_circle_up',
  'arrow_clockwise','arrow_counterclockwise','arrow_download','arrow_forward','arrow_left','arrow_maximize',
  'arrow_minimize','arrow_right','arrow_sort','arrow_swap','arrow_up','arrow_upload','attach','award',
  'backspace','badge','beaker','bell','bluetooth','book','bookmark','bot','briefcase','braces',
  'branch_fork','bug','building','calendar','calendar_add','call','camera','cart','chart_bar',
  'chart_line','chart_multiple','chat','checkmark','checkmark_circle','chevron_down','chevron_left',
  'chevron_right','chevron_up','circle','clipboard','clipboard_paste','clock','cloud','code',
  'color','comment','compass','compose','contact_card','convert','copy','crop','cursor',
  'database','delete','desktop','diamond','document','document_add','download','earth','edit',
  'emoji','error_circle','eye','eye_off','face_smile','filter','fingerprint','fire','flag',
  'flash','folder','folder_add','font_color','games','gauge','gift','globe','grid','group',
  'hand_wave','heart','history','home','hourglass','image','important','info','key','laptop',
  'layer','layout','leaf','library','lightbulb','link','list','location','location_arrow','lock',
  'lock_open','mail','map','megaphone','mention','mic','mobile','money','more_circle',
  'more_horizontal','more_vertical','mountain','music_note','navigation','new_circle','notebook',
  'open','paint_bucket','pause','pen','people','person','person_add','person_delete','phone',
  'pin','play','plug','print','puzzle_piece','question_circle','radio_button','record',
  'refresh','rename','reply','ribbon','rocket','run','save','search','send','settings',
  'share','shield','sign_in','sign_out','skip_back_10','skip_forward_10','slide_layout',
  'sort_down','sparkle','speaker_2','star','stop','storage','subtract_circle','survey',
  'swap_horizontal','sync','table','tag','target','task_list','text_bold','text_italic',
  'text_underline','timer','toggle_left','toggle_right','toolbox','translate','tree_deciduous',
  'trophy','umbrella','upload','video','wallet','warning','wifi_1','window','wrench',
  'zoom_in','zoom_out',
];

const FLUENT_CDN = 'https://cdn.jsdelivr.net/npm/@fluentui/svg-icons@1.1.232/icons';

// ── Single icon cells ────────────────────────────────────────────────────────
function MaterialIcon({ name, onCopy }: { name: string; onCopy: (n: string) => void }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard?.writeText(name).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopy(name);
  }
  return (
    <button
      onClick={copy}
      title={name}
      className="group flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
    >
      <span className="material-symbols-outlined text-gray-700 dark:text-gray-300" style={{ fontSize: 24 }}>
        {name}
      </span>
      <span className="text-[9px] text-gray-400 text-center leading-tight max-w-[56px] truncate">{name}</span>
      {copied && (
        <span className="absolute inset-0 flex items-center justify-center bg-brand-500/10 rounded-lg">
          <Check size={16} className="text-brand-500" />
        </span>
      )}
    </button>
  );
}

function FluentIcon({ name, onCopy }: { name: string; onCopy: (n: string) => void }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [copied, setCopied] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    const url = `${FLUENT_CDN}/${name}_24_regular.svg`;
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(); return r.text(); })
      .then(svg => setSrc(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`))
      .catch(() => setErr(true));
  }, [name]);

  function copy() {
    const code = `${name}_24_regular`;
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    onCopy(code);
  }

  return (
    <button
      onClick={copy}
      title={name}
      className="group flex flex-col items-center gap-1.5 p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
    >
      {err ? (
        <AlertCircle size={22} className="text-gray-300" />
      ) : src ? (
        <img src={src} alt={name} width={24} height={24} className="opacity-75 dark:invert" />
      ) : (
        <div className="w-6 h-6 flex items-center justify-center">
          <Loader2 size={14} className="animate-spin text-gray-300" />
        </div>
      )}
      <span className="text-[9px] text-gray-400 text-center leading-tight max-w-[56px] truncate">{name}</span>
      {copied && (
        <span className="absolute inset-0 flex items-center justify-center bg-brand-500/10 rounded-lg">
          <Check size={16} className="text-brand-500" />
        </span>
      )}
    </button>
  );
}

// ── Icon Browser Modal ───────────────────────────────────────────────────────
interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'material' | 'fluent';

export function IconBrowser({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('material');
  const [query, setQuery] = useState('');
  const [lastCopied, setLastCopied] = useState('');
  const [materialReady, setMaterialReady] = useState(false);

  useEffect(() => {
    if (!open) return;
    ensureMaterialFont();
    // Give the font a moment to load
    const t = setTimeout(() => setMaterialReady(true), 800);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const q = query.toLowerCase().trim();

  const materialFiltered = q
    ? ALL_MATERIAL.filter(({ icon }) => icon.includes(q))
    : ALL_MATERIAL;

  const fluentFiltered = q
    ? FLUENT_ICONS.filter(n => n.includes(q))
    : FLUENT_ICONS;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col w-full max-w-4xl h-[80vh]">

        {/* Header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Icon Browser</h2>
            <p className="text-xs text-gray-400 mt-0.5">Click any icon to copy its name to clipboard</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 gap-0.5">
            {(['material', 'fluent'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize',
                  tab === t
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {t === 'material' ? '✦ Material Symbols' : '⬡ Fluent Icons'}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search icons…"
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={12} />
              </button>
            )}
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={16} />
          </button>
        </div>

        {/* Copied toast */}
        {lastCopied && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-none">
            <Check size={11} /> Copied <code className="font-mono">{lastCopied}</code>
          </div>
        )}

        {/* Icon grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'material' && (
            !materialReady ? (
              <div className="flex items-center justify-center h-40 gap-2 text-gray-400">
                <Loader2 size={18} className="animate-spin" /> Loading Material Symbols font…
              </div>
            ) : materialFiltered.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No icons match "{query}"</p>
            ) : q ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1">
                {materialFiltered.map(({ icon }) => (
                  <MaterialIcon key={icon} name={icon} onCopy={n => { setLastCopied(n); setTimeout(() => setLastCopied(''), 2000); }} />
                ))}
              </div>
            ) : (
              MATERIAL_ICONS.map(cat => (
                <div key={cat.category} className="mb-5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cat.category}</p>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1">
                    {cat.icons.map(icon => (
                      <MaterialIcon key={icon} name={icon} onCopy={n => { setLastCopied(n); setTimeout(() => setLastCopied(''), 2000); }} />
                    ))}
                  </div>
                </div>
              ))
            )
          )}

          {tab === 'fluent' && (
            fluentFiltered.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No icons match "{query}"</p>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(72px,1fr))] gap-1">
                {fluentFiltered.map(name => (
                  <FluentIcon key={name} name={name} onCopy={n => { setLastCopied(n); setTimeout(() => setLastCopied(''), 2000); }} />
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-400">
            {tab === 'material'
              ? `${materialFiltered.length.toLocaleString()} Material Symbols icons · Google Fonts`
              : `${fluentFiltered.length.toLocaleString()} Fluent System Icons · Microsoft`}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Live from CDN
          </div>
        </div>
      </div>
    </div>
  );
}
