function User(id) {
    const currentParagraph = $('#currentName');
    const currentDate = $('#Datum');
    const currentOIB = $('#OIB');
    const currentAdresa = $('#Adresa');
    const currentMjesto = $('#Mjesto');
    const currentEmail = $('#Email');
    if(id){
        oDbKorisnici.child(id).once('value', (userSnapshot) => {
            const user = userSnapshot.val();
            const Name = `${user.ime} ${user.prezime}`;
            currentParagraph.text(`${Name}`);
            currentDate.text(`${user.datum_rodenja}`);
            currentOIB.text(`${user.oib}`);
            currentAdresa.text(`${user.adresa}`);
            currentMjesto.text(`${user.mjesto}`);
            currentEmail.text(`${user.email}`);

            SportList(user.sportovi);
        });
    }
}

function Sportovi(userId) {
    const sportoviList = $('#sportoviList');
    sportoviList.empty();
    const userRef = firebase.database().ref('korisnici/' + userId);
    userRef.once('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData && userData.sportovi) {
            const userSportovi = userData.sportovi;
            Object.keys(userSportovi).forEach((sportId) => {
                if (userSportovi[sportId] === true) {
                    const sportNameRef = firebase.database().ref('sportovi/' + sportId + '/ime');
                    sportNameRef.once('value', (snapshot) => {
                        const sportName = snapshot.val();
                        const listItem = `<li class="list-group-item">${sportName}</li>`;
                        sportoviList.append(listItem);
                    });
                }
            });
        } 
        else {
            sportoviList.append('<div class="list-group-item">Korisnik nije odabrao sportove.</div>');
        }
    });
}

function SportList(userSportovi) {
    const ListContainer = $('#sportList');
    ListContainer.empty();
    oDbSportovi.once('value', (snapshot) => {
        const sportData = snapshot.val();
        if (sportData) {
            Object.keys(sportData).forEach((Id) => {
                const sport = sportData[Id];
                const isChecked = userSportovi && userSportovi[Id] === true;
                const listItem = `
                    <label class="list-group-item">
                        <input type="checkbox" class="sport-checkbox" data-sport-id="${Id}" ${isChecked ? 'checked' : ''}>
                        ${sport.ime}
                    </label>
                `;
                ListContainer.append(listItem);
            });
        } else {
            ListContainer.append('<div class="list-group-item">Nema sportova.</div>');
        }
    });
}

function Danas() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${day}.${month}.${year}.`;
}

function PlatiClanarina(selectedUserId) {
    const sKey = firebase.database().ref().child('clanarina').push().key;
    oDbClanarina.orderByChild('korisnik_id').equalTo(selectedUserId).limitToLast(1).once('value', function(snapshot) {
        var zadnjaUplata = snapshot.val();
        if (!zadnjaUplata) {
            const newData = {
                korisnik_id: selectedUserId,
                iznos: '10 €',
                datum_placanja: Danas()
            };
            const oZapis = {};
            oZapis[sKey] = newData;
            return oDbClanarina.update(oZapis).then(() => {
                alert('Uspješno plaćena članarina');
                location.reload();
            });
        } else {
            var zadnjiDatumUplate = Object.values(zadnjaUplata)[0].datum_placanja;
            if (zadnjiDatumUplate.slice(0, 7) !== Danas().slice(0, 7)) {
                const newData = {
                    korisnik_id: selectedUserId,
                    iznos: '10 €',
                    datum_placanja: Danas()
                };
                const oZapis = {};
                oZapis[sKey] = newData;
                return oDbClanarina.update(oZapis).then(() => {
                    alert('Uspješno plaćena članarina');
                    location.reload();
                });
            } 
            else {
                alert('Član je već platio članarinu ovaj mjesec.');
            }
        }
    });
}

function ClanarinaTable(selectedUserId) {
    const TableBody = $('#tableClanarina tbody');
    oDbClanarina.orderByChild('korisnik_id').equalTo(selectedUserId).once('value', (clanarinaSnapshot) => {
        const clanarinaData = clanarinaSnapshot.val();
        TableBody.empty(); 
        if (clanarinaData) {
            Object.keys(clanarinaData).forEach((clanarinaId) => {
                const clanarina = clanarinaData[clanarinaId];
                const datumPlacanja = clanarina.datum_placanja;
                const iznos = clanarina.iznos;
                const row = `<tr>
                                <td>${datumPlacanja}</td>
                                <td>${iznos}</td>
                            </tr>`;
                TableBody.append(row);
            });
        } else {
            const noRow = '<tr><td colspan="2">Trenutno nema uplata za ovog člana.</td></tr>';
            TableBody.append(noRow);
        }
    });
}


$(document).ready(function() {
    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get('id');
    if (id) {
        User(id);
        Sportovi(id);
        $('#btnPlati').click(function() {
            PlatiClanarina(id);
        });
        ClanarinaTable(id);
    }
    
    $(document).on('change', '.sport-checkbox', function () {
        const userId = urlParams.get('id');
        const sportId = parseInt($(this).data('sport-id'));
        const isChecked = $(this).prop('checked');

        if (userId) {
            const userRef = firebase.database().ref('korisnici/' + userId);
            userRef.once('value', function(snapshot) {
                let userData = snapshot.val();
                if (isChecked) {
                    if (!userData.sportovi) {
                        userData.sportovi = {};
                    }
                    userData.sportovi[sportId] = true;
                } 
                else {
                    if (userData.sportovi && userData.sportovi[sportId]) {
                        delete userData.sportovi[sportId];
                    }
                }
                userRef.update({ sportovi: userData.sportovi });
            })
            .then(() => {
                location.reload();
            });
        }
    });
});