const admin = require('firebase-admin');

var serviceAccount = require('../Credential/serviceAccountKey.json');

// console.log('[DEBUG] serviceAccount: ');
// console.log(serviceAccount);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin.firestore();