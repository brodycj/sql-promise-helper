# Web SQL promise helper

Promise-based Web SQL interface. Specify Web or Cordova SQL batch in multiple steps (useful with libraries like Oboe.js).

**LICENSE:** ISC, MIT, or Apache 2.0

## Promise dependency

This module depends on the standard `Promise` object. Please use a polyfill if necessary.

## Sample usage

### Normal CommonJS

```js
var newPromiseHelper = require('sql-promise-helper').newPromiseHelper;

var db = window.openDatabase('test.db', '1.0', 'Test', 5*1024*1024);

var helper = newPromiseHelper(db);

var tx = helper.newBatchTransaction();
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
```

or with sqlite plugin:

```js
var newPromiseHelper = require('sql-promise-helper').newPromiseHelper;

var db = window.sqlitePlugin.openDatabase({name: 'test.db', location: 'default'});

var helper = newPromiseHelper(db);

var tx = helper.newBatchTransaction();
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
```

### ES6

```js
import {newPromiseHelper} from 'sql-promise-helper';

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
```

Then assemble the bundle using a tool such as RollupJS or JSPM.

**GENERAL NOTE:** Use of `const` and `let` may not work with some older browsers and devices. Possible solutions include:
- Just use `var` instead.
- Use a tool like BabelJS (commonly used with JSPM, RollupJS, WebPack, etc.)

## FUTURE TBD

- Full sqlBatch call with Promise-based API
- Read-only API functions
