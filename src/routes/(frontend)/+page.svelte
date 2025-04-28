<script lang="ts">
    import { onMount } from 'svelte';
    import { currentUser } from "$lib/stores";
    import type { Pet } from '$lib/types';

    let pets: Omit<Pet, 'adopt' | 'toJSON' | 'feed' | 'play' | 'return'>[] = [];
    let petType: '' | 'puppy' | 'kitten' | 'other' = '';
    let searchQuery = '';
    let error = '';
    let success = '';
    let loading = false;

    async function loadPets() {
        loading = true;
        error = '';
        try {
            const res = await fetch(`/api/pets${petType ? `?type=${petType}` : ''}`);
            if (res.ok) {
                const response = await res.json();
                if (response.success && response.data) {
                    pets = response.data;
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        pets = pets.filter(pet => 
                            pet.name.toLowerCase().includes(query) ||
                            pet.breed.toLowerCase().includes(query)
                        );
                    }
                } else {
                    error = response.error || 'Failed to load pets';
                }
            } else {
                error = 'Failed to load pets';
            }
        } catch (err) {
            console.error('Error loading pets:', err);
            error = 'Failed to load pets';
        } finally {
            loading = false;
        }
    }

    async function adopt(petId: number) {
        if (!$currentUser) {
            alert('Please sign in to adopt a pet');
            return;
        }

        error = '';
        success = '';

        try {
            const res = await fetch(`/api/pets/${petId}/adopt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: $currentUser.id })
            });

            const response = await res.json();

            if (response.success) {
                success = `Successfully adopted ${pets.find(p => p.id === petId)?.name}!`;
                $currentUser = {
                    ...$currentUser,
                    ...response.data.user
                };
                await loadPets();
            } else {
                error = response.error || 'Failed to adopt pet';
            }
        } catch (err) {
            error = 'Failed to process adoption request';
            console.error('Adoption error:', err);
        }
    }

    $: {
        loadPets();
    }
</script>

<h1>Browse Adoptable Pets</h1>

{#if error}
    <p class="error">{error}</p>
{/if}
{#if success}
    <p class="success">{success}</p>
{/if}

<div class="controls">
    <div class="search-box">
        <input 
            type="text" 
            bind:value={searchQuery} 
            placeholder="Search by name or breed..."
            on:input={loadPets}
        />
    </div>
    <div class="filter-controls">
        <select bind:value={petType} on:change={loadPets}>
            <option value="">All Pets</option>
            <option value="puppy">Puppies</option>
            <option value="kitten">Kittens</option>
            <option value="other">Other Pets</option>
        </select>
    </div>
</div>

{#if loading}
    <p class="loading">Loading pets...</p>
{:else if pets.length === 0}
    <p class="no-pets">No pets found matching your search.</p>
{:else}
    <div class="pet-grid">
        {#each pets as pet (pet.id)}
            <div class="pet-card">
                <h3>{pet.name}</h3>
                <p class="breed">{pet.breed}</p>
                <p class="type">{pet.type}</p>
                <div class="stats">
                    <p>Happiness: {pet.happiness}%</p>
                    <p>Hunger: {pet.hunger}%</p>
                </div>
                {#if !pet.adopted}
                    <button on:click={() => adopt(pet.id)} disabled={!$currentUser}>
                        Adopt Me
                    </button>
                {:else}
                    <p class="adopted">Adopted!</p>
                {/if}
            </div>
        {/each}
    </div>
{/if}

<style>
    .controls {
        display: flex;
        gap: 1rem;
        margin: 1rem 0;
        flex-wrap: wrap;
    }

    .search-box {
        flex: 1;
        min-width: 200px;
    }

    .search-box input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .filter-controls {
        min-width: 150px;
    }

    .filter-controls select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .pet-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .pet-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
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
        margin: 1rem 0;
        padding: 0.5rem;
        background: #f5f5f5;
        border-radius: 4px;
    }

    .stats p {
        margin: 0.25rem 0;
    }

    button {
        width: 100%;
        padding: 0.75rem;
        border: none;
        border-radius: 4px;
        background-color: #4CAF50;
        color: white;
        cursor: pointer;
        transition: background-color 0.3s;
        font-weight: bold;
    }

    button:hover:not(:disabled) {
        background-color: #45a049;
    }

    button:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }

    .adopted {
        color: #666;
        font-style: italic;
        margin: 1rem 0 0 0;
    }

    .error {
        color: red;
        font-weight: bold;
    }

    .success {
        color: green;
        font-weight: bold;
    }

    .loading {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 2rem 0;
    }

    .no-pets {
        text-align: center;
        color: #666;
        font-style: italic;
        margin: 2rem 0;
    }
</style>