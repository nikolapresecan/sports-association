function Login()
{

  var emailOne = document.getElementById('email').value;
  var passwordOne = document.getElementById('password').value;
  
  auth.signInWithEmailAndPassword(emailOne, passwordOne)
  .then((user) => {

    window.open('../index.html', '_self');

  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}

function SignOut() {
  firebase.auth().signOut().then(() => {
     }).catch((error) => {
  });
}