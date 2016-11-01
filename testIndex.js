import {batchHelper} from './index.js';

let db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

let helper = batchHelper(db, step2, function(e) { alert('BATCH ERROR: ' + message); });

helper.executeStatement('DROP TABLE IF EXISTS tt');
helper.executeStatement('CREATE TABLE tt(a,b)');
helper.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
helper.commit();

function step2() {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
      alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));
    });
  }, function(error) {
    alert('step 2 error: ' + error.message);
  });
}
