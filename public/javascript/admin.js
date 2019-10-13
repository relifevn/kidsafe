// firebase.auth().onAuthStateChanged(function(user) {
//     if (user) {
//       window.location.href = 'admin/dashboard';
  
//     } else {
//       // No user is signed in.
  
//       // document.getElementById("user_div").style.display = "none";
//       document.getElementById("login_div").style.display = "block";
  
//     }
// });
function login(){
    var u_email = document.getElementById('email').value;
    var u_password = document.getElementById('password').value;

    firebase.auth().onAuthStateChanged(function(user) {
        if (user && !user.isAnonymous) {

            // redirect to lobby
            window.location.href = '/admin/dashboard';

        // ...
        } else {
            firebase.auth().signInWithEmailAndPassword(u_email, u_password).then(function(){
                window.location.href = '/admin/dashboard';
                
                // window.location.href = '/testPage';
            })
            .catch(function(error){
                // Handle Errors here.
                var errorMessage = error.message;
                // if (errorMessage == "The password is invalid or the user does not have a password."){
                //     return false;        
                // }
        
                window.alert("Error : " + errorMessage); 
                
                // return false;
            });
            // return true;
        }
    });

    
};

function logout(){
    firebase.auth().signOut();
}
