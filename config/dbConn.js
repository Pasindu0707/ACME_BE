import mongoose from 'mongoose';

// Cache the connection to reuse in serverless environments
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    try {
        if (!process.env.DATABASE_URI) {
            console.error('DATABASE_URI is not defined in environment variables');
            if (process.env.VERCEL) {
                // In Vercel, don't exit, just throw
                throw new Error('DATABASE_URI is not defined');
            }
            process.exit(1);
        }

        // If already connected, return the existing connection
        if (cached.conn) {
            return cached.conn;
        }

        // If connection is in progress, wait for it
        if (!cached.promise) {
            // Connection options for better error handling and reliability
            const options = {
                serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
                socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            };
            
            cached.promise = mongoose.connect(process.env.DATABASE_URI, options).then((mongoose) => {
                console.log('MongoDB connection initiated');
                return mongoose;
            });
        }

        cached.conn = await cached.promise;
        return cached.conn;
    } catch (err) {
        cached.promise = null; // Reset promise on error
        console.error('\n=== Database Connection Error ===');
        console.error('Error:', err.message);
        
        // Provide specific guidance based on error type
        if (err.code === 8000 || err.codeName === 'AtlasError' || err.message.includes('Authentication failed')) {
            console.error('\n⚠️  MongoDB Authentication Failed!');
            console.error('This usually means:');
            console.error('  1. Incorrect username or password in DATABASE_URI');
            console.error('  2. Database user was deleted or password changed');
            console.error('  3. IP address not whitelisted in MongoDB Atlas');
            console.error('  4. Connection string format is incorrect');
            console.error('\nTo fix this:');
            console.error('  1. Check your MongoDB Atlas dashboard');
            console.error('  2. Verify the database user credentials');
            console.error('  3. Update your .env file with correct DATABASE_URI');
            console.error('  4. Ensure your IP is whitelisted (or use 0.0.0.0/0 for all IPs)');
            console.error('\nConnection string format should be:');
            console.error('  mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority');
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo') || err.message.includes('querySrv')) {
            console.error('\n⚠️  Cannot reach MongoDB server!');
            console.error('This usually means:');
            console.error('  1. Incorrect cluster hostname in connection string');
            console.error('  2. Network connectivity issues');
            console.error('  3. MongoDB Atlas cluster is paused');
            console.error('\nThe connection string hostname appears to be incorrect.');
            // Show a masked version of the connection string for debugging
            if (process.env.DATABASE_URI) {
                const uri = process.env.DATABASE_URI;
                const maskedUri = uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)/, 'mongodb+srv://$1:***@$3');
                console.error('Current DATABASE_URI format:', maskedUri);
                console.error('\nExpected format: mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name');
                console.error('Common issues:');
                console.error('  - Hostname should be like: cluster0.vcqkraa.mongodb.net');
                console.error('  - NOT like: acme.whbausv.mongodb.net (this looks incorrect)');
                console.error('  - Make sure you copied the connection string from MongoDB Atlas');
            }
        } else {
            console.error('\n⚠️  Unexpected database connection error');
            console.error('Please check your DATABASE_URI and MongoDB configuration');
        }
        
        console.error('\n===================================\n');
        
        // In Vercel/serverless, throw instead of exiting
        if (process.env.VERCEL) {
            throw err;
        }
        process.exit(1);
    }
};

export default connectDB;
