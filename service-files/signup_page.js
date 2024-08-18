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

    const email = document.getElementById('mail').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;
    const profilePicture = document.getElementById('profilePicture').files[0];

    const result = API.AddUserFunction(email, password, phone); 
    if (result) {
        alert('User added successfully');
    }
    window.location.href = 'index.html';
});