import allowedOrigins from './allowedOrigins.js';

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],  // Allow multiple origins
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
};

export default corsOptions;