import type { Pet as PetType, PetType as PetCategory } from './types';

export class Pet implements PetType {
    id: number;
    name: string;
    type: PetCategory;
    adopted: boolean;
    hunger: number;
    happiness: number;
    breed: string;
    age: number;
    gender: string;
    description: string;
    image: string;
    adoptedBy?: string;

    constructor(data: Omit<PetType, 'adopt' | 'toJSON' | 'feed' | 'play' | 'return'>) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.breed = data.breed;
        this.adopted = data.adopted ?? false;
        this.hunger = data.hunger ?? 50;
        this.happiness = data.happiness ?? 50;
        this.age = data.age ?? 0;
        this.gender = data.gender ?? 'Unknown';
        this.description = data.description ?? '';
        this.image = data.image ?? '';
        this.adoptedBy = data.adoptedBy;
    }

    feed(): void {
        if (this.hunger > 0) {
            this.hunger = Math.max(0, this.hunger - 20);
            this.happiness = Math.min(100, this.happiness + 5);
        }
    }

    play(): void {
        if (this.happiness < 100) {
            this.happiness = Math.min(100, this.happiness + 20);
            this.hunger = Math.min(100, this.hunger + 10);
        }
    }

    adopt(userId: string): void {
        this.adopted = true;
        this.adoptedBy = userId;
    }

    return(): void {
        this.adopted = false;
        this.adoptedBy = undefined;
    }

    toJSON(): Omit<PetType, 'adopt' | 'toJSON' | 'feed' | 'play' | 'return'> {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            breed: this.breed,
            adopted: this.adopted,
            hunger: this.hunger,
            happiness: this.happiness,
            age: this.age,
            gender: this.gender,
            description: this.description,
            image: this.image,
            adoptedBy: this.adoptedBy
        };
    }

    static fromJSON(data: Omit<PetType, 'adopt' | 'toJSON' | 'feed' | 'play' | 'return'>): Pet {
        return new Pet(data);
    }
}

export class User {
    constructor(
        public id: number,
        public name: string,
        public email: string,
        public passwordHash: string,
        public budget: number = 100,
        public adoptedPets: Array<{ id: number }> = [],
        public inventory: {
            food: number;
            toy: number;
            treat: number;
        } = {
            food: 0,
            toy: 0,
            treat: 0
        },
        public role: 'user' | 'admin' = 'user'
    ) {}

    canAfford(cost: number): boolean {
        return this.budget >= cost;
    }

    spendMoney(amount: number): void {
        if (this.canAfford(amount)) {
            this.budget -= amount;
        } else {
            throw new Error('Insufficient funds');
        }
    }

    addToInventory(item: 'food' | 'toy' | 'treat'): void {
        this.inventory[item]++;
    }

    useFromInventory(item: 'food' | 'toy' | 'treat'): void {
        if (this.inventory[item] > 0) {
            this.inventory[item]--;
        } else {
            throw new Error(`No ${item} in inventory`);
        }
    }

    adoptPet(petId: number): void {
        
        if (this.adoptedPets.some(p => p.id === petId)) {
            console.warn(`Pet ${petId} is already adopted by user ${this.id}`);
            return;
        }

        
        this.adoptedPets.push({ id: petId });

        
        this.inventory.food += 5;
        this.inventory.toy += 3;
        this.inventory.treat += 2;

        console.log(`User ${this.id} adopted pet ${petId}. New inventory:`, this.inventory);
    }

    returnPet(pet: Pet): void {
        if (!this.adoptedPets.some(p => p.id === pet.id)) {
            console.warn(`Warning: Attempted to return pet ${pet.id} that is not adopted by user ${this.id}`);
            return;
        }

        this.adoptedPets = this.adoptedPets.filter(p => p.id !== pet.id);

        this.inventory.food = Math.max(0, this.inventory.food - 2);
        this.inventory.toy = Math.max(0, this.inventory.toy - 1);
        this.inventory.treat = Math.max(0, this.inventory.treat - 1);
        
        console.log(`User ${this.id} returned pet ${pet.id}. New inventory:`, this.inventory);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            passwordHash: this.passwordHash,
            budget: this.budget,
            adoptedPets: this.adoptedPets,
            inventory: this.inventory,
            role: this.role
        };
    }

    static fromJSON(data: any): User {
        return new User(
            data.id,
            data.name,
            data.email,
            data.passwordHash,
            data.budget,
            data.adoptedPets || [],
            data.inventory || { food: 0, toy: 0, treat: 0 },
            data.role || 'user'
        );
    }
} 