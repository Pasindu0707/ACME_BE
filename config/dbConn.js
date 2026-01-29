import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.DATABASE_URI) {
            console.error('DATABASE_URI is not defined in environment variables');
            process.exit(1);
        }
        
        // Connection options for better error handling and reliability
        const options = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        };
        
        await mongoose.connect(process.env.DATABASE_URI, options);
        console.log('MongoDB connection initiated');
    } catch (err) {
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
        } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
            console.error('\n⚠️  Cannot reach MongoDB server!');
            console.error('This usually means:');
            console.error('  1. Incorrect cluster hostname in connection string');
            console.error('  2. Network connectivity issues');
            console.error('  3. MongoDB Atlas cluster is paused');
        } else {
            console.error('\n⚠️  Unexpected database connection error');
            console.error('Please check your DATABASE_URI and MongoDB configuration');
        }
        
        console.error('\n===================================\n');
        process.exit(1);
    }
};

export default connectDB;
