import type { RequestHandler } from '@sveltejs/kit';
import type { SafeUser } from '$lib/types';

export const GET: RequestHandler = async ({ cookies }) => {
    try {
        const session = cookies.get('session');

        if (!session) {
            return new Response(
                JSON.stringify({
                    success: true,
                    data: { user: null }
                }),
                {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const user: SafeUser = JSON.parse(session);

        return new Response(
            JSON.stringify({
                success: true,
                data: { user }
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Error fetching current user:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error'
            }),
            { status: 500 }
        );
    }
};