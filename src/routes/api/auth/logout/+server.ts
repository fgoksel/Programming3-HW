import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
    try {
        cookies.delete('session', { path: '/' });

        return new Response(
            JSON.stringify({
                success: true,
                data: { message: 'Logged out successfully' }
            }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.error('Logout error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Internal server error'
            }),
            { status: 500 }
        );
    }
};