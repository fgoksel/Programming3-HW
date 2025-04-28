<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { currentUser } from '$lib/stores';

    onMount(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            $currentUser = null;
            await goto('/login');
        } catch (error) {
            console.error('Logout error:', error);
            await goto('/login');
        }
    });
</script>

<div class="logout-container">
    <div class="loading">Logging out...</div>
</div>

<style>
    .logout-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
    }

    .loading {
        font-size: 18px;
        color: #4f46e5;
    }
</style>