import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { DesignSystem, UIContract, TokenSet, ComponentConfig, ContractRule, FontFile } from '../types';
import { storage } from '../lib/storage';
import { defaultTokens, defaultComponents } from '../lib/defaults';
import { PALETTE_COLORS } from '../lib/utils';

interface DSState {
  designSystems: DesignSystem[];
  contracts: UIContract[];
  activeDS: DesignSystem | null;
  _init: () => void;

  createDS: (name: string, description: string, organization: string, platform: string) => DesignSystem;
  updateDS: (id: string, updates: Partial<DesignSystem>) => void;
  editDS: (id: string, name: string, description: string, organization: string, platform: string) => void;
  deleteDS: (id: string) => void;
  setActiveDS: (id: string) => void;
  publishDS: (id: string) => void;

  updateTokens: (dsId: string, tokens: TokenSet) => void;
  addFontFile: (dsId: string, font: FontFile) => void;
  removeFontFile: (dsId: string, fontId: string) => void;
  updateComponent: (dsId: string, comp: ComponentConfig) => void;

  createContract: (contract: Omit<UIContract, 'id' | 'createdAt' | 'status' | 'affectedFiles' | 'totalScreens'>) => void;
  updateContract: (id: string, updates: Partial<UIContract>) => void;
  deleteContract: (id: string) => void;
  propagateContract: (id: string) => Promise<void>;
  addContractRule: (contractId: string, rule: Omit<ContractRule, 'id'>) => void;
  removeContractRule: (contractId: string, ruleId: string) => void;
}

function seedDS(): DesignSystem[] {
  return [
    {
      id: 'ds-marketing',
      name: 'Marketing Web',
      description: 'Primary brand design system for marketing and public-facing properties.',
      organization: 'Qualitia',
      status: 'published',
      tokens: { ...defaultTokens, seed: { ...defaultTokens.seed, color: { ...defaultTokens.seed.color, primaryColor: '#04b98c' } } },
      components: defaultComponents,
      fontFiles: [],
      contracts: [],
      createdAt: '2024-11-01T10:00:00Z',
      updatedAt: '2024-12-15T14:30:00Z',
      publishedAt: '2024-12-15T14:30:00Z',
      version: '1.3.0',
      unpublishedChanges: 0,
      thumbnailColor: '#04b98c',
      platform: 'Web',
    },
    {
      id: 'ds-enterprise',
      name: 'Enterprise Platform',
      description: 'Internal tools and admin dashboard design system.',
      organization: 'Qualitia',
      status: 'draft',
      tokens: { ...defaultTokens, seed: { ...defaultTokens.seed, color: { ...defaultTokens.seed.color, primaryColor: '#722ed1' } } },
      components: defaultComponents,
      fontFiles: [],
      contracts: [],
      createdAt: '2025-01-10T09:00:00Z',
      updatedAt: '2025-03-20T11:00:00Z',
      version: '0.8.2',
      unpublishedChanges: 3,
      thumbnailColor: '#722ed1',
      platform: 'Web',
    },
    {
      id: 'ds-mobile',
      name: 'Mobile App',
      description: 'Cross-platform mobile design system (iOS & Android).',
      organization: 'Qualitia',
      status: 'published',
      tokens: { ...defaultTokens, seed: { ...defaultTokens.seed, color: { ...defaultTokens.seed.color, primaryColor: '#1677ff' } } },
      components: defaultComponents,
      fontFiles: [],
      contracts: [],
      createdAt: '2024-08-05T08:00:00Z',
      updatedAt: '2025-02-10T16:45:00Z',
      publishedAt: '2025-02-10T16:45:00Z',
      version: '2.1.0',
      unpublishedChanges: 0,
      thumbnailColor: '#1677ff',
      platform: 'Mobile',
    },
  ];
}

