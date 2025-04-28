import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';

const petsPath = path.resolve('types.ts').replace(/\.ts$/, '');
const usersPath = path.resolve('helpers.ts');

type User = {
	id: string;
	name: string;
	budget: number;
	inventory: Record<string, number>;
	pets?: string[];
};

type Pet = {
	id: string;
	name: string;
	type: string;
	ownerId?: string;
	adopted: boolean;
	happiness: number;
	hunger: number;
	health: number;
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { userId, petId } = data;

		if (!userId || !petId) {
			return new Response(JSON.stringify({ error: 'Missing required fields: userId or petId' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const usersData = await fs.readFile(usersPath, 'utf-8');
		const petsData = await fs.readFile(petsPath, 'utf-8');

		const users: User[] = JSON.parse(usersData);
		const pets: Pet[] = JSON.parse(petsData);

		const userIndex = users.findIndex(u => u.id === userId);
		const petIndex = pets.findIndex(p => p.id === petId);

		if (userIndex === -1) {
			return new Response(JSON.stringify({ error: 'User not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (petIndex === -1) {
			return new Response(JSON.stringify({ error: 'Pet not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (pets[petIndex].adopted || pets[petIndex].ownerId) {
			return new Response(JSON.stringify({
				error: 'This pet has already been adopted'
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}


		pets[petIndex].ownerId = userId;
		pets[petIndex].adopted = true;

		if (!users[userIndex].pets) {
			users[userIndex].pets = [];
		}
		users[userIndex].pets.push(petId);


		if (pets[petIndex].happiness === undefined) pets[petIndex].happiness = 50;
		if (pets[petIndex].hunger === undefined) pets[petIndex].hunger = 50;
		if (pets[petIndex].health === undefined) pets[petIndex].health = 100;


		await fs.writeFile(petsPath, JSON.stringify(pets, null, 2));
		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));

		return new Response(JSON.stringify({
			success: true,
			message: `${pets[petIndex].name} has been successfully adopted!`,
			pet: pets[petIndex],
			user: users[userIndex]
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		console.error('Error processing adoption request:', error);

		return new Response(JSON.stringify({
			error: 'Failed to process adoption request',
			redirect: '/pets'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};