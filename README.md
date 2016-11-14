# Web SQL batch helper

Specify Web or Cordova SQL batch in multiple steps. Useful with libraries like Oboe.js.

**LICENSE:** ISC, MIT, or Apache 2.0

## Sample usage

### Normal CommonJS

```js
var batchHelper = require('web-sql-batch-helper').batchHelper;

var db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

var helper = batchHelper(db, step2, function(e) { alert('BATCH ERROR: ' + message); });

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

or with sqlite plugin:

```js
var batchHelper = require('web-sql-batch-helper').batchHelper;

var db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

var helper = batchHelper(db, step2, function(e) { alert('BATCH ERROR: ' + message); });

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

### ES6

```js
import {batchHelper} from 'web-sql-batch-helper';

const db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

const helper = batchHelper(db, step2, function(e) { alert('BATCH ERROR: ' + message); });

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

Then assemble the bundle using a tool such as RollupJS or JSPM.

**GENERAL NOTE:** Use of `const` and `let` may not work with some older browsers and devices. Possible solutions include:
- Just use `var` instead.
- Use a tool like BabelJS (commonly used with JSPM, RollupJS, WebPack, etc.)
