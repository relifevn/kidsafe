const firebase = require('firebase');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCs2UdHgTcW2Qup_FYA5958PsbiFa2hZFU",
    authDomain: "sr-2019-a9061.firebaseapp.com",
    databaseURL: "https://sr-2019-a9061.firebaseio.com",
    projectId: "sr-2019-a9061",
    storageBucket: "sr-2019-a9061.appspot.com",
    messagingSenderId: "799538943550",
    appId: "1:799538943550:web:f34442b084ebf970c4236f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const database = firebase.database();

module.exports = database;