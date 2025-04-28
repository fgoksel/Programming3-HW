<script lang="ts">
    import { currentUser } from '$lib/stores';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';

    function showAlert(type: 'success' | 'error', message: string) {
        const alert = document.createElement('div');
        alert.className = `alert ${type}`;
        alert.textContent = message;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 3000);
    }

    let petData = {
        name: '',
        breed: '',
        age: '',
        type: 'puppy',
        description: '',
        image: ''
    };

    let isLoading = false;
    let errors: Record<string, string> = {};

    onMount(() => {
        const unsubscribe = currentUser.subscribe(async (user) => {
            if (!user) {
                await goto('/login');
            } else if (user.role !== 'admin') {
                await goto('/');
            }
        });

        return () => unsubscribe();
    });

    async function addPet() {
        errors = {};
        isLoading = true;


        if (!petData.name.trim()) errors.name = 'Name is required';
        if (!petData.breed.trim()) errors.breed = 'Breed is required';
        if (!petData.age || isNaN(Number(petData.age))) errors.age = 'Valid age is required';
        if (!petData.type) errors.type = 'Type is required';

        if (Object.keys(errors).length > 0) {
            isLoading = false;
            return;
        }

        try {
            const response = await fetch('/api/pets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...petData,
                    age: Number(petData.age)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add pet');
            }

            showAlert('success', 'Pet added successfully!');
            await goto('/admin/pets');

        } catch (error) {
            console.error('Add pet error:', error);
            const message = error instanceof Error ? error.message : 'Failed to add pet';
            showAlert('error', message);
        } finally {
            isLoading = false;
        }
    }
</script>

<h1>Add a New Pet</h1>

<form on:submit|preventDefault={addPet}>
    <div class="form-group">
        <label for="name">Pet Name*</label>
        <input
                id="name"
                type="text"
                bind:value={petData.name}
                class:error={errors.name}
                aria-invalid={!!errors.name}
        />
        {#if errors.name}
            <small class="error-message">{errors.name}</small>
        {/if}
    </div>

    <div class="form-group">
        <label for="breed">Breed*</label>
        <input
                id="breed"
                type="text"
                bind:value={petData.breed}
                class:error={errors.breed}
                aria-invalid={!!errors.breed}
        />
        {#if errors.breed}
            <small class="error-message">{errors.breed}</small>
        {/if}
    </div>

    <div class="form-group">
        <label for="age">Age (months)*</label>
        <input
                id="age"
                type="number"
                bind:value={petData.age}
                min="0"
                class:error={errors.age}
                aria-invalid={!!errors.age}
        />
        {#if errors.age}
            <small class="error-message">{errors.age}</small>
        {/if}
    </div>

    <div class="form-group">
        <label for="type">Type*</label>
        <select
                id="type"
                bind:value={petData.type}
                class:error={errors.type}
                aria-invalid={!!errors.type}
        >
            <option value="puppy">Puppy</option>
            <option value="kitten">Kitten</option>
            <option value="other">Other</option>
        </select>
        {#if errors.type}
            <small class="error-message">{errors.type}</small>
        {/if}
    </div>

    <div class="form-group">
        <label for="description">Description</label>
        <textarea
                id="description"
                bind:value={petData.description}
                rows="3"
        ></textarea>
    </div>

    <div class="form-group">
        <label for="image">Image URL</label>
        <input
                id="image"
                type="url"
                bind:value={petData.image}
                placeholder="https://example.com/pet.jpg"
        />
    </div>

    <button type="submit" disabled={isLoading} class="submit-btn">
        {#if isLoading}
            <span class="spinner" aria-hidden="true"></span>
            Processing...
        {:else}
            Add Pet
        {/if}
    </button>
</form>

<style>
    form {
        display: grid;
        gap: 1rem;
        max-width: 500px;
        margin: 2rem auto;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        background: white;
    }

    .form-group {
        display: grid;
        gap: 0.5rem;
    }

    label {
        font-weight: 500;
        color: #333;
    }

    input, select, textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }

    input.error, select.error {
        border-color: #e74c3c;
    }

    .error-message {
        color: #e74c3c;
        font-size: 0.875rem;
    }

    .submit-btn {
        padding: 0.75rem;
        background-color: #4f46e5;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .submit-btn:hover {
        background-color: #4338ca;
    }

    .submit-btn:disabled {
        background-color: #a5b4fc;
        cursor: not-allowed;
    }

    .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

</style>