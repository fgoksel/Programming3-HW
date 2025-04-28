<script lang="ts">
    import { goto } from '$app/navigation';
    import { currentUser } from '$lib/stores';
    import type { SafeUser } from '$lib/types';

    let email = '';
    let password = '';
    let error = '';
    let isLoading = false;
    let rememberMe = false;

    async function handleLogin() {

        error = '';

        if (!email || !password) {
            error = 'Email and password are required';
            return;
        }

        try {
            isLoading = true;

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid email or password');
            }


            $currentUser = data.data.user as SafeUser;


            await goto('/dashboard');
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'An unexpected error occurred';
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="login-container">
    <div class="login-card">
        <h1>Login</h1>

        {#if error}
            <div class="error-message">
                {error}
            </div>
        {/if}

        <form on:submit|preventDefault={handleLogin}>
            <div class="form-group">
                <label for="email">Email</label>
                <input
                        type="email"
                        id="email"
                        bind:value={email}
                        placeholder="Enter your email"
                        required
                        autocomplete="email"
                />
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input
                        type="password"
                        id="password"
                        bind:value={password}
                        placeholder="Enter your password"
                        required
                        autocomplete="current-password"
                />
            </div>

            <div class="form-options">
                <div class="remember-me">
                    <input type="checkbox" id="remember" bind:checked={rememberMe} />
                    <label for="remember">Remember me</label>
                </div>
                <a href="/reset-password" class="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
        </form>

        <div class="register-link">
            Don't have an account? <a href="/register">Register</a>
        </div>
    </div>
</div>

<style>
    .login-container {
        display: flex;
        justify-content: center;
        padding: 20px;
    }

    .login-card {
        width: 100%;
        max-width: 400px;
        padding: 24px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h1 {
        margin-bottom: 24px;
        text-align: center;
        font-size: 24px;
    }

    .error-message {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 16px;
    }

    .form-group {
        margin-bottom: 16px;
    }

    label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
    }

    input[type="email"],
    input[type="password"] {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 16px;
    }

    input:focus {
        outline: none;
        border-color: #4f46e5;
    }

    .form-options {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        font-size: 14px;
    }

    .remember-me {
        display: flex;
        align-items: center;
    }

    .remember-me input {
        margin-right: 8px;
    }

    .forgot-password {
        color: #4f46e5;
        text-decoration: none;
    }

    button {
        width: 100%;
        padding: 12px;
        background-color: #4f46e5;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
    }

    button:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }

    .register-link {
        margin-top: 16px;
        text-align: center;
        font-size: 14px;
    }

    .register-link a {
        color: #4f46e5;
        text-decoration: none;
    }
</style>