import { writable } from 'svelte/store';
import type { SafeUser } from '$lib/types';

const storedUser = typeof window !== 'undefined'
    ? localStorage.getItem('currentUser')
    : null;

const initialUser: SafeUser | null = storedUser ? JSON.parse(storedUser) : null;

export const currentUser = writable<SafeUser | null>(initialUser);

if (typeof window !== 'undefined') {
    currentUser.subscribe((user) => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    });
}
