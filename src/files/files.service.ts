import { Injectable } from "@nestjs/common";
import * as fs from 'fs/promises';
import * as fsSync from 'fs'; 
import * as path from 'path';

@Injectable()
export class FilesService {
    private readonly filePath = 'orders.txt';
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    async writeToFile(data: string): Promise<void> {
        await fs.writeFile(this.filePath, data, { encoding: 'utf-8' });
    }

    async readFromFile(): Promise<string> {
        const content = await fs.readFile(this.filePath, { encoding: 'utf-8' });
        return content;
    }

    getFilePath(filename: string): string | null {
        const filePath = path.join(this.uploadDir, filename);

        if (fsSync.existsSync(filePath)) {
            return filePath;
        }

        return null;
    }
}
