document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('mail').value;
  const password = document.getElementById('password').value;

  const response = await fetch('https://ma36vpuk6l.execute-api.us-east-1.amazonaws.com/prod/checkUser', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: email, password: password }),
  });

  const result = await response.json();

  if (result.success) {
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