import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Pet, User as UserClass } from '$lib/models';
import { LogService } from '$lib/services';
import type { User } from '$lib/types';

const PETS_FILE_PATH = join(process.cwd(), 'static/data/pets.json');
const USERS_FILE_PATH = join(process.cwd(), 'static/data/users.json');

export async function POST({ request, params }) {
    try {
        const { action, userId } = await request.json();
        const petId = parseInt(params.id);

        // Read current data
        const petsData = readFileSync(PETS_FILE_PATH, 'utf-8');
        const usersData = readFileSync(USERS_FILE_PATH, 'utf-8');
        const allPets = JSON.parse(petsData);
        const users = JSON.parse(usersData);

        // Find the pet and user
        const petIndex = allPets.findIndex((p: any) => p.id === petId);
        const userIndex = users.findIndex((u: User) => u.id === userId);

        if (petIndex === -1 || userIndex === -1) {
            return json({ error: 'Pet or user not found' }, { status: 404 });
        }

        const pet = Pet.fromJSON(allPets[petIndex]);
        const user = new UserClass(
            users[userIndex].id,
            users[userIndex].name,
            users[userIndex].email,
            users[userIndex].passwordHash,
            users[userIndex].budget,
            users[userIndex].adoptedPets,
            users[userIndex].inventory,
            users[userIndex].role
        );


        if (!user.adoptedPets.some(p => p.id === petId)) {
            return json({ error: 'Pet is not adopted by this user' }, { status: 400 });
        }


        let success = false;
        let message = '';

        switch (action) {
            case 'feed':
                try {
                    user.useFromInventory('food');
                    pet.feed();
                    success = true;
                    message = 'Pet fed successfully';
                } catch (error) {
                    return json({ error: 'No food in inventory' }, { status: 400 });
                }
                break;

            case 'play':
                try {
                    user.useFromInventory('toy');
                    pet.play();
                    success = true;
                    message = 'Played with pet successfully';
                } catch (error) {
                    return json({ error: 'No toys in inventory' }, { status: 400 });
                }
                break;

            case 'return':
                try {
                    user.spendMoney(20);
                    pet.return();
                    user.returnPet(pet);
                    success = true;
                    message = 'Pet returned successfully';
                } catch (error) {
                    return json({ error: 'Not enough money to return pet' }, { status: 400 });
                }
                break;

            default:
                return json({ error: 'Invalid action' }, { status: 400 });
        }


        allPets[petIndex] = pet.toJSON();
        users[userIndex] = user.toJSON();
        writeFileSync(PETS_FILE_PATH, JSON.stringify(allPets, null, 2));
        writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));


        await LogService.logAction(userId, petId, action, { success, message });

        return json({ success, message, user: users[userIndex] });
    } catch (error) {
        console.error('Action error:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
} 