import {newPromiseHelper} from '../../dist/index.es6.js';

const db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

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