function seedContracts(): UIContract[] {
  return [
    {
      id: 'contract-1',
      name: 'Brand Primary Contract',
      description: 'Enforces primary brand colors and typography across all screens.',
      targetRepo: 'github.com/qualitia/marketing-web',
      status: 'active',
      lastPropagated: '2025-05-10T09:30:00Z',
      affectedFiles: 847,
      totalScreens: 12400,
      rules: [
        { id: 'r1', tokenPath: 'seed.color.primaryColor', value: '#04b98c', description: 'Primary brand teal' },
        { id: 'r2', tokenPath: 'seed.font.fontSize', value: 14, description: 'Base font size' },
        { id: 'r3', tokenPath: 'seed.radius.borderRadius', value: 6, description: 'Default border radius' },
      ],
      createdAt: '2024-11-15T10:00:00Z',
      linkedDsId: 'ds-marketing',
    },
    {
      id: 'contract-2',
      name: 'Enterprise Dark Theme',
      description: 'Dark mode token overrides for enterprise platform.',
      targetRepo: 'github.com/qualitia/enterprise-platform',
      status: 'inactive',
      affectedFiles: 1240,
      totalScreens: 28600,
      rules: [
        { id: 'r4', tokenPath: 'seed.color.backgroundBase', value: '#141414', description: 'Dark background' },
        { id: 'r5', tokenPath: 'seed.color.textBaseColor', value: '#ffffff', description: 'Light text on dark' },
      ],
      createdAt: '2025-01-20T12:00:00Z',
      linkedDsId: 'ds-enterprise',
    },
  ];
}

