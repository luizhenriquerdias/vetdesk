import {
  GalleryVerticalEnd,
  Home,
  LogOut,
  PanelLeft,
  X,
} from 'lucide-vue-next';

export const ICON_MAP = {
  galleryVerticalEnd: GalleryVerticalEnd,
  home: Home,
  logout: LogOut,
  panelLeft: PanelLeft,
  x: X,
} as const;

export type IconName = keyof typeof ICON_MAP;

