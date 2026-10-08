import { create } from 'zustand'

interface NavigationState {
  menuOpen: boolean
  toggleMenu: () => void
  closeMenu: () => void
}

export const useNavigation = create<NavigationState>((set) => ({
  menuOpen: false,
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
  closeMenu: () => set({ menuOpen: false }),
}))
