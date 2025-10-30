function Posalji(){
    var sIme = $('#ime').val();
    var sEmail = $('#email1').val();
    var sPoruka = $('#poruka').val();
    if (!sIme || !sEmail || !sPoruka) {
        alert('Nisu popunjena sva polja.');
        return;
    }
    const sKey = firebase.database().ref().child('kontakt').push().key;
    var oKontakt = {
        ime: sIme,
        email: sEmail,
        poruka: sPoruka
    };
    var oZapis = {};
    oZapis[sKey] = oKontakt;
    oDbKontakt.update(oZapis)
    .then(() => {
        alert('Poruka je uspješno poslana!');
        location.reload();
    });
}

$(document).ready(() => {
    $('#btnSend').click(function() {
        Posalji();
    });
});