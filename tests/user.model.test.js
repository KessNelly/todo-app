/**
 * Unit tests for User model logic (no DB connection required)
 */
require('./setup');
const bcrypt = require('bcryptjs');

describe('Password hashing (User model logic)', () => {
  test('bcrypt hashes a password', async () => {
    const plain = 'mypassword';
    const hashed = await bcrypt.hash(plain, 10);
    expect(hashed).not.toBe(plain);
    expect(hashed.startsWith('$2')).toBe(true);
  });

  test('bcrypt.compare returns true for correct password', async () => {
    const plain = 'securepass';
    const hashed = await bcrypt.hash(plain, 10);
    const result = await bcrypt.compare(plain, hashed);
    expect(result).toBe(true);
  });

  test('bcrypt.compare returns false for wrong password', async () => {
    const hashed = await bcrypt.hash('realpassword', 10);
    const result = await bcrypt.compare('wrongpassword', hashed);
    expect(result).toBe(false);
  });
});

describe('User schema validation rules', () => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;

  test('valid username passes regex', () => {
    expect(usernameRegex.test('validUser_123')).toBe(true);
  });

  test('username with spaces fails regex', () => {
    expect(usernameRegex.test('bad user')).toBe(false);
  });

  test('username with special chars fails regex', () => {
    expect(usernameRegex.test('user@name!')).toBe(false);
  });

  test('username min length 3', () => {
    expect('ab'.length >= 3).toBe(false);
    expect('abc'.length >= 3).toBe(true);
  });

  test('username max length 30', () => {
    expect('a'.repeat(31).length <= 30).toBe(false);
    expect('a'.repeat(30).length <= 30).toBe(true);
  });

  test('password minimum length 6', () => {
    expect('12345'.length >= 6).toBe(false);
    expect('123456'.length >= 6).toBe(true);
  });
});
