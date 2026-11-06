import { writable } from 'svelte/store';

export const fontSheetOpen = writable(false);
export const locationSavedNotice = writable<string | null>(null);
