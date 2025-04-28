import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import { readFile, writeFile } from 'node:fs/promises';
import type { User } from '$lib/types';

const USERS_FILE_PATH = path.resolve('static/data/users.json');

const ITEMS = {
    food: { price: 5, description: 'Pet Food' },
    toy: { price: 10, description: 'Toy' },
    treat: { price: 15, description: 'Special Treat' }
} as const;

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { userId, itemId } = await request.json();

        if (!userId || !itemId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'User ID and item ID are required'
                }),
                { status: 400 }
            );
        }

        if (!(itemId in ITEMS)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid item ID'
                }),
                { status: 400 }
            );
        }

        const rawData = await readFile(USERS_FILE_PATH, 'utf-8');
        const users: User[] = JSON.parse(rawData);
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'User not found'
                }),
                { status: 404 }
            );
        }

        const user = users[userIndex];
        const item = ITEMS[itemId as keyof typeof ITEMS];

        if (user.budget < item.price) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Not enough budget'
                }),
                { status: 400 }
            );
        }

        user.budget -= item.price;
        if (!user.inventory) {
            user.inventory = { food: 0, toy: 0, treat: 0 };
        }
        user.inventory[itemId as keyof typeof user.inventory]++;

        users[userIndex] = user;
        await writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2));

        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully purchased ${item.description}!`,
                user: {
                    id: user.id,
                    budget: user.budget,
                    inventory: user.inventory
                }
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

    } catch (error) {
        console.error('Shop purchase error:', error);
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Failed to process purchase'
            }),
            { status: 500 }
        );
    }
}; 