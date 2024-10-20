import mongoose from 'mongoose';

function database() {
    if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
    }

    const mongodbUrl = `${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`;

    if (!process.env.MONGODB_URL || !process.env.DATABASE_NAME) {
        throw new Error("Missing MONGODB_URL or DATABASE_NAME environment variables");
    }

    mongoose.connect(mongodbUrl)
        .catch(error => {
            console.error("Initial MongoDB connection error:", error);
            process.exit(1); 
        });

    mongoose.Promise = global.Promise;

    const db = mongoose.connection;

    db.on("connected", () => {
        console.log("DATABASE CONNECTED:");
    });

    db.on("error", (error: Error) => {
        console.error("MongoDB connection error:", error);
        process.exit(1); 
    });

    process.on("SIGINT", () => {
        db.close(() => {
            console.log("DATABASE DISCONNECTED");
            process.exit(0);
        });
    });

    (global as any).db = db;
}

export default database;
