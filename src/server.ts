import app from './app';
import dotenv from 'dotenv';
import database  from '../src/db/database'
import {connectRedis}  from '../src/config/redis.config'
dotenv.config();

database()
connectRedis()

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
