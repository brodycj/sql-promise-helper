# Web SQL batch helper

Specify Web or Cordova SQL batch in multiple steps. Useful with libraries like Oboe.js.

**LICENSE:** ISC, MIT, or Apache 2.0

## Sample usage

### Normal CommonJS

```js
var newBatchHelper = require('web-sql-batch-helper').newBatchHelper;

var db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

var helper = newBatchHelper(db);

var tx = helper.newBatchTransaction();
tx.executeStatement('DROP TABLE IF EXISTS tt');
tx.executeStatement('CREATE TABLE tt(a,b)');
tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
tx.commit().then(function() {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
      alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));
    });
  }, function(error) {
    alert('step 2 error: ' + error.message);
  });
});
```

or with sqlite plugin:

```js
var newBatchHelper = require('web-sql-batch-helper').newBatchHelper;

var db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

var helper = newBatchHelper(db);

var tx = helper.newBatchTransaction();
tx.executeStatement('DROP TABLE IF EXISTS tt');
tx.executeStatement('CREATE TABLE tt(a,b)');
tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
tx.commit().then(function() {
  db.transaction(function(tx) {
    tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
      alert('GOT RESULT LENGTH: ' + rs.rows.length + ' FIRST: ' + JSON.stringify(rs.rows.item(0)));
    });
  }, function(error) {
    alert('step 2 error: ' + error.message);
  });
});
```

### ES6

```js
import {newBatchHelper} from 'web-sql-batch-helper';

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
```

Then assemble the bundle using a tool such as RollupJS or JSPM.

**GENERAL NOTE:** Use of `const` and `let` may not work with some older browsers and devices. Possible solutions include:
- Just use `var` instead.
- Use a tool like BabelJS (commonly used with JSPM, RollupJS, WebPack, etc.)
