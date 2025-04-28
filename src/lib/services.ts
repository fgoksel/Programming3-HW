import { Pet, User } from './models';
import fs from 'fs/promises';

export class PetService {
    static async feedPet(user: User, pet: Pet, useInventory: boolean = false): Promise<string> {
        if (useInventory) {
            user.useFromInventory('food');
        } else {
            user.spendMoney(5);
        }
        pet.feed();
        return `${pet.name} has been fed! Hunger decreased by 20.`;
    }

    static async playWithPet(user: User, pet: Pet, useInventory: boolean = false): Promise<string> {
        if (useInventory) {
            user.useFromInventory('toy');
        } else {
            user.spendMoney(10);
        }
        pet.play();
        return `${pet.name} had fun playing! Happiness increased by 30.`;
    }

    static async returnPet(user: User, pet: Pet): Promise<string> {
        user.spendMoney(20);
        pet.return();
        user.returnPet(pet.id);
        return `${pet.name} has been returned to the shelter.`;
    }
}

export class LogService {
    static async logAction(user: User, pet: Pet, action: string, details: any = {}): Promise<void> {
        const logEntry = {
            timestamp: new Date().toISOString(),
            userId: user.id,
            petId: pet.id,
            action,
            details: {
                userName: user.name,
                petName: pet.name,
                ...details
            }
        };


        const logs = await this.readLogs();
        logs.push(logEntry);


        await this.writeLogs(logs);
    }

    private static async readLogs(): Promise<any[]> {
        try {
            const logsRaw = await fs.readFile('static/data/log.json', 'utf-8');
            return JSON.parse(logsRaw);
        } catch (error) {
            return [];
        }
    }

    private static async writeLogs(logs: any[]): Promise<void> {
        await fs.writeFile('static/data/log.json', JSON.stringify(logs, null, 2));
    }
}

export class ShopService {
    static readonly ITEMS = {
        food: { price: 5, description: "Nutritious pet food that reduces hunger by 20" },
        toy: { price: 10, description: "Interactive toy that increases happiness by 30" },
        treat: { price: 3, description: "Special treat that reduces hunger by 10 and increases happiness by 10" }
    } as const;

    static async purchaseItem(user: User, item: keyof typeof ShopService.ITEMS): Promise<string> {
        const itemInfo = ShopService.ITEMS[item];
        
        if (!user.canAfford(itemInfo.price)) {
            throw new Error(`Not enough budget. You need $${itemInfo.price} to buy ${item}.`);
        }

        user.spendMoney(itemInfo.price);
        user.addToInventory(item);

        return `Successfully purchased ${item}!`;
    }
} 