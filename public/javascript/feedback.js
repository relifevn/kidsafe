// Get the modal
var modal = document.getElementById('myModal');
        
// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// Reference messages collection
var messagesRef = firebase.database().ref('Feedback');

// Listen for form submit
// document.getElementById('feedbackForm').addEventListener('sendFeed', sendFeedback);
var point = 0;

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

$('li > a').click(function() {
    $('li').removeClass();
    $(this).parent().addClass('active');
    point = $(this).html()
  });
// Submit form
function sendFeedback(){
//   e.preventDefault();

  // Get values
     var feedback = getInputVal('input_feedback');
     var emailclient = getInputVal('InputEmail');
     if (feedback.length == 0 | emailclient.length == 0){
      document.querySelector('#empty').style.display = 'block';
      setTimeout(function(){
        document.querySelector('#empty').style.display = 'none';
    },3000);

     }
     else{
        // Save message
        saveMessage(feedback, point, emailclient);
        // Show alert
        document.querySelector('#send').style.display = 'block';
        // Hide alert after 3 seconds
        setTimeout(function(){
            document.querySelector('#send').style.display = 'none';
        },3000);
        // Clear form
        document.getElementById('feedbackForm').reset();
     }
    
}

// Function to get get form values
function getInputVal(id){
  return document.getElementById(id).value;
}

// Save message to firebase
function saveMessage(message, point, email){
  var newMessageRef = messagesRef.push();
  newMessageRef.set({
    message: message,
    point: point,
    email: email
  });
}