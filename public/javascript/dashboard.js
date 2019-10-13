// Check user signed-in
var $jq = jQuery.noConflict();
var playersRef = firebase.database().ref("Feedback/");
var listemail = new Array();
// 
firebase.auth().onAuthStateChanged(function (user) {
    if (user && !user.isAnonymous) {
        // User is signed in. Updated
        // var user = firebase.auth().currentUser;

        // user.updateProfile({
        //     displayName: "Ngọc Ánh",
        //   }).then(function() {
        //     // Update successful.
        //   }).catch(function(error) {
        //     // An error happened.
        // });
        // change hostname to displayName

        $jq("#adminname").text(user.displayName);

        // ...
    } else {
        // User is signed out.
        alert("You have not signed-in yet :(");
        // Redirect to authen
        window.location.href = '/admin/login';
        // ...
    }
});
  
playersRef.on("child_added", function(data, prevChildKey) {
    var newPlayer = data.val();
  //  console.log("name: " + newPlayer.point);
  //  console.log("mess: " + newPlayer.message);
    var feedbacklist = $jq("#feedbacklist");
    var email = newPlayer.email;
    listemail.push(email);
    let childStr = "";

    if (!data.exists()) {
      childStr = "<div> We don't have any feedback </div>";
      // Do stuff        
    } else {
  //  for (var key in players) {

      childStr = "<div class=\"col-lg-3 col-md-4 col-sm-6 mb-4\">"+
      "<div class=\"card h-100\">"+
        "<a href=\"#\"></a>"+
        "<div class=\"card-body\">"+
          "<h4 class=\"card-title\">"+
            "<a style=\"color: blue\">Satisfaction level: </a>"+
            "<a style=\"color: red\">"+ newPlayer.point+"</a>"+
          "</h4>"+
          "<p class=\"card-text\">"+newPlayer.message+"</p>"+
        "</div>"+
      "</div>"+
    "</div>";
    }
      // childStr += "<li class=\"badge badge-success\">" + newPlayer.point + "   " + newPlayer.message + "</li>";
  // }
  feedbacklist.append(childStr);

});


jQuery(document).ready(function() {
  jQuery('.toggle-nav').click(function(e) {
    jQuery(this).toggleClass('active');
    jQuery('.menu ul').toggleClass('active');
    e.preventDefault();
  });
});
$( "#feedback" ).click(function() {
    document.getElementById("promotion-page").style.display = "none";
    document.getElementById("more").style.display = "none";
    document.getElementById("newfeed").style.display = "block";
});
$( "#logout" ).click(function() {
    logout();
});
$( "#promotion" ).click(function() {
  document.getElementById("newfeed").style.display = "none";
  document.getElementById("more").style.display = "none";
  document.getElementById("promotion-page").style.display = "block";

});
$( "#moreinfo" ).click(function() {
  document.getElementById("newfeed").style.display = "none";
  document.getElementById("promotion-page").style.display = "none";
  document.getElementById("more").style.display = "block";


});

// Attach a submit handler to the form
$( "#promoform" ).submit(function( event ) {
 
  // Stop form from submitting normally
  event.preventDefault();
 
  // Get some values from elements on the page:
  var $form = $( this ),
    subject = $form.find( "textarea[name='subject']" ).val(),
    message = $form.find( "textarea[name='message']" ).val(),
    url = $form.attr( "action" );
 
  // Send the data using post
  $jq.ajax({
    type: 'POST',
    url: url,
    dataType: 'json',
    data: {subject: subject, message: message, listemail: listemail},
    success: function(data) {
        if (data.status != "OK") {
            alert("Failed: Can't send your email");
        }
        else {
          alert("Send your message successfully!!");

            // var notice = $form.find("div[id='success_message']");
            // notice.display = 'block';
            // document.getElementById('success_message').display = 'block';
            // Hide alert after 3 seconds
            // setTimeout(function(){
            //     document.getElementById('success_message').display = 'none';
            // },3000);
            // window.location.href = "/admin/dashboard";
        }
    },
    error: function(xhr, ajaxOptions, thrownError) {
    }
  }); // End of AJAX
  // var posting = $.post( url, { s: term } );
 
  // Put the results in a div
  // posting.done(function( data ) {
  //   var content = $( data ).find( "#content" );
  //   $( "#result" ).empty().append( content );
  // });
});
function logout(){
  firebase.auth().signOut();
}

