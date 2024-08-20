const axios = require('axios');

const apiUrl = 'https://v9f59iq2nl.execute-api.us-east-1.amazonaws.com/prod';

describe('InstaPhoto API', () => {
    
    it('should return 404 for non-existent user', async () => {
        try {
        await axios.get(`${apiUrl}/GetUserById/nonexistent@example.com`);
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.error).toBe('User not found');
        }
    });

    it('should add a new user', async () => {
    const response = await axios.post(`${apiUrl}/AddUser`, {
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    expect(response.status).toBe(201);
    expect(response.data.message).toBe('User created successfully');
    });

    it('should get user by email', async () => {
        const response = await axios.get(`${apiUrl}/GetUserById/test@example.com`);

        expect(response.status).toBe(200);
        expect(response.data.email).toBe('test@example.com');
        expect(response.data.phone).toBe('1234567890');
        expect(response.data.password).toBe('password123');
        expect(response.data.hasProfilePicture).toBe(false);
        expect(response.data.profilePictureUrl).toBe(null);
    });

    it('sholud not add user without email', async () => {
        try {
            await axios.post(`${apiUrl}/AddUser`, {
                password: 'password',
                phone: '1234567890'
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.error).toBe('Email, password, and phone are required');
        }
    });

    it('should not add user without password', async () => {
        try {
            await axios.post(`${apiUrl}/AddUser`, {
                email: 'test',
                phone: '1234567890'
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.error).toBe('Email, password, and phone are required');
        }
    });

    it('should not add user without phone', async () => {
        try {
            await axios.post(`${apiUrl}/AddUser`, {
                email: 'test',
                password: 'password'
            });
        } catch (error) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.error).toBe('Email, password, and phone are required');
        }
    });

    it('should not add a user that already exists', async () => {
        try {
        await axios.post(`${apiUrl}/AddUser`, {
            email: 'test@example.com',
            password: 'password123',
            phone: '1234567890'
        });
        } catch (error) {
            expect(error.response.status).toBe(409);
            expect(error.response.data.error).toBe('User already exists');
            }
    });


    it('should delete a user by email', async () => {
        const response = await axios.delete(`${apiUrl}/DeleteUser/test@example.com`);

        expect(response.status).toBe(200);
        expect(response.data.message).toBe('User deleted successfully');
    });

    it('should return 404 for non-existent user', async () => {
        try {
            await axios.delete(`${apiUrl}/DeleteUser/test@example.com`);
        } catch (error) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.error).toBe('User not found');
        }
    });
});

describe('FetchPosts API', () => {

    it('should return all posts successfully', async () => {
        const response = await axios.get(`${apiUrl}/FetchPosts`);
        
        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        response.data.forEach(post => {
            expect(post).toHaveProperty('postId');
            expect(post).toHaveProperty('username');
            expect(post).toHaveProperty('email');
            expect(post).toHaveProperty('location');
            expect(post).toHaveProperty('timePosted');
            expect(post).toHaveProperty('imageUrl');
            expect(post).toHaveProperty('caption');
        });
    });

    it('should return 500 if there is an error fetching posts', async () => {
        try {
            await axios.get(`${apiUrl}/FetchPosts`);
        } catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data.error).toBe('Could not fetch posts');
        }
    });
});

describe('UploadPost API', () => {

    it('should upload a new post successfully', async () => {
        const response = await axios.post(`${apiUrl}/UploadPost`, {
            postId: '1234',
            username: 'john_doe',
            email: 'john@example.com',
            location: 'New York, NY',
            timePosted: '2024-08-20T12:34:56Z',
            imageUrl: 'post-image.jpg',
            caption: 'Enjoying the sunny day!'
        });

        expect(response.status).toBe(200);
        expect(response.data.message).toBe('Post uploaded successfully');
    });

    it('should return 500 if there is an error uploading the post', async () => {
        try {
            await axios.post(`${apiUrl}/UploadPost`, {
                postId: '1234',
                username: 'john_doe',
                email: 'john@example.com',
                location: 'New York, NY',
                timePosted: '2024-08-20T12:34:56Z',
                imageUrl: 'post-image.jpg',
                caption: 'Enjoying the sunny day!'
            });
        } catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data.error).toBe('Could not upload post');
        }
    });
});


describe('PresentFrontPage API', () => {

    it('should return the front page HTML content', async () => {
        const response = await axios.get(`${apiUrl}/PresentFrontPage`);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('text/html');
        expect(response.data).toContain('<html>'); // Assuming your HTML starts with <html>
    });

    it('should return 500 if there is an error serving the front page', async () => {
        try {
            await axios.get(`${apiUrl}/PresentFrontPage`);
        } catch (error) {
            expect(error.response.status).toBe(500);
            expect(error.response.data.error).toBe('Could not load index.html');
        }
    });
});
