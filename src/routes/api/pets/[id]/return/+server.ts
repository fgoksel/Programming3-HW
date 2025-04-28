import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Pet, User } from '$lib/models';
import { LogService } from '$lib/services';
import type { ApiResponse } from '$lib/types';

const PETS_FILE = join(process.cwd(), 'static', 'data', 'pets.json');
const USERS_FILE = join(process.cwd(), 'static', 'data', 'users.json');
const DEFAULT_ERROR = { success: false, error: 'An error occurred while processing your request' };

export async function POST({ request, params }) {
    try {
        const { userId } = await request.json();
        const petId = params.id ? parseInt(params.id) : null;

        if (!userId || !petId) {
            return json({
                success: false,
                error: 'Missing required fields: userId or petId'
            }, { status: 400 });
        }

        const petsData = readFileSync(PETS_FILE, 'utf-8');
        const usersData = readFileSync(USERS_FILE, 'utf-8');
        
        const pets = JSON.parse(petsData).map((pet: any) => Pet.fromJSON(pet));
        const users = JSON.parse(usersData).map((user: any) => User.fromJSON(user));

        const petIndex = pets.findIndex((p: Pet) => p.id === petId);
        const userIndex = users.findIndex((u: User) => u.id === userId);

        if (petIndex === -1) {
            return json({
                success: false,
                error: 'Pet not found'
            }, { status: 404 });
        }

        if (userIndex === -1) {
            return json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        const pet = pets[petIndex];
        const user = users[userIndex];

        if (!pet.adopted || pet.adoptedBy !== userId.toString()) {
            return json({
                success: false,
                error: 'This pet is not adopted by you'
            }, { status: 400 });
        }


        pet.return();
        user.returnPet(pet.id);


        await LogService.logAction(user, pet, 'return', {
            petName: pet.name,
            userName: user.name,
            inventory: user.inventory
        });


        writeFileSync(PETS_FILE, JSON.stringify(pets.map((p: Pet) => p.toJSON()), null, 2));
        writeFileSync(USERS_FILE, JSON.stringify(users.map((u: User) => u.toJSON()), null, 2));

        const response: ApiResponse<{ message: string; user: User }> = {
            success: true,
            data: {
                message: `Successfully returned ${pet.name} to the shelter`,
                user: user.toJSON()
            }
        };

        return json(response);
    } catch (error) {
        console.error('Return pet error:', error);
        return json(DEFAULT_ERROR, { status: 500 });
    }
} 