export const useDSStore = create<DSState>((set, get) => ({
  designSystems: [],
  contracts: [],
  activeDS: null,

  _init() {
    let designSystems = storage.get<DesignSystem[]>('design-systems');
    let contracts = storage.get<UIContract[]>('contracts');
    if (!designSystems || designSystems.length === 0) {
      designSystems = seedDS();
      storage.set('design-systems', designSystems);
    }
    if (!contracts) {
      contracts = seedContracts();
      storage.set('contracts', contracts);
    }
    set({ designSystems, contracts });
  },

  createDS(name, description, organization, platform) {
    const color = PALETTE_COLORS[get().designSystems.length % PALETTE_COLORS.length];
    const ds: DesignSystem = {
      id: uuid(),
      name, description, organization, platform,
      status: 'draft',
      tokens: JSON.parse(JSON.stringify(defaultTokens)),
      components: JSON.parse(JSON.stringify(defaultComponents)),
      fontFiles: [],
      contracts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '0.1.0',
      unpublishedChanges: 0,
      thumbnailColor: color,
    };
    const next = [...get().designSystems, ds];
    storage.set('design-systems', next);
    set({ designSystems: next });
    return ds;
  },

  updateDS(id, updates) {
    const next = get().designSystems.map(ds =>
      ds.id === id ? { ...ds, ...updates, updatedAt: new Date().toISOString(), unpublishedChanges: (ds.unpublishedChanges || 0) + 1 } : ds
    );
    storage.set('design-systems', next);
    const active = get().activeDS;
    set({ designSystems: next, activeDS: active?.id === id ? next.find(d => d.id === id) ?? null : active });
  },

  editDS(id, name, description, organization, platform) {
    const next = get().designSystems.map(ds =>
      ds.id === id ? { ...ds, name, description, organization, platform, updatedAt: new Date().toISOString() } : ds
    );
    storage.set('design-systems', next);
    const active = get().activeDS;
    set({ designSystems: next, activeDS: active?.id === id ? next.find(d => d.id === id) ?? null : active });
  },

  addFontFile(dsId, font) {
    const ds = get().designSystems.find(d => d.id === dsId);
    if (!ds) return;
    const fontFiles = [...(ds.fontFiles ?? []), font];
    const next = get().designSystems.map(d => d.id === dsId ? { ...d, fontFiles, updatedAt: new Date().toISOString() } : d);
    storage.set('design-systems', next);
    const active = get().activeDS;
    set({ designSystems: next, activeDS: active?.id === dsId ? next.find(d => d.id === dsId) ?? null : active });
  },

  removeFontFile(dsId, fontId) {
    const ds = get().designSystems.find(d => d.id === dsId);
    if (!ds) return;
    const fontFiles = (ds.fontFiles ?? []).filter(f => f.id !== fontId);
    const next = get().designSystems.map(d => d.id === dsId ? { ...d, fontFiles, updatedAt: new Date().toISOString() } : d);
    storage.set('design-systems', next);
    const active = get().activeDS;
    set({ designSystems: next, activeDS: active?.id === dsId ? next.find(d => d.id === dsId) ?? null : active });
  },

  deleteDS(id) {
    const next = get().designSystems.filter(ds => ds.id !== id);
    storage.set('design-systems', next);
    set({ designSystems: next, activeDS: get().activeDS?.id === id ? null : get().activeDS });
  },

  setActiveDS(id) {
    const ds = get().designSystems.find(d => d.id === id) ?? null;
    set({ activeDS: ds });
  },

  publishDS(id) {
    const now = new Date().toISOString();
    const next = get().designSystems.map(ds =>
      ds.id === id ? { ...ds, status: 'published' as const, publishedAt: now, unpublishedChanges: 0, updatedAt: now } : ds
    );
    storage.set('design-systems', next);
    const active = get().activeDS;
    set({ designSystems: next, activeDS: active?.id === id ? next.find(d => d.id === id) ?? null : active });
  },

  updateTokens(dsId, tokens) {
    const next = get().designSystems.map(ds =>
      ds.id === dsId ? { ...ds, tokens, updatedAt: new Date().toISOString(), unpublishedChanges: (ds.unpublishedChanges || 0) + 1 } : ds
    );
    storage.set('design-systems', next);
    const active = get().activeDS;
    set({ designSystems: next, activeDS: active?.id === dsId ? next.find(d => d.id === dsId) ?? null : active });
  },

  updateComponent(dsId, comp) {
    const ds = get().designSystems.find(d => d.id === dsId);
    if (!ds) return;
    const components = ds.components.map(c => c.id === comp.id ? comp : c);
    get().updateDS(dsId, { components });
  },

  createContract(data) {
    const contract: UIContract = {
      id: uuid(),
      ...data,
      status: 'inactive',
      affectedFiles: Math.floor(Math.random() * 2000) + 100,
      totalScreens: Math.floor(Math.random() * 50000) + 5000,
      createdAt: new Date().toISOString(),
    };
    const next = [...get().contracts, contract];
    storage.set('contracts', next);
    set({ contracts: next });
  },

  updateContract(id, updates) {
    const next = get().contracts.map(c => c.id === id ? { ...c, ...updates } : c);
    storage.set('contracts', next);
    set({ contracts: next });
  },

  deleteContract(id) {
    const next = get().contracts.filter(c => c.id !== id);
    storage.set('contracts', next);
    set({ contracts: next });
  },

  async propagateContract(id) {
    get().updateContract(id, { status: 'propagating' });
    await new Promise(r => setTimeout(r, 2500));
    const rand = Math.floor(Math.random() * 1000) + 500;
    get().updateContract(id, {
      status: 'active',
      lastPropagated: new Date().toISOString(),
      affectedFiles: rand,
    });
  },

  addContractRule(contractId, rule) {
    const contract = get().contracts.find(c => c.id === contractId);
    if (!contract) return;
    const newRule: ContractRule = { id: uuid(), ...rule };
    get().updateContract(contractId, { rules: [...contract.rules, newRule] });
  },

  removeContractRule(contractId, ruleId) {
    const contract = get().contracts.find(c => c.id === contractId);
    if (!contract) return;
    get().updateContract(contractId, { rules: contract.rules.filter(r => r.id !== ruleId) });
  },
}));
