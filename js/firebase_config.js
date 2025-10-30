const config = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

firebase.initializeApp(config);

var oDb = firebase.database();

var oDbKorisnici = oDb.ref('korisnici');
var oDbSportovi = oDb.ref('sportovi');
var oDbUloge = oDb.ref('uloge');
var oDbClanarina = oDb.ref('clanarina');
var oDbKontakt = oDb.ref('kontakt');
var auth = firebase.auth();