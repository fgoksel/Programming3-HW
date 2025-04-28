import type { RequestHandler } from '@sveltejs/kit';
import path from 'path';
import fs from 'fs/promises';
import type { User, Pet, ApiResponse } from '$lib/types';

const usersPath = path.resolve('static/data/users.json');
const petsPath = path.resolve('static/data/pets.json');
const logPath = path.resolve('static/data/log.json');

type LogEntry = {
	timestamp: string;
	userId: number;
	petId: number;
	action: string;
	details: Record<string, any>;
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { userId, petId, action, item } = data;

		const users: User[] = JSON.parse(await fs.readFile(usersPath, 'utf-8'));
		const pets: Pet[] = JSON.parse(await fs.readFile(petsPath, 'utf-8'));
		let logs: LogEntry[] = [];

		try {
			logs = JSON.parse(await fs.readFile(logPath, 'utf-8'));
		} catch (error) {

			logs = [];
		}

		const user = users.find(u => u.id === userId);
		const pet = pets.find(p => p.id === petId);

		if (!user) {
			return new Response(JSON.stringify({
				success: false,
				error: 'User not found'
			}), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (!pet) {
			return new Response(JSON.stringify({
				success: false,
				error: 'Pet not found'
			}), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const isPetAdoptedByUser = user.adoptedPets.some(p => p.id === petId);
		if (!isPetAdoptedByUser) {
			return new Response(JSON.stringify({
				success: false,
				error: 'This pet is not adopted by you'
			}), {
				status: 403,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		let result;
		let logEntry: LogEntry = {
			timestamp: new Date().toISOString(),
			userId,
			petId,
			action,
			details: {}
		};

		switch (action) {
			case 'feed':
				result = handleFeedAction(user, pet);
				logEntry.details = { result };
				break;

			case 'play':
				result = handlePlayAction(user, pet);
				logEntry.details = { result };
				break;

			case 'return':
				result = handleReturnAction(user, pet);
				logEntry.details = { result };
				break;

			default:
				return new Response(JSON.stringify({
					success: false,
					error: 'Unknown action'
				}), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
		}

		if (result.error) {
			return new Response(JSON.stringify({
				success: false,
				error: result.error
			}), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
		await fs.writeFile(petsPath, JSON.stringify(pets, null, 2));
		logs.push(logEntry);
		await fs.writeFile(logPath, JSON.stringify(logs, null, 2));

		return new Response(JSON.stringify({
			success: true,
			data: {
				user,
				pet,
				message: result.message
			}
		}), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});

	} catch (error) {
		console.error('Error processing pet action:', error);
		return new Response(JSON.stringify({
			success: false,
			error: 'Failed to process action'
		}), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

function handleFeedAction(user: User, pet: Pet): { message?: string; error?: string } {
	if (user.budget < 5) {
		return { error: 'Not enough budget. You need $5 to feed your pet.' };
	}

	user.budget -= 5;
	pet.hunger = Math.max(0, pet.hunger - 20);

	return { message: `${pet.name} has been fed! Hunger decreased by 20.` };
}

function handlePlayAction(user: User, pet: Pet): { message?: string; error?: string } {
	if (user.budget < 10) {
		return { error: 'Not enough budget. You need $10 to play with your pet.' };
	}

	user.budget -= 10;
	pet.happiness = Math.min(100, pet.happiness + 30);

	return { message: `${pet.name} had fun playing! Happiness increased by 30.` };
}

function handleReturnAction(user: User, pet: Pet): { message?: string; error?: string } {
	if (user.budget < 20) {
		return { error: 'Not enough budget. You need $20 to return your pet.' };
	}

	user.budget -= 20;
	pet.adopted = false;
	user.adoptedPets = user.adoptedPets.filter(p => p.id !== pet.id);

	return { message: `${pet.name} has been returned to the shelter.` };
}