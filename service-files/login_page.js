const API = require('./API.js');

document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('mail').value;
  const password = document.getElementById('password').value;

  const result = await API.GetUserByIdFunction(email);
  if (result.Item.key == email && result.Item.password == password) {
    window.location.href = 'posts_page.html';
  } else {
    alert('Invalid username or password');
  }
});

function togglePasswordVisibility() {
  var passwordInput = document.getElementById("password");
  var showPasswordCheckbox = document.getElementById("showPassword");

  // Change the type attribute based on the checkbox state
  passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
}