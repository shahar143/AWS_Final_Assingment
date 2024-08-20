const fetch = require('node-fetch');
const API = require('./API.js');
jest.mock('node-fetch');

describe('GetUserByIdFunction', () => {
    it('should return Email is required error when called without an email', async () => {
        const result = await API.GetUserByIdFunction();
        expect(result).toEqual({ error: 'Email is required' });
    });
});

describe('GetUserByIdFunction', () => {
    it('should return user not found error when called with am email that does not exist', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({error: 'User not found'}),
        };

        fetch.mockResolvedValue(mockResponse);
        const result = await API.GetUserByIdFunction('notExist@example.com');
        expect(result).toEqual({ error: 'User not found' });
    });
});

describe('AddUserFunction', () => {
    it('should return Email, password, and phone are required error when called without an email, password, or phone', async () => {
        const result = await API.AddUserFunction();
        expect(result).toEqual({ error: 'Email, password, and phone are required' });
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

describe('GetUserByIdFunction', () => {
    it('should return user data when called with a valid email', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ email: 'test@example.com', password: 'password123', phone: '1234567890' }),
        };

        fetch.mockResolvedValue(mockResponse);
        
        const result = await API.GetUserByIdFunction('test@example.com'); 
        expect(result).toEqual({ email: 'test@example.com', password: 'password123', phone: '1234567890' });
    });

    it('should throw an error when the response is not ok', async () => {
        const mockResponse = { ok: false, status: 404 };
        fetch.mockResolvedValue(mockResponse);

        await expect(API.GetUserByIdFunction('invalid@example.com')).rejects.toThrow('HTTP error! status: 404');
    });
});

describe('AddUserFunction', () => {
    it('should return User already exists error when called with an email that already exists', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ error: 'User already exists' }),
        };

        fetch.mockResolvedValue(mockResponse);

        const result = await API.AddUserFunction('test@example.com', 'password123', '1234567890');
        expect(result).toEqual({ error: 'User already exists' });
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

describe('DeleteUserFunction', () => {
    it('should return Email is required error when called without an email', async () => {
        const result = await API.DeleteUserFunction();
        expect(result).toEqual({ error: 'Email is required' });
    });
});

describe('DeleteUserFunction', () => {
    it('should return error could not delete user when called with an email that does not exist', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ error: 'Could not delete user' }),
        };

        fetch.mockResolvedValue(mockResponse);

        const result = await API.DeleteUserFunction('test@example.com');
        expect(result).toEqual({ error: 'Could not delete user' });
    });
});

describe('UploadProfilePictureFunction', () => {
    it('should return a success message when the profile picture is uploaded successfully', async () => {
        const mockResponse = {
            ok: true,
            json: async () => ({ message: 'Profile picture uploaded and user record updated successfully' }),
        };

        fetch.mockResolvedValue(mockResponse);

        const result = await API.UploadProfilePictureFunction('test@example.com', 'base64EncodedImageString');
        expect(result).toEqual({ message: 'Profile picture uploaded and user record updated successfully' });
    });

    it('should throw an error when the response is not ok', async () => {
        const mockResponse = { ok: false, status: 500 };
        fetch.mockResolvedValue(mockResponse);

        await expect(API.UploadProfilePictureFunction('test@example.com', 'base64EncodedImageString')).rejects.toThrow('HTTP error! status: 500');
    });
});

