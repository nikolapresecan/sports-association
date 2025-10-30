function showInfo(IdUser) {
    window.location.href = `clan.html?id=${IdUser}`;
}

function Users(){
    oDbKorisnici.on('value', function (oOdgovorPosluzitelja)
    { 
        var brojac = 1;
        var tablica = $("#table tbody")
        tablica.empty();
        oOdgovorPosluzitelja.forEach(function (oKorisnikSnapshot)
        {
            var sKorisnikKey = oKorisnikSnapshot.key; 
            var oKorisnik = oKorisnikSnapshot.val(); 
            var ime = oKorisnik.ime;
            var prezime = oKorisnik.prezime;
            var datRod = oKorisnik.datum_rodenja;
            var oib = oKorisnik.oib;
            var adresa = oKorisnik.adresa;
            var mjesto = oKorisnik.mjesto;
            var email = oKorisnik.email;
            var sport = oKorisnik.sportovi;

            tablica.append("<tr><td>" + brojac++ + "</td><td  id = \""+ sKorisnikKey +"\" onclick='showInfo(\""+ sKorisnikKey +"\")'>" + ime + "</td><td  id = \""+ sKorisnikKey +"\" onclick='showInfo(\""+ sKorisnikKey +"\")'>" + prezime + "</td><td>" + datRod + "</td><td><button type='button' data-toggle='modal' data-target='#modalUre' onclick='Uredi(\""+ sKorisnikKey +"\")' class='btn btn-dark'>Uredi</button></td" + "</td><td><button type='button' onclick='Obrisi(\""+ sKorisnikKey +"\")' class='btn btn-light'>Obriši</button></td");
        });
    });
}

function liveSearch() {
    const searchQuery = $('#searchInput').val();
    $('#table tbody tr').filter(function() {
      $(this).toggle(
        $(this).text().indexOf(searchQuery) > -1
      );
    });
  }
  
  $('#searchInput').on('keyup', liveSearch);
  
  $(document).ready(() => {
    Users();
  });

$(document).ready(function () {
    $('#datepicker1').datepicker({
        format: 'dd.mm.yyyy.',
        language: 'hr',
        endDate: 'today',
        autoclose: true
    });
});
$(document).ready(function () {
    $('#datepicker2').datepicker({
        format: 'dd.mm.yyyy.',
        language: 'hr',
        endDate: 'today',
        autoclose: true
    });
});

function Dodaj(){
    var sKorisnikIme = $('#inptime').val();
    var sKorisnikPrezime = $('#inptprezime').val();
    var sKorisnikDatum_rodenja = $('#datepicker1').val();
    var sKorisnikOib = $('#inptoib').val();
    var sKorisnikAdresa = $('#inptadresa').val();
    var sKorisnikMjesto = $('#inptmjesto').val();
    var sKorisnikEmail = $('#inptgmail').val();

    if (!sKorisnikIme || !sKorisnikPrezime || !sKorisnikDatum_rodenja || !sKorisnikOib || !sKorisnikAdresa || !sKorisnikMjesto || !sKorisnikEmail) {
        alert('Nisu popunjena sva polja.');
        return;
    }

    var provjeraOIB = /^\d{11}$/;
    if (!provjeraOIB.test(sKorisnikOib)) {
        alert('OIB mora imati 11 znakova i sastojati se samo od brojeva.');
        return;
    }
    

    var sKey = firebase.database().ref().child('korisnici').push().key;
    var oKorisnik = 
    {
        ime: sKorisnikIme,
        prezime: sKorisnikPrezime,
        datum_rodenja: sKorisnikDatum_rodenja,
        oib: sKorisnikOib,
        adresa: sKorisnikAdresa,
        mjesto: sKorisnikMjesto,
        email: sKorisnikEmail,
        status: 0
    };
    var oZapis = {};
    oZapis[sKey] = oKorisnik;
    oDbKorisnici.update(oZapis);
}

function Obrisi(sKorisnikKey) {
    var oKorisnikRef = oDb.ref('korisnici/' + sKorisnikKey);

    oKorisnikRef.once('value', function(snapshot) {
        var korisnikData = snapshot.val();
        if (korisnikData && korisnikData.status === 0) {
            var result = confirm("Jeste li sigurni da želite obrisati člana?");
            if (result) {
                oKorisnikRef.remove();
            } 
            else {
                
            }
        } 
        else {
            alert("Korisnik ima ulogu i nije ga moguće izbrisati.");
        }
    });
}

function Uredi(sKorisnikKey)
{
    var oKorisnikRef = oDb.ref('korisnici/' + sKorisnikKey);
    oKorisnikRef.once('value', function(oOdgovorPosluzitelja)
    {
        var oKorisnik = oOdgovorPosluzitelja.val();
        $('#edtime').val(oKorisnik.ime);
        $('#edtprezime').val(oKorisnik.prezime);
        $('#datepicker2').val(oKorisnik.datum_rodenja);
        $('#edtoib').val(oKorisnik.oib);
        $('#edtadresa').val(oKorisnik.adresa);
        $('#edtmjesto').val(oKorisnik.mjesto);
        $('#edtgmail').val(oKorisnik.email);
        
        $('#updateUser').attr('onclick', 'Spremi("'+sKorisnikKey+'")');
    });
}

function Spremi(sKorisnikKey)
{
    var oKorisnikRef = oDb.ref('korisnici/' + sKorisnikKey);
    var sKorisnikIme = $('#edtime').val();
    var sKorisnikPrezime = $('#edtprezime').val();
    var sKorisnikDatum_rodenja = $('#datepicker2').val();
    var sKorisnikOib = $('#edtoib').val();
    var sKorisnikAdresa = $('#edtadresa').val();
    var sKorisnikMjesto = $('#edtmjesto').val();
    var sKorisnikEmail = $('#edtgmail').val();
    var oKorisnik = 
    {
        ime: sKorisnikIme,
        prezime: sKorisnikPrezime,
        datum_rodenja: sKorisnikDatum_rodenja,
        oib: sKorisnikOib,
        adresa: sKorisnikAdresa,
        mjesto: sKorisnikMjesto,
        email: sKorisnikEmail
    };
    
    var result = confirm("Jeste li sigurni da želite ažurirati člana?");
    if (result) {
        oKorisnikRef.update(oKorisnik);
    }
    else{

    }
}