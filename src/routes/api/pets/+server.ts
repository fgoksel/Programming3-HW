import { json } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Pet } from '$lib/models';
import type { ApiResponse, Pet as PetType } from '$lib/types';

const PETS_FILE = join(process.cwd(), 'static', 'data', 'pets.json');
const DEFAULT_ERROR = { success: false, error: 'An error occurred while processing your request' };

export async function GET({ url }) {
	try {
		const type = url.searchParams.get('type');
		const petsData = readFileSync(PETS_FILE, 'utf-8');
		let pets = JSON.parse(petsData).map((pet: any) => Pet.fromJSON(pet));

		if (type) {
			pets = pets.filter((pet: Pet) => pet.type === type);
		}

		const response: ApiResponse<Pet[]> = {
			success: true,
			data: pets.map((pet: Pet) => pet.toJSON())
		};

		return json(response, {
			headers: {
				'Cache-Control': 'no-cache'
			}
		});
	} catch (error) {
		console.error('Get pets error:', error);
		return json(DEFAULT_ERROR, { status: 500 });
	}
}

export async function POST({ request }) {
	try {
		const data = readFileSync(PETS_FILE, 'utf-8');
		const pets = JSON.parse(data).map((pet: any) => Pet.fromJSON(pet));
		const newPetData = await request.json();

		if (!newPetData.name || !newPetData.type || !newPetData.breed) {
			return json({ success: false, error: 'Missing required fields' }, { status: 400 });
		}


		const newId = Math.max(0, ...pets.map((pet: Pet) => pet.id)) + 1;


		const newPet = new Pet({
			id: newId,
			name: newPetData.name,
			type: newPetData.type,
			breed: newPetData.breed,
			adopted: false,
			hunger: 50,
			happiness: 50,
			age: newPetData.age || 0,
			gender: newPetData.gender || 'Unknown',
			description: newPetData.description || '',
			image: newPetData.image || '',
			adoptedBy: undefined
		});

		pets.push(newPet);


		writeFileSync(PETS_FILE, JSON.stringify(pets.map((pet: Pet) => pet.toJSON()), null, 2));

		const response: ApiResponse<Omit<PetType, 'adopt' | 'toJSON' | 'feed' | 'play' | 'return'>> = {
			success: true,
			data: newPet.toJSON()
		};

		return json(response, { status: 201 });
	} catch (error) {
		console.error('Error in POST /api/pets:', error);
		return json(DEFAULT_ERROR, { status: 500 });
	}
}
