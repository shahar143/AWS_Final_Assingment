const API = require('./API.js');

function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    var showPasswordCheckbox = document.getElementById("showPassword");
  
    // Change the type attribute based on the checkbox state
    passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
  }

// JavaScript to handle image preview
const profilePictureInput = document.getElementById('profilePicture');
const profileImagePreview = document.getElementById('profileImagePreview');

profilePictureInput.addEventListener('change', function() {
    const file = this.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(event) {
            profileImagePreview.setAttribute('src', event.target.result);
            profileImagePreview.style.display = 'block';
        };

        reader.readAsDataURL(file);
    } else {
        profileImagePreview.style.display = 'none';
    }
});

document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('mail').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const profilePictureInput = document.getElementById('profilePicture');
    const file = profilePictureInput.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = async function(event) {
            const base64Image = event.target.result.split(',')[1]; // Get the base64 part of the image

            // Upload the profile picture
            try {
                await API.UploadProfilePictureFunction(email, base64Image);
                alert('Profile picture uploaded successfully!');

                // Generate the pre-signed URL
                const preSignedUrl = await API.GeneratePresignedUrlFunction(email);
                alert('Access your profile picture here: ' + preSignedUrl);

                // Create the user
                const addUserResult = await API.AddUserFunction(email, password, phone); 
                if (addUserResult) {
                    window.location.href = 'index.html';
                }
            } catch (error) {
                alert('Failed: ' + error.message);
            }
        };

        reader.readAsDataURL(file);
    }
});

