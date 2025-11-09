import {
  GalleryVerticalEnd,
  Home,
  LogOut,
  PanelLeft,
  X,
  Plus,
  MoreVertical,
  Edit,
  Trash,
  Users,
  RotateCcw,
  Stethoscope,
  Tag,
} from 'lucide-vue-next';

export const ICON_MAP = {
  galleryVerticalEnd: GalleryVerticalEnd,
  home: Home,
  logout: LogOut,
  panelLeft: PanelLeft,
  x: X,
  plus: Plus,
  'more-vertical': MoreVertical,
  edit: Edit,
  trash: Trash,
  users: Users,
  'rotate-ccw': RotateCcw,
  stethoscope: Stethoscope,
  tag: Tag,
} as const;

export type IconName = keyof typeof ICON_MAP;

