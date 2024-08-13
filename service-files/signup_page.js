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

document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();

    // Perform your sign-up logic here (e.g., send the form data to your server)

    // After successful sign-up, redirect to index.html
    window.location.href = 'index.html';
});