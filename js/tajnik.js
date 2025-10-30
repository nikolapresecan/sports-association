function Tajnik() {
    const currentParagraph = $('#currentT');
    oDbUloge.orderByChild('naziv').equalTo('tajnik').limitToLast(1).once('value', (rolesSnapshot) => {
      const rolesData = rolesSnapshot.val();
      if (rolesData) {
        const RoleId = Object.keys(rolesData)[0];
        const Role = rolesData[RoleId];
        const korisnikId = Role.korisnik_id;
        oDbKorisnici.child(korisnikId).once('value', (userSnapshot) => {
            const user = userSnapshot.val();
            if (user.status === 3) {
              const Name = `${user.ime} ${user.prezime}`;
              currentParagraph.text(`Trenutni tajnik: ${Name}`);
            } else {
              currentParagraph.text('Podaci o tajniku nisu dostupni.');
            }
        });
      } 
      else {
        currentParagraph.text('Trenutno nema tajnika.');
      }
    });
  }

$(document).ready(() => {
    Tajnik();
  });

function UserList() {
    const userListContainer = $('#userList');
    userListContainer.empty();
    oDbKorisnici.once('value', (snapshot) => {
        const usersData = snapshot.val();
        if(usersData){
          Object.keys(usersData).forEach((Id) => {
            const user = usersData[Id];
            if(user.status === 0){
                const listItem = `<li class="list-group-item" data-user-id="${Id}">${user.ime} ${user.prezime}</li>`;
                userListContainer.append(listItem);
            }
          });
        }
        else {
          userListContainer.append('<li class="list-group-item">Nema dostupnih korisnika.</li>');
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

function Old() {
  return new Promise((resolve, reject) => {
    oDbUloge.orderByChild('naziv').equalTo('tajnik').once('value')
      .then((snapshot) => {
        const Data = snapshot.val();
        if (Data) {
          const Ids = Object.keys(Data);
          const lastId = Ids[Ids.length - 1];
          const user = Data[lastId];
          const userId = user.korisnik_id;
          
          oDbKorisnici.child(userId).update({ status: 0 })
            .then(() => {
              oDbUloge.child(lastId).update({ datum_zavrsetka: Danas() })
                .then(() => resolve())
                .catch((error) => reject(error));
            })
            .catch((error) => reject(error));
        } else {
          reject('Nema trenutnog tajnika.');
        }
      })
      .catch((error) => reject(error));
  });
}

function New(selectedUserId) {
  const sKey = firebase.database().ref().child('uloge').push().key;
  const newData = {
    korisnik_id: selectedUserId,
    naziv: 'tajnik',
    datum_pocetka: Danas(),
    datum_zavrsetka: Novo()
  };
  const oZapis = {};
  oZapis[sKey] = newData;

  return oDbUloge.update(oZapis)
    .then(() => {
      return oDbKorisnici.child(selectedUserId).update({ status: 3 });
    });
}

function NewOld() {
  const selectedUserId = $('#userList .active').data('user-id');
  var result = confirm("Jeste li sigurni?");
    if (result) {
      if (selectedUserId) {
        Old()
          .then(() => {
            New(selectedUserId)
            .then(() => {
              location.reload();
            });
          });
      } 
      else {
        alert('Molimo odaberite korisnika.');
      }
    }
    else{

    }
}

$(document).ready(() => {
    UserList();
    $('#chooseBtn').click(NewOld);
    $('#userList').on('click', 'li', function () {
        $(this).addClass('active').siblings().removeClass('active');
    });
});


function displayTable() {
    const TableBody = $('#tableChooseT tbody');
    oDbUloge.orderByChild('naziv').equalTo('tajnik').once('value', (rolesSnapshot) => {
      const rolesData = rolesSnapshot.val();
      if (rolesData) {
        const Ids = Object.keys(rolesData);
        Ids.forEach((RoleId) => {
          const Role = rolesData[RoleId];
          const korisnikId = Role.korisnik_id;
          if (korisnikId) {
            oDbKorisnici.child(korisnikId).once('value', (userSnapshot) => {
              const user = userSnapshot.val();
              if (user) {
                const row = `<tr>
                            <td>${user.ime}</td>
                            <td>${user.prezime}</td>
                            <td>${Role.datum_pocetka}</td>
                            <td>${Role.datum_zavrsetka}</td>
                            </tr>`;
                TableBody.append(row);
              }
            });
          }
        });
      } 
      else {
        const noRow = '<tr><td colspan="3">Trenutno nema tajnika.</td></tr>';
        TableBody.append(noRow);
      }
    });
}
function liveSearch() {
  const searchQuery = $('#searchInput').val();
  $('#tableChooseT tbody tr').filter(function() {
    $(this).toggle(
      $(this).text().indexOf(searchQuery) > -1
    );
  });
}

$('#searchInput').on('keyup', liveSearch);

$(document).ready(() => {
  displayTable();
});

function RemoveT() {
  var result = confirm("Jeste li sigurni?");
  if (result) {
    oDbKorisnici.once('value', (snapshot) => {
      const usersData = snapshot.val();
      if (usersData) {
          Object.keys(usersData).forEach((userId) => {
              const user = usersData[userId];
              if (user.status === 3) {
                oDbKorisnici.child(userId).update({ status: 0 }).then(() => {
                  oDbUloge.orderByChild('naziv').equalTo('tajnik').once('value')
                    .then((snapshot) => {
                    const Data = snapshot.val();
                    if (Data) {
                      const Ids = Object.keys(Data);
                      const lastId = Ids[Ids.length - 1]; 
                      oDbUloge.child(lastId).update({ datum_zavrsetka: Danas() }).then(() => {
                        alert('Član uklonjen s uloge tajnik');
                        location.reload();
                      });
                    } 
                  });
                });
              }
          });
      }
    });
  }
}

$(document).ready(() => {
  $('#btnT').click(RemoveT);
});