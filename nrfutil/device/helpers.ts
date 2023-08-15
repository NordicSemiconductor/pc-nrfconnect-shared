import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

// seems I do not export something correctly
// eslint-disable-next-line import/named
import { FileExtensions } from './common';

export const saveTempFile = (
    firmware: Buffer,
    type: FileExtensions
): string => {
    if (!firmware || !type) {
        // log
        return '';
    }

    let tempFilePath = '';

    do {
        tempFilePath = path.join(os.tmpdir(), `${uuid()}.${type}`);
    } while (fs.existsSync(tempFilePath));

    fs.writeFileSync(tempFilePath, firmware);

    return tempFilePath;
};
