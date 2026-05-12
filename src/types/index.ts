export type Role = 'admin' | 'editor' | 'viewer';

export interface FontFile {
  id: string;
  familyName: string;       // CSS font-family name the user assigns
  fileName: string;         // original file name
  format: 'truetype' | 'opentype' | 'woff' | 'woff2';
  dataUrl: string;          // base64 data URL stored for persistence
  weight: number;           // 100-900
  style: 'normal' | 'italic';
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  active: boolean;
}

export interface ColorTokens {
  primaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
  textBaseColor: string;
  backgroundBase: string;
  linkColor: string;
  geekBlue: string;
  gold: string;
  green: string;
  lime: string;
  magenta: string;
  orange: string;
}

export interface SizeTokens {
  controlHeight: number;
  popupArrowSize: number;
  sizeStep: number;
  sizeUnit: number;
}

export interface FontTokens {
  fontFamily: string;
  fontSize: number;
  fontSizeLG: number;
  fontSizeSM: number;
  fontWeightStrong: number;
  lineHeight: number;
}

export interface LineTokens {
  lineWidth: number;
  lineType: 'solid' | 'dashed' | 'dotted';
}

export interface MotionTokens {
  motionDurationFast: string;
  motionDurationMid: string;
  motionDurationSlow: string;
}

export interface RadiusTokens {
  borderRadius: number;
  borderRadiusLG: number;
  borderRadiusSM: number;
  borderRadiusXS: number;
}

export interface SeedTokens {
  color: ColorTokens;
  size: SizeTokens;
  font: FontTokens;
  line: LineTokens;
  motion: MotionTokens;
  radius: RadiusTokens;
}

export interface DerivedTokens {
  breakpoints: Record<string, number>;
  color: Record<string, string>;
  control: Record<string, number>;
  font: Record<string, string | number>;
  line: Record<string, string | number>;
  link: Record<string, string>;
  motion: Record<string, string>;
  radius: Record<string, number>;
  size: Record<string, number>;
}

export interface TokenSet {
  seed: SeedTokens;
  derived: DerivedTokens;
}

export type ComponentCategory =
  | 'General'
  | 'Layout'
  | 'Navigation'
  | 'Data Entry'
  | 'Data Display'
  | 'Feedback'
  | 'Other';

export interface ComponentConfig {
  id: string;
  name: string;
  category: ComponentCategory;
  overrides: Record<string, string | number | boolean>;
}

export interface ContractRule {
  id: string;
  tokenPath: string;
  value: string | number;
  description: string;
}

export interface UIContract {
  id: string;
  name: string;
  description: string;
  targetRepo: string;
  status: 'active' | 'inactive' | 'propagating' | 'error';
  lastPropagated?: string;
  affectedFiles: number;
  totalScreens: number;
  rules: ContractRule[];
  createdAt: string;
  linkedDsId: string;
}

export type DSStatus = 'published' | 'draft' | 'archived';

export interface DesignSystem {
  id: string;
  name: string;
  description: string;
  organization: string;
  status: DSStatus;
  tokens: TokenSet;
  components: ComponentConfig[];
  fontFiles: FontFile[];
  contracts: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: string;
  unpublishedChanges: number;
  thumbnailColor: string;
  platform: string;
}

export type TokenCategory =
  | 'all'
  | 'color'
  | 'font'
  | 'line'
  | 'motion'
  | 'other'
  | 'radius'
  | 'size'
  | 'style'
  | 'layout';

export type DerivedCategory =
  | 'all'
  | 'breakpoint'
  | 'color'
  | 'control'
  | 'font'
  | 'line'
  | 'link'
  | 'motion'
  | 'radius'
  | 'size';
