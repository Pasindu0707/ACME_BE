import allowedOrigins from './allowedOrigins.js';

const corsOptions = {
  origin: ['https://acme-fe-three.vercel.app','http://localhost:5173', 'http://localhost:3000'],  // Allow multiple origins
  methods: 'GET,POST,PUT,DELETE',
  credentials: true,
};

export default corsOptions;