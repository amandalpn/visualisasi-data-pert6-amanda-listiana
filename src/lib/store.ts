// src/lib/store.ts
import { create, type StateCreator } from 'zustand';
import { devtools } from 'zustand/middleware';

export type WeekRange = [number, number];

export type FilterState = {
  modules: string[];
  presentations: string[];
  regions: string[];
  ageBands: string[];
  educationLevels: string[];
  genders: string[];
  disabilities: string[];
  weekRange: WeekRange;
};

export type SelectionState = {
  moduleForDrilldown?: { code_module: string; code_presentation: string };
  region?: string;
  studentIds: string[];
};

export type UiState = {
  density: 'comfortable' | 'compact';
  showLabels: boolean;
};

type StoreState = {
  filters: FilterState;
  selection: SelectionState;
  ui: UiState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  setSelection: (selection: Partial<SelectionState>) => void;
  resetSelection: () => void;
  setUi: (ui: Partial<UiState>) => void;
};

const defaultFilters: FilterState = {
  modules: [],
  presentations: [],
  regions: [],
  ageBands: [],
  educationLevels: [],
  genders: [],
  disabilities: [],
  weekRange: [0, 52],
};

const defaultUi: UiState = {
  density: 'comfortable',
  showLabels: true,
};

const defaultSelection: SelectionState = {
  studentIds: [],
};

// >>> Penting: beri generics middleware pada StateCreator
const createStore: StateCreator<
  StoreState,
  [['zustand/devtools', never]], // enable argumen ke-3 (action name)
  []
> = (set) => ({
  filters: defaultFilters,
  selection: defaultSelection,
  ui: defaultUi,

  setFilter: (key, value) =>
    set(
      (state) => ({
        filters: {
          ...state.filters,
          [key]: value,
        },
      }),
      false,
      `set_${String(key)}`,
    ),

  resetFilters: () => set(() => ({ filters: { ...defaultFilters } }), false, 'reset_filters'),

  setSelection: (selection) =>
    set((state) => ({ selection: { ...state.selection, ...selection } }), false, 'set_selection'),

  resetSelection: () =>
    set(() => ({ selection: { ...defaultSelection } }), false, 'reset_selection'),

  setUi: (ui) => set((state) => ({ ui: { ...state.ui, ...ui } }), false, 'set_ui'),
});

// Bungkus dengan devtools + beri nama untuk Redux DevTools
export const useAppStore = create<StoreState>()(devtools(createStore, { name: 'AppStore' }));
