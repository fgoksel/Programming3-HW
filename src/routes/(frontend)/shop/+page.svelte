<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { goto } from '$app/navigation';

    let error = '';
    let success = '';

    const items = [
        { id: 'food', name: 'Pet Food', price: 5, description: 'Nutritious food that reduces hunger by 20%' },
        { id: 'toy', name: 'Toy', price: 10, description: 'Fun toy that increases happiness by 30%' },
        { id: 'treat', name: 'Special Treat', price: 15, description: 'Delicious treat that reduces hunger by 10% and increases happiness by 20%' }
    ];

    async function buyItem(itemId: string) {
        if (!$currentUser) {
            error = 'Please log in to make purchases';
            goto('/login');
            return;
        }

        error = '';
        success = '';

        try {
            const response = await fetch('/api/shop/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: $currentUser.id,
                    itemId
                })
            });

            const data = await response.json();
            if (data.success) {
                success = data.message;
                // Update current user's inventory and budget
                $currentUser = {
                    ...$currentUser,
                    budget: data.user.budget,
                    inventory: data.user.inventory
                };
            } else {
                error = data.error || 'Failed to purchase item';
            }
        } catch (err) {
            console.error('Purchase error:', err);
            error = 'Failed to process purchase';
        }
    }
</script>

<h1>🛍️ Pet Shop</h1>

{#if error}
    <p class="error">{error}</p>
{/if}
{#if success}
    <p class="success">{success}</p>
{/if}

{#if $currentUser}
    <p class="budget">Your budget: ${$currentUser.budget}</p>
    <div class="inventory">
        <h3>Your Inventory:</h3>
        <ul>
            <li>Food: {$currentUser.inventory?.food || 0}</li>
            <li>Toys: {$currentUser.inventory?.toy || 0}</li>
            <li>Treats: {$currentUser.inventory?.treat || 0}</li>
        </ul>
    </div>
{:else}
    <p>Please log in to view the shop.</p>
{/if}

<div class="items-grid">
    {#each items as item}
        <div class="item-card">
            <h3>{item.name}</h3>
            <p class="price">${item.price}</p>
            <p class="description">{item.description}</p>
            <button 
                on:click={() => buyItem(item.id)}
                disabled={!$currentUser || $currentUser.budget < item.price}
            >
                Buy Now
            </button>
        </div>
    {/each}
</div>

<style>
    .budget {
        font-size: 1.2rem;
        font-weight: bold;
        color: #2e7d32;
        margin: 1rem 0;
    }

    .inventory {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 8px;
        margin: 1rem 0;
    }

    .inventory h3 {
        margin: 0 0 0.5rem 0;
    }

    .inventory ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .inventory li {
        margin: 0.25rem 0;
    }

    .items-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .item-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .item-card h3 {
        margin: 0 0 0.5rem 0;
        color: #333;
    }

    .price {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2e7d32;
        margin: 0.5rem 0;
    }

    .description {
        color: #666;
        margin: 1rem 0;
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

    .error {
        color: red;
        font-weight: bold;
    }

    .success {
        color: green;
        font-weight: bold;
    }
</style>