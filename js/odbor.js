function Odbor() {
    const izvrsniOdborList = $('#izvrsniOdborList');
    oDbUloge.orderByChild('naziv').equalTo('izvršni odbor').limitToLast(5).once('value', (rolesSnapshot) => {
        const rolesData = rolesSnapshot.val();
        if (rolesData) {
            Object.values(rolesData).forEach(role => {
                const korisnikId = role.korisnik_id;
                oDbKorisnici.child(korisnikId).once('value', (userSnapshot) => {
                    const user = userSnapshot.val();
                    if (user.status === 5) {
                        const Name = `${user.ime} ${user.prezime}`;
                        const listItem = `<li class="list-group-item">${Name}</li>`;
                        izvrsniOdborList.append(listItem);
                    }
                });
            });
        }
        else{
            izvrsniOdborList.append('<div class="list-group-item">Nema članova izvršnog odbora.</div>');
        }
    });

    const nadzorniOdborList = $('#nadzorniOdborList');
    oDbUloge.orderByChild('naziv').equalTo('nadzorni odbor').limitToLast(3).once('value', (rolesSnapshot) => {
        const rolesData = rolesSnapshot.val();
        if (rolesData) {
            Object.values(rolesData).forEach(role => {
                const korisnikId = role.korisnik_id;
                oDbKorisnici.child(korisnikId).once('value', (userSnapshot) => {
                    const user = userSnapshot.val();
                    if (user.status === 6) {
                        const Name = `${user.ime} ${user.prezime}`;
                        const listItem = `<li class="list-group-item">${Name}</li>`;
                        nadzorniOdborList.append(listItem);
                    }
                });
            });
        }
        else{
            nadzorniOdborList.append('<div class="list-group-item">Nema članova nadzornog odbora.</div>');
        }
    });
}

$(document).ready(() => {
    Odbor();
  });

function UserList() {
    const userListContainer = $('#userList');
    userListContainer.empty();
    oDbKorisnici.once('value', (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
        Object.keys(usersData).forEach((Id) => {
          const user = usersData[Id];
          if (user.status === 0) {
            const listItem = `
              <label class="list-group-item">
                <input type="checkbox" class="user-checkbox" data-user-id="${Id}">
                ${user.ime} ${user.prezime}
              </label>
            `;
            userListContainer.append(listItem);
          }
        });
      } else {
        userListContainer.append('<div class="list-group-item">Nema dostupnih korisnika.</div>');
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

function Novo() {
    const now = new Date();
    const year = now.getFullYear() + 1;
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${day}.${month}.${year}.`;
}

function NewIO(selectedUserId) {
    const sKey = firebase.database().ref().child('uloge').push().key;
    const newData = {
        korisnik_id: selectedUserId,
        naziv: 'izvršni odbor', 
        datum_pocetka: Danas(), 
        datum_zavrsetka: Novo() 
    };
    const oZapis = {};
    oZapis[sKey] = newData;

    return oDbUloge.update(oZapis)
        .then(() => {
            return oDbKorisnici.child(selectedUserId).update({ status: 5 });
        });
}
function NewNO(selectedUserId) {
    const sKey = firebase.database().ref().child('uloge').push().key;
    const newData = {
        korisnik_id: selectedUserId,
        naziv: 'nadzorni odbor', 
        datum_pocetka: Danas(), 
        datum_zavrsetka: Novo() 
    };
    const oZapis = {};
    oZapis[sKey] = newData;

    return oDbUloge.update(oZapis)
        .then(() => {
            return oDbKorisnici.child(selectedUserId).update({ status: 6 });
        });
}

function NewOdbor() {
    const selectedUserIds = $('.user-checkbox:checked').toArray().map(item => $(item).data('user-id'));
    const selectedOdbor = $('#odborSelect').val();

    var result = confirm("Jeste li sigurni?");
    if (result) {
        let maxUsers = selectedOdbor === 'nadzorni' ? 3 : 5;

        if (selectedUserIds.length !== maxUsers) {
            alert(`Molimo odaberite ${maxUsers} korisnika.`);
        } else {
            Promise.all(selectedUserIds.map(selectedUserId => {
                if(selectedOdbor === 'izvrsni'){
                    return NewIO(selectedUserId)
                }
                else{
                    return NewNO(selectedUserId)
                }
            })).then(() => {
                location.reload();
            });
        }
    } 
    else {
        
    }
}

$(document).ready(() => {
    $('#chooseBtn').click(NewOdbor);
    $('#userList').on('click', 'li', function () {
        $(this).addClass('active').siblings().removeClass('active');
    });
});

function RemoveIO() {
    var result = confirm("Jeste li sigurni?");
    if (result) {
        oDbKorisnici.once('value', (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                Object.keys(usersData).forEach((userId) => {
                    const user = usersData[userId];
                    if (user.status === 5) {
                        oDbKorisnici.child(userId).update({ status: 0 })
                    }
                });
            }
        });
        alert('Članovi uklonjeni s izvršnog odbora')
        location.reload();
    }
}
$(document).ready(() => {
    $('#btnIO').click(RemoveIO)
});

function RemoveNO() {
    var result = confirm("Jeste li sigurni?");
    if (result) {
        oDbKorisnici.once('value', (snapshot) => {
            const usersData = snapshot.val();
            if (usersData) {
                Object.keys(usersData).forEach((userId) => {
                    const user = usersData[userId];
                    if (user.status === 6) {
                        oDbKorisnici.child(userId).update({ status: 0 })
                    }
                });
            }
        });
        alert('Članovi uklonjeni s nadzornog odbora')
        location.reload();
    }
}
$(document).ready(() => {
    $('#btnNO').click(RemoveNO)
});

UserList();