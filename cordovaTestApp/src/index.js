import {newPromiseHelper} from '../../dist/index.es6.js';

document.addEventListener('deviceready', doTest);

function doTest() {
  const alert = navigator.notification.alert;

  const db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

  const helper = newPromiseHelper(db);

  const tx = helper.newBatchTransaction();
  tx.executeStatement('DROP TABLE IF EXISTS tt');
  tx.executeStatement('CREATE TABLE tt(a,b)');
  tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);

  tx.commit().then(function() {
    return helper.executeStatement('SELECT * FROM tt', null);

  }).then(function(rs) {
    alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));

  }).then(null, function(error) {
    alert('GOT ERROR: ' + error.message);
  });
}
