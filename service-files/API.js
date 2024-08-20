const API_GATEWAY_URL = "https://7c4lafwyil.execute-api.us-east-1.amazonaws.com/prod/";

module.exports = {
    GetUserByIdFunction,
    AddUserFunction,
    DeleteUserFunction,
    UploadProfilePictureFunction,
    GeneratePresignedUrlFunction,
};

async function GetUserByIdFunction(email) {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/GetUserById/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function AddUserFunction(email, password, phone) {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/AddUser/${email}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, phone }),
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function DeleteUserFunction(email) {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/DeleteUser/${email}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function UploadProfilePictureFunction(email, profilePicture) {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/UploadProfilePicture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, profilePicture }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

async function GeneratePresignedUrlFunction(email) {
    try {
        const response = await fetch(`${API_GATEWAY_URL}/GenPresignedURL`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        return result.preSignedUrl;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

