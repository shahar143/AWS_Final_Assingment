const fetch = require('node-fetch');
const API = require('./API.js');
jest.mock('node-fetch');

describe('GetUserByIdFunction', () => {
    it('should return user data when called with a valid email', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ email: 'test@example.com', phone: '1234567890' }),
        };

        fetch.mockResolvedValue(mockResponse);

        const result = await API.GetUserByIdFunction('test@example.com'); 
        expect(result).toEqual({ email: 'test@example.com', phone: '1234567890' });
    });

    it('should throw an error when the response is not ok', async () => {
        const mockResponse = { ok: false, status: 404 };
        fetch.mockResolvedValue(mockResponse);

        await expect(API.GetUserByIdFunction('invalid@example.com')).rejects.toThrow('HTTP error! status: 404');
    });
});

describe('AddUserFunction', () => {
    it('should return success message when user is added successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ message: 'User created successfully' }),
        };

        fetch.mockResolvedValue(mockResponse);

        const result = await API.AddUserFunction('test@example.com', 'password123', '1234567890');
        expect(result).toEqual({ message: 'User created successfully' });
    });

    it('should throw an error when the response is not ok', async () => {
        const mockResponse = { ok: false, status: 500 };
        fetch.mockResolvedValue(mockResponse);

        await expect(API.AddUserFunction('test@example.com', 'password123', '1234567890')).rejects.toThrow('HTTP error! status: 500');
    });
});


describe('DeleteUserFunction', () => {
    it('should return success message when user is deleted successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ message: 'User deleted successfully' }),
        };

        fetch.mockResolvedValue(mockResponse);

        const result = await API.DeleteUserFunction('test@example.com');
        expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should throw an error when the response is not ok', async () => {
        const mockResponse = { ok: false, status: 500 };
        fetch.mockResolvedValue(mockResponse);

        await expect(API.DeleteUserFunction('test@example.com')).rejects.toThrow('HTTP error! status: 500');
    });
});
