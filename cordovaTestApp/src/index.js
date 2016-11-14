import {batchHelper} from '../../dist/index.es6.js';

document.addEventListener('deviceready', doTest);

function doTest() {
  let db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

  let helper = batchHelper(db, step2, function(e) { alert('BATCH ERROR: ' + message); });

  helper.executeStatement('DROP TABLE IF EXISTS tt');
  helper.executeStatement('CREATE TABLE tt(a,b)');
  helper.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
  helper.commit();

  function step2() {
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
        navigator.notification.alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));
      });
    }, function(error) {
      navigator.notification.alert('step 2 error: ' + error.message);
    });
  }
}
