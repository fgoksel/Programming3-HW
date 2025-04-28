export type PetType = 'puppy' | 'kitten' | 'other';

export interface Pet {
	id: number;
	name: string;
	type: PetType;
	adopted: boolean;
	hunger: number;
	happiness: number;
	breed: string;
	age: number;
	gender: string;
	description: string;
	image: string;
	adoptedBy?: string;
	adopt: (userId: string) => void;
	toJSON: () => Omit<Pet, 'adopt' | 'toJSON' | 'feed' | 'play' | 'return'>;
}

export interface User{
	id: number;
	name?: string;
	email?: string;
	budget: number;
	adoptedPets: Array<{ id: number }>;
	inventory?: {
		food: number;
		toy: number;
		treat: number;
	};
	role?: 'user' | 'admin';
}


export type SafeUser = Omit<User, 'passwordHash'>;

export type ApiResponse<T> = {
	data?: T;
	error?: string;
	success: boolean;
};



