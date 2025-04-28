<script lang="ts">
    import { onMount } from 'svelte';

    interface LogEntry {
        id: string;
        action: string;
        user: string;
        timestamp: string;
        details?: string;
    }

    let logs: LogEntry[] = [];
    let error = '';
    let isLoading = true;

    onMount(async () => {
        try {
            const response = await fetch('/api/logs');

            if (!response.ok) {
                throw new Error(`Failed to fetch logs: ${response.statusText}`);
            }

            logs = await response.json();
            logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        } catch (err) {
            if (err instanceof Error) {
                error = err.message;
            } else {
                error = 'An unknown error occurred while fetching logs';
            }
        } finally {
            isLoading = false;
        }
    });

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    }
</script>

<div class="logs-container">
    <h1>Action Log</h1>

    {#if isLoading}
        <div class="loading">
            <p>Loading logs...</p>
        </div>
    {:else if error}
        <div class="error">
            <p>{error}</p>
            <button on:click={() => window.location.reload()}>Try Again</button>
        </div>
    {:else if logs.length === 0}
        <div class="empty-state">
            <p>No actions have been logged yet.</p>
        </div>
    {:else}
        <div class="logs-list">
            {#each logs as log (log.id)}
                <div class="log-entry">
                    <div class="log-header">
                        <span class="log-action">{log.action}</span>
                        <span class="log-time">{formatDate(log.timestamp)}</span>
                    </div>
                    <div class="log-user">By: {log.user}</div>
                    {#if log.details}
                        <div class="log-details">{log.details}</div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .logs-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    h1 {
        margin-bottom: 24px;
        color: #333;
    }

    .loading, .error, .empty-state {
        padding: 20px;
        border-radius: 4px;
        background-color: #f9f9f9;
        text-align: center;
    }

    .error {
        background-color: #fff5f5;
        color: #c53030;
    }

    .error button {
        margin-top: 10px;
        padding: 8px 16px;
        background-color: #c53030;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .logs-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .log-entry {
        padding: 16px;
        border-radius: 4px;
        background-color: white;
        border-left: 4px solid #4f46e5;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .log-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-weight: 500;
    }

    .log-action {
        color: #4f46e5;
        font-weight: 600;
    }

    .log-time {
        color: #666;
        font-size: 14px;
    }

    .log-user {
        font-size: 14px;
        color: #4b5563;
        margin-bottom: 6px;
    }

    .log-details {
        font-size: 14px;
        color: #4b5563;
        background-color: #f9fafb;
        padding: 8px;
        border-radius: 4px;
        margin-top: 8px;
        white-space: pre-wrap;
    }
</style>