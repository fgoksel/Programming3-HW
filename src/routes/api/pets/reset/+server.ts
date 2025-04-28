import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Pet } from '$lib/models';

const PETS_FILE = join(process.cwd(), 'static', 'data', 'pets.json');

export async function POST() {
    try {
        const petsData = readFileSync(PETS_FILE, 'utf-8');
        const pets = JSON.parse(petsData).map((pet: any) => Pet.fromJSON(pet));


        pets.forEach((pet: Pet) => {
            pet.adopted = false;
            pet.adoptedBy = undefined;

        });

        writeFileSync(PETS_FILE, JSON.stringify(pets.map((p: Pet) => p.toJSON()), null, 2));

        return json({
            success: true,
            message: 'All pets have been reset to unadopted status'
        });
    } catch (error) {
        console.error('Reset pets error:', error);
        return json({
            success: false,
            error: 'Failed to reset pets'
        }, { status: 500 });
    }
} 