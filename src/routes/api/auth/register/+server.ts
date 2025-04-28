import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';
import { User } from '$lib/models';
import type { ApiResponse } from '$lib/types';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password, name } = await request.json();

		if (!email || !password || !name) {
			const response: ApiResponse<null> = {
				success: false,
				error: 'All fields are required'
			};
			return new Response(JSON.stringify(response), { status: 400 });
		}

		const usersRaw = await fs.readFile(usersPath, 'utf-8');
		const users = JSON.parse(usersRaw).map((user: any) => User.fromJSON(user));

		if (users.find((u: User) => u.email === email)) {
			const response: ApiResponse<null> = {
				success: false,
				error: 'Email already in use'
			};
			return new Response(JSON.stringify(response), { status: 409 });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const newUser = new User(
			Date.now(),
			name,
			email,
			passwordHash,
			150,
			[],
			{ food: 0, toy: 0, treat: 0 },
			'user'
		);

		users.push(newUser);

		await fs.writeFile(usersPath, JSON.stringify(users.map((u: User) => u.toJSON()), null, 2));

		const response: ApiResponse<{ message: string }> = {
			success: true,
			data: {
				message: 'User registered successfully'
			}
		};

		return new Response(JSON.stringify(response), { status: 201 });

	} catch (err) {
		console.error('Registration error:', err);
		const response: ApiResponse<null> = {
			success: false,
			error: 'Internal server error'
		};
		return new Response(JSON.stringify(response), { status: 500 });
	}
};

