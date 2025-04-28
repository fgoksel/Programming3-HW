import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';
import type { User, ApiResponse } from '$lib/types';

const usersPath = path.resolve('static/data/users.json');
const logPath = path.resolve('static/data/log.json');

const SHOP_ITEMS = {
	food: { price: 5, description: "Nutritious pet food that reduces hunger by 20" },
	toy: { price: 10, description: "Interactive toy that increases happiness by 30" },
	treat: { price: 3, description: "Special treat that reduces hunger by 10 and increases happiness by 10" }
} as const;

type ShopItem = keyof typeof SHOP_ITEMS;

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { userId, item } = await request.json();

		if (!userId || !item || !(item in SHOP_ITEMS)) {
			return new Response(JSON.stringify({
				success: false,
				error: 'Invalid request data'
			}), { status: 400 });
		}

		const users: User[] = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
		const user = users.find(u => u.id === userId);

		if (!user) {
			return new Response(JSON.stringify({
				success: false,
				error: 'User not found'
			}), { status: 404 });
		}

		const { price } = SHOP_ITEMS[item as ShopItem];

		if (user.budget < price) {
			return new Response(JSON.stringify({
				success: false,
				error: `Not enough budget. You need $${price} to buy ${item}.`
			}), { status: 400 });
		}

		user.budget -= price;
		if (!user.inventory) {
			user.inventory = { food: 0, toy: 0, treat: 0 };
		}
		const inventoryKey = item as keyof typeof user.inventory;
		user.inventory[inventoryKey] = (user.inventory[inventoryKey] || 0) + 1;

		let logs = [];
		try {
			logs = JSON.parse(await fs.readFile(logPath, 'utf-8'));
		} catch (error) {
			logs = [];
		}

		logs.push({
			timestamp: new Date().toISOString(),
			userId,
			action: 'purchase',
			details: { item, price }
		});

		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
		await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

		return new Response(JSON.stringify({
			success: true,
			data: {
				user,
				message: `Successfully purchased ${item}!`
			}
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		console.error('Shop purchase error:', error);
		return new Response(JSON.stringify({
			success: false,
			error: 'Failed to process purchase'
		}), { status: 500 });
	}
};