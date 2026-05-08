/**
 * Test setup
 * Note: MongoMemoryServer requires downloading MongoDB binaries.
 * In sandboxed environments, we validate logic with unit-style mocks.
 * In real CI/CD: set MONGODB_URI env var or use MongoMemoryServer.
 */
process.env.SESSION_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
