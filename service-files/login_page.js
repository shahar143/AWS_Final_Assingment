function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    var showPasswordCheckbox = document.getElementById("showPassword");
  
    // Change the type attribute based on the checkbox state
    passwordInput.type = showPasswordCheckbox.checked ? "text" : "password";
  }
