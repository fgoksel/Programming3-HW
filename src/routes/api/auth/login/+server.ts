import type { RequestHandler } from '@sveltejs/kit';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs/promises';
import { User } from '$lib/models';
import type { ApiResponse, SafeUser } from '$lib/types';

const usersPath = path.resolve('static/data/users.json');

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password, rememberMe } = await request.json();
		if (!email || !password) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Email and password are required'
				}),
				{ status: 400 }
			);
		}

		const usersData = await fs.readFile(usersPath, 'utf-8');
		const users = JSON.parse(usersData).map((user: any) => User.fromJSON(user));
		const user = users.find((u: User) => u.email === email);

		if (!user) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid credentials'
				}),
				{ status: 401 }
			);
		}

		const passwordMatch = await bcrypt.compare(password, user.passwordHash);
		if (!passwordMatch) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid credentials'
				}),
				{ status: 401 }
			);
		}

		const safeUser: SafeUser = {
			id: user.id,
			name: user.name,
			email: user.email,
			budget: user.budget,
			adoptedPets: user.adoptedPets,
			inventory: user.inventory,
			role: user.role
		};

		const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

		cookies.set('session', JSON.stringify(safeUser), {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			maxAge: cookieMaxAge
		});

		const response: ApiResponse<{ message: string; user: SafeUser }> = {
			success: true,
			data: {
				message: 'Login successful',
				user: safeUser
			}
		};

		return new Response(
			JSON.stringify(response),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);

	} catch (error) {
		console.error('Login error:', error);
		return new Response(
			JSON.stringify({
				success: false,
				error: 'Internal server error'
			}),
			{ status: 500 }
		);
	}
};

// TODO: Handle GET and POST requests for pets