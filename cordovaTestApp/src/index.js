import {newBatchHelper} from '../../dist/index.es6.js';

document.addEventListener('deviceready', doTest);

function doTest() {
  const db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

  const helper = newBatchHelper(db);

  const tx = helper.newBatchTransaction();
  tx.executeStatement('DROP TABLE IF EXISTS tt');
  tx.executeStatement('CREATE TABLE tt(a,b)');
  tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
  tx.commit().then(function() {
    db.transaction(function(tx) {
      tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
        navigator.notification.alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));
      });
    }, function(error) {
      navigator.notification.alert('step 2 error: ' + error.message);
    });
  });
}
