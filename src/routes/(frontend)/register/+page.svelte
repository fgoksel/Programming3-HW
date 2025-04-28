<script lang="ts">
    import { goto } from '$app/navigation';
    import { currentUser } from '$lib/stores';
    import type { ApiResponse, SafeUser } from '$lib/types';

    let name = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let agreeToTerms = false;
    let errorMessage = '';
    let isLoading = false;

    $: passwordsMatch = password === confirmPassword;
    $: formIsValid = name && email && password && confirmPassword && passwordsMatch && agreeToTerms;

    async function handleRegister() {
        errorMessage = '';

        if (!formIsValid) {
            if (!agreeToTerms) {
                errorMessage = 'You must agree to the Terms and Privacy Policy';
            } else if (!passwordsMatch) {
                errorMessage = 'Passwords do not match';
            } else {
                errorMessage = 'All fields are required';
            }
            return;
        }

        try {
            isLoading = true;

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // After successful registration, log in the user...
            const loginResponse = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                throw new Error(loginData.error || 'Login failed after registration');
            }

            $currentUser = loginData.data.user as SafeUser;


            await goto('/dashboard');
        } catch (error: unknown) {
            if (error instanceof Error) {
                errorMessage = error.message;
            } else {
                errorMessage = 'An unexpected error occurred';
            }
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="register-page">
    <div class="form-container">
        <h1>Register</h1>

        {#if errorMessage}
            <div class="error-message">
                {errorMessage}
            </div>
        {/if}

        <form on:submit|preventDefault={handleRegister}>
            <div class="form-field">
                <label for="name">Full Name</label>
                <input
                        type="text"
                        id="name"
                        bind:value={name}
                        required
                        placeholder="Enter your full name"
                />
            </div>

            <div class="form-field">
                <label for="email">Email</label>
                <input
                        type="email"
                        id="email"
                        bind:value={email}
                        required
                        placeholder="Enter your email"
                />
            </div>

            <div class="form-field">
                <label for="password">Password</label>
                <input
                        type="password"
                        id="password"
                        bind:value={password}
                        required
                        placeholder="Create a password"
                />
            </div>

            <div class="form-field">
                <label for="confirm-password">Confirm Password</label>
                <input
                        type="password"
                        id="confirm-password"
                        bind:value={confirmPassword}
                        required
                        placeholder="Confirm your password"
                />
                {#if confirmPassword && !passwordsMatch}
                    <span class="field-error">Passwords don't match</span>
                {/if}
            </div>

            <div class="terms-checkbox">
                <input
                        type="checkbox"
                        id="terms"
                        bind:checked={agreeToTerms}
                />
                <label for="terms">
                    By creating an account you agree to our <a href="/terms">Terms</a> & <a href="/privacy">Privacy</a>.
                </label>
            </div>

            <button type="submit" disabled={isLoading || !formIsValid}>
                {isLoading ? 'Processing...' : 'Register'}
            </button>
        </form>

        <div class="login-link">
            Already have an account? <a href="/login">Log in</a>
        </div>
    </div>
</div>

<style>
    .register-page {
        display: flex;
        justify-content: center;
        padding: 20px;
    }

    .form-container {
        width: 100%;
        max-width: 450px;
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

    .form-field {
        margin-bottom: 16px;
    }

    label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
    }

    input {
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

    .field-error {
        color: #e53e3e;
        font-size: 14px;
        margin-top: 4px;
        display: block;
    }

    .error-message {
        background-color: #fee2e2;
        color: #b91c1c;
        padding: 12px;
        border-radius: 4px;
        margin-bottom: 16px;
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
        margin-top: 16px;
    }

    button:disabled {
        background-color: #a0aec0;
        cursor: not-allowed;
    }

    .login-link {
        margin-top: 16px;
        text-align: center;
        font-size: 14px;
    }

    .login-link a {
        color: #4f46e5;
        text-decoration: none;
    }

    .terms-checkbox {
        display: flex;
        align-items: flex-start;
        margin-top: 8px;
    }

    .terms-checkbox input {
        width: auto;
        margin-right: 10px;
        margin-top: 3px;
    }

    .terms-checkbox label {
        font-size: 14px;
        font-weight: normal;
        line-height: 1.4;
    }

    .terms-checkbox a {
        color: #4f46e5;
        text-decoration: none;
    }

    .terms-checkbox a:hover {
        text-decoration: underline;
    }
</style>