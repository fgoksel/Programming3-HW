<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';

    interface User {
        id: string;
        name: string;
        role: 'user' | 'admin';
        email?: string;
        avatar?: string;
    }

    $: user = $currentUser as User | null;
    $: currentPath = $page.url.pathname;
</script>

<nav class="navbar">
    <div class="nav-brand">
        <a href="/" class="logo">PetAdopt</a>
    </div>

    <div class="nav-links">
        <a href="/" class:active={currentPath === '/'}>Browse Pets</a>
        {#if user}
            <a href="/dashboard" class:active={currentPath === '/dashboard'}>My Pets</a>
            <a href="/shop" class:active={currentPath === '/shop'}>Shop</a>
            {#if user.role === 'admin'}
                <a href="/admin" class="admin-link" class:active={currentPath === '/admin'}>Admin</a>
            {/if}
        {/if}
    </div>

    <div class="nav-actions">
        {#if user}
            <div class="user-profile">
                {#if user.avatar}
                    <img src={user.avatar} alt={user.name} class="avatar" />
                {:else}
                    <div class="avatar-placeholder">{user.name.charAt(0)}</div>
                {/if}
                <span class="user-name">{user.name}</span>
            </div>
            <button class="btn btn-outline" on:click={() => goto('/logout')}>
                Logout
            </button>
        {:else}
            <a href="/login" class="btn btn-text">Sign In</a>
            <a href="/register" class="btn btn-primary">Register</a>
        {/if}
    </div>
</nav>

<slot />

<style>
    :global(:root) {
        --primary: #4f46e5;
        --primary-hover: #4338ca;
        --text: #374151;
        --text-light: #6b7280;
        --bg: #ffffff;
        --border: #e5e7eb;
        --admin: #dc2626;
    }

    .navbar {
        background: var(--bg);
        padding: 0.75rem 2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border);
        font-family: 'Inter', -apple-system, sans-serif;
        position: sticky;
        top: 0;
        z-index: 50;
    }

    .logo {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--primary);
        text-decoration: none;
    }

    .nav-links {
        display: flex;
        gap: 1.5rem;
        align-items: center;
    }

    .nav-links a {
        color: var(--text);
        text-decoration: none;
        font-weight: 500;
        font-size: 0.95rem;
        transition: all 0.2s;
        padding: 0.5rem 0;
        position: relative;
    }

    .nav-links a:hover {
        color: var(--primary);
    }

    .nav-links a.active {
        color: var(--primary);
        font-weight: 600;
    }

    .nav-links a.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: var(--primary);
    }

    .admin-link {
        color: var(--admin) !important;
    }

    .nav-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-decoration: none;
    }

    .btn-primary {
        background: var(--primary);
        color: white;
        border: none;
    }

    .btn-primary:hover {
        background: var(--primary-hover);
    }

    .btn-outline {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text);
    }

    .btn-outline:hover {
        background: #f9fafb;
    }

    .btn-text {
        color: var(--text);
        background: transparent;
        border: none;
    }

    .btn-text:hover {
        color: var(--primary);
    }

    .user-profile {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .avatar, .avatar-placeholder {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #e0e7ff;
        color: var(--primary);
        font-weight: 600;
        font-size: 0.875rem;
        overflow: hidden;
    }

    .avatar {
        object-fit: cover;
    }

    .user-name {
        font-size: 0.875rem;
        color: var(--text);
        font-weight: 500;
    }

    @media (max-width: 768px) {
        .navbar {
            padding: 0.75rem 1rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .nav-links {
            order: 3;
            width: 100%;
            justify-content: center;
            padding-top: 0.5rem;
            border-top: 1px solid var(--border);
        }
    }
</style>