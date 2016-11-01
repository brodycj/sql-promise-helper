# Web SQL batch helper

Specify Web or Cordova SQL batch in multiple steps. Useful with libraries like Oboe.js.

**LICENSE:** ISC or MIT

## Sample usage

From test:

```js
import {batchHelper} from 'web-sql-batch-helper';

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
```

**NOTE:** This library is distributed as an ES6 module. It is **recommended** to use a tool such as RollupJS or JSPM to build JavaScript that would work in a browser or Cordova app.
