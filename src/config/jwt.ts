import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from project root
const result = dotenv.config({
path: path.resolve(process.cwd(), '.env'),
});

console.log('dotenv loaded:', result.error ? result.error : 'success');
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET);

// Fail fast if secrets missing
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
throw new Error('JWT_SECRET is missing or empty in .env file!');
}

if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.trim() === '') {
throw new Error('JWT_REFRESH_SECRET is missing or empty in .env file!');
}

export const jwtConfig = {
access: {
secret: process.env.JWT_SECRET,
expiresIn: '30m',
},
refresh: {
secret: process.env.JWT_REFRESH_SECRET,
expiresIn: '7d',
},
};
