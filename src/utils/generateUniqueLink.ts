import { v4 as uuidv4 } from 'uuid';

export const generateUniqueLink = (): string => {
    const shortUuid = uuidv4().split('-').join('').substring(0, 8);
    return `${process.env.FIXTURE_LINK}-${shortUuid}`;
};
