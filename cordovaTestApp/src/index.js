import {newPromiseHelper} from '../../dist/index.es6.js';

document.addEventListener('deviceready', doTest);

function doTest() {
  const alert = navigator.notification.alert;

  basicAbortTest().then(function() {
    return basicSuccessTest();
  }).then(function() {
    alert('Test OK');
  }).then(null, function(error) {
    alert('ERROR: ' + error.message);
  });
}

function basicAbortTest() {
  const db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

  const helper = newPromiseHelper(db);

  const tx = helper.newBatchTransaction();
  tx.executeStatement('DROP TABLE IF EXISTS tt');
  tx.executeStatement('CREATE TABLE tt(a,b)');

  return tx.abort();
}

function basicSuccessTest() {
  const db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

  const helper = newPromiseHelper(db);

  const tx = helper.newBatchTransaction();
  tx.executeStatement('DROP TABLE IF EXISTS tt');
  tx.executeStatement('CREATE TABLE tt(a,b)');
  tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);

  return tx.commit().then(function() {
    return helper.executeStatement('SELECT * FROM tt', null);

  }).then(function(rs) {
    if (rs.rows.length !== 1)
      return Promise.reject(new Error('INCORRECT RESULT ROWS LENGTH: ' + rs.rows.length));

    if (rs.rows.item(0).a !== 101 || rs.rows.item(0).b !== 'Alice')
      return Promise.reject(new Error('INCORRECT RESULT ROW ITEM: ' + JSON.stringify(rs.rows.item(0))));

    return Promise.resolve();

  }).then(null, function(error) {
    return Promise.reject(error);
  });
}
