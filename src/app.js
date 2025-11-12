const express = require('express');
const { PrismaClient } = require('@prisma/client');
const driverRoutes = require('./routes/drivers');
const vehicleRoutes = require('./routes/vehicles');
const tripRoutes = require('./routes/trips');

// Initialize Prisma Client
const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

const app = express();
const port = 8080;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
    // Simple logging middleware
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Root route check
app.get('/', (req, res) => {
    res.send('Microfleet API is running!');
});

// API Routes
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

async function main() {
    try {
        // Simple database connectivity check
        await prisma.$connect();
        console.log('Database connected successfully.');
        
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to database or start server:', error);
        // Safely disconnect prisma on failure
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();

// 💡 EXPORT: We export the Prisma client so controllers can use it.
module.exports = { prisma, app };