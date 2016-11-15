import {newBatchHelper} from '../../dist/index.es6.js';

const db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

const helper = newBatchHelper(db);

const tx = helper.newBatchTransaction();
tx.executeStatement('DROP TABLE IF EXISTS tt');
tx.executeStatement('CREATE TABLE tt(a,b)');
tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
tx.commit().then(() => {
  db.transaction((tx) => {
    tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
      alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));
    });
  }, (error) => {
    alert('step 2 error: ' + error.message);
  });
}, (error) => {
  alert('BATCH ERROR: ' + error.message);
});
