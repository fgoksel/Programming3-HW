import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { User, ApiResponse } from '$lib/types';
import { Pet as PetModel, User as UserModel } from '$lib/models';

const PETS_FILE = join(process.cwd(), 'static', 'data', 'pets.json');
const USERS_FILE = join(process.cwd(), 'static', 'data', 'users.json');

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
        
        const pets: PetModel[] = JSON.parse(petsData).map((pet: any) => PetModel.fromJSON(pet));
        const users: UserModel[] = JSON.parse(usersData).map((user: User) => UserModel.fromJSON(user));

        const petIndex = pets.findIndex(p => p.id === petId);
        const userIndex = users.findIndex(u => u.id === userId);

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

        if (pet.adopted) {
            return json({
                success: false,
                error: 'This pet has already been adopted'
            }, { status: 400 });
        }

        pet.adopt(userId.toString());
        user.adoptPet(pet.id);

        writeFileSync(PETS_FILE, JSON.stringify(pets.map(p => p.toJSON()), null, 2));
        writeFileSync(USERS_FILE, JSON.stringify(users.map(u => u.toJSON()), null, 2));

        const response: ApiResponse<{ pet: any; user: User }> = {
            success: true,
            data: {
                pet: pet.toJSON(),
                user: user.toJSON()
            }
        };

        return json(response);
    } catch (error) {
        console.error('Adoption error:', error);
        return json({
            success: false,
            error: 'Failed to process adoption'
        }, { status: 500 });
    }
} 