<script lang="ts">
    import { onMount } from 'svelte';
    import { currentUser } from '$lib/stores';
    import type { Pet } from '$lib/types';
    import { goto } from '$app/navigation';
    import { Pet as PetModel } from '$lib/models';

    let pets: Pet[] = [];
    let error = '';
    let success = '';
    let loading = false;

    $: user = $currentUser;

    async function loadPets() {
        loading = true;
        error = '';
        if (user && user.adoptedPets && user.adoptedPets.length > 0) {
            try {
                const adoptedPetsIds = user.adoptedPets.map(pet => pet.id);

                const res = await fetch('/api/pets');
                if (!res.ok) {
                    throw "Failed to load pets";
                }
                const response = await res.json();
                if (response.success && response.data) {
                    pets = response.data
                        .filter((pet: Pet) => 
                            adoptedPetsIds.includes(pet.id) && 
                            pet.adopted && 
                            pet.adoptedBy === user.id.toString()
                        )
                        .map((pet: Pet) => PetModel.fromJSON(pet));
                }
            } catch (err) {
                console.error(err);
                error = "Failed to load pets";
            }
        } else {
            pets = [];
        }
        loading = false;
    }

    async function handleAction(petId: number, action: 'feed' | 'play' | 'return') {
        error = '';
        success = '';

        if (!user) {
            error = "You must be logged in to perform this action";
            goto('/login');
            return;
        }

        try {
            let response;
            if (action === 'return') {
                response = await fetch(`/api/pets/${petId}/return`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: user.id
                    })
                });
            } else {
                response = await fetch(`/api/pets/${petId}/actions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        action,
                        userId: user.id
                    })
                });
            }

            const data = await response.json();
            if (data.success) {
                success = data.data.message;
                if (data.data.user) {
                    $currentUser = {
                        ...$currentUser,
                        ...data.data.user
                    };
                    await loadPets();
                }
            } else {
                error = data.error || 'Failed to perform action';
            }
        } catch (err) {
            console.error('Action error:', err);
            error = 'Failed to perform action';
        }
    }

    async function resetPets() {
        if (!user) {
            error = "You must be logged in to perform this action";
            goto('/login');
            return;
        }

        try {
            const response = await fetch('/api/pets/reset', {
                method: 'POST'
            });

            const data = await response.json();
            if (data.success) {
                success = data.message;
                await loadPets();
            } else {
                error = data.error || 'Failed to reset pets';
            }
        } catch (err) {
            console.error('Reset error:', err);
            error = 'Failed to reset pets';
        }
    }

    onMount(() => {
        if (!user) {
            goto('/login');
        } else {
            loadPets();
        }
    });
</script>

<h1>📋 Your Adopted Pets</h1>

{#if success}
    <p class="success">{success}</p>
{/if}
{#if error}
    <p class="error">{error}</p>
{/if}

<div class="controls">
    <button class="reset-button" on:click={resetPets}>
        Reset All Pets
    </button>
</div>

{#if loading}
    <p class="loading">Loading your pets...</p>
{:else if pets.length === 0}
    <div class="empty-state">
        <h2>No Adopted Pets</h2>
        <p>You haven't adopted any pets yet. Visit the <a href="/">Browse Pets</a> page to find your perfect companion!</p>
        <div class="inventory-info">
            <h3>Your Current Inventory:</h3>
            <ul>
                <li>Food: {$currentUser?.inventory?.food || 0}</li>
                <li>Toys: {$currentUser?.inventory?.toy || 0}</li>
                <li>Treats: {$currentUser?.inventory?.treat || 0}</li>
            </ul>
            <p class="hint">When you adopt a pet, you'll receive a starter pack of items!</p>
        </div>
    </div>
{:else}
    <div class="pet-grid">
        {#each pets as pet (pet.id)}
            <div class="pet-card">
                <h3>{pet.name}</h3>
                <p class="breed">{pet.breed}</p>
                <p class="type">{pet.type}</p>
                <div class="stats">
                    <div class="stat">
                        <span class="label">Happiness:</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: {pet.happiness}%"></div>
                        </div>
                        <span class="value">{pet.happiness}%</span>
                    </div>
                    <div class="stat">
                        <span class="label">Hunger:</span>
                        <div class="progress-bar">
                            <div class="progress" style="width: {pet.hunger}%"></div>
                        </div>
                        <span class="value">{pet.hunger}%</span>
                    </div>
                </div>
                <div class="actions">
                    <button 
                        on:click={() => handleAction(pet.id, 'feed')}
                        disabled={pet.hunger === 0}
                    >
                        Feed
                    </button>
                    <button 
                        on:click={() => handleAction(pet.id, 'play')}
                        disabled={pet.happiness === 100}
                    >
                        Play
                    </button>
                    <button 
                        on:click={() => handleAction(pet.id, 'return')}
                        class="return"
                    >
                        Return
                    </button>
                </div>
            </div>
        {/each}
    </div>
{/if}

<style>
    .pet-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .pet-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1.5rem;
        text-align: center;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s;
    }

    .pet-card:hover {
        transform: translateY(-5px);
    }

    .pet-card h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }

    .breed {
        color: #666;
        font-style: italic;
        margin: 0.5rem 0;
    }

    .type {
        text-transform: capitalize;
        color: #888;
        margin: 0.5rem 0;
    }

    .stats {
        margin: 1.5rem 0;
    }

    .stat {
        margin: 0.75rem 0;
        text-align: left;
    }

    .label {
        display: block;
        margin-bottom: 0.25rem;
        color: #666;
        font-size: 0.9rem;
    }

    .progress-bar {
        height: 8px;
        background: #eee;
        border-radius: 4px;
        overflow: hidden;
        margin: 0.25rem 0;
    }

    .progress {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s ease;
    }

    .value {
        font-size: 0.9rem;
        color: #666;
    }

    .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        margin-top: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background-color: #4CAF50;
        color: white;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
    }

    button:hover:not(:disabled) {
        background-color: #45a049;
        transform: translateY(-2px);
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    button.return {
        background-color: #f44336;
    }

    button.return:hover {
        background-color: #da190b;
    }

    .success {
        color: #2e7d32;
        background: #e8f5e9;
        padding: 0.75rem;
        border-radius: 4px;
        margin: 1rem 0;
        text-align: center;
    }

    .error {
        color: #c62828;
        background: #ffebee;
        padding: 0.75rem;
        border-radius: 4px;
        margin: 1rem 0;
        text-align: center;
    }

    .loading {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 2rem 0;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin: 2rem 0;
    }

    .empty-state h2 {
        color: #333;
        margin-bottom: 1rem;
    }

    .empty-state p {
        color: #666;
        margin-bottom: 1.5rem;
    }

    .empty-state a {
        color: #4CAF50;
        text-decoration: none;
        font-weight: 500;
    }

    .empty-state a:hover {
        text-decoration: underline;
    }

    .inventory-info {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 1.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .inventory-info h3 {
        color: #333;
        margin-bottom: 1rem;
    }

    .inventory-info ul {
        list-style: none;
        padding: 0;
        margin: 0 0 1rem 0;
    }

    .inventory-info li {
        color: #666;
        margin: 0.5rem 0;
        font-size: 1.1rem;
    }

    .hint {
        color: #888;
        font-style: italic;
        font-size: 0.9rem;
    }

    .controls {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1rem;
    }

    .reset-button {
        background-color: #f44336;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .reset-button:hover {
        background-color: #da190b;
    }
</style>