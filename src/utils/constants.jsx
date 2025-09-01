import dotenv from 'dotenv';

dotenv.config();

export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000"; 