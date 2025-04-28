import type { Pet, User } from './types';

export function canAfford(user: User, cost: number): boolean {
    if (!user || typeof user.budget !== 'number') {
        return false;
    }
    return user.budget >= cost;
}

export function feedPet(pet: Pet): Pet {
    if (!pet) {
        throw new Error('Pet is required');
    }
    const updatedHunger = Math.max(0, pet.hunger - 20);

    return {
        ...pet,
        hunger: updatedHunger
    };
}

export function toyPet(pet: Pet): Pet {
    if (!pet) {
        throw new Error('Pet is required');
    }

    const updatedHappiness = Math.min(100, pet.happiness + 30);

    return {
        ...pet,
        happiness: updatedHappiness
    };
}

export function returnPet(pet: Pet): Pet {
    if (!pet) {
        throw new Error('Pet is required');
    }

    return pet;
}