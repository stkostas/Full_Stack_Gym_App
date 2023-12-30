function showLoginForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  loginForm.classList.add('active');
  signupForm.classList.remove('active');
}

function showSignupForm() {
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  loginForm.classList.remove('active');
  signupForm.classList.add('active');
}
