import { create } from 'zustand'

interface NavigationState {
  menuOpen: boolean
  sidebarCollapsed: boolean
  toggleMenu: () => void
  closeMenu: () => void
  toggleSidebar: () => void
}

export const useNavigation = create<NavigationState>((set) => ({
  menuOpen: false,
  sidebarCollapsed: false,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}))
