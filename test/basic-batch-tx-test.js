const expect = require('expect.js');

const openDatabase = require('../node_modules/websql/lib/index.js');
const cordovaTestwrapper = require('../test/cordova-test-wrapper.js');

const newPromiseHelper = require('../dist/index.js').newPromiseHelper;

const implLabels = ['Web SQL API', 'Cordova plugin API'];

describe('Basic', function() {
  const openTestDatabase = openDatabase;

  for (var i=0; i<implLabels.length; ++i) {
    const openDatabase = (i === 0) ? openTestDatabase : (name, ignored1, ignored2, ignored3) => {
      return cordovaTestwrapper(openTestDatabase(name, '1.0', 'Test', 1));
    }

    describe(implLabels[i], function() {
      it('Batch helper tx success & check stored data', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        const helper = newPromiseHelper(db);

        var check1 = false, check2 = false;

        const tx = helper.newBatchTransaction();
        tx.executeStatement('DROP TABLE IF EXISTS tt');
        tx.executeStatement('CREATE TABLE tt(a,b)');
        tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
        tx.commit().then(() => {
          // EXPECTED RESULT:
          expect(check1).to.be.ok();
          check2 = true;

          db.readTransaction(function(tx) {
            tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
              expect(rs).to.be.ok();
              expect(rs.rows).to.be.ok();
              expect(rs.rows.length).to.be(1);
              expect(rs.rows.item).to.be.ok();
              const item = rs.rows.item(0);
              expect(item).to.be.ok();
              expect(item.a).to.be(101);
              expect(item.b).to.be('Alice');
              done();
            });
          }, function(error) {
            expect().fail('unexpected error with message: ' + error.message);
          });
        }, (error) => {
          expect().fail('unexpected error with message: ' + error.message);
        });

        expect(check2).not.to.be.ok();
        check1 = true;
      });

      it('Batch helper tx error & check for rollback', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        // Pre-cleanup in separate transaction:
        db.transaction(function(tx) {
          tx.executeSql('DROP TABLE IF EXISTS tt');
        }, function(error) {
          expect().fail('Unexpected pre-cleanup error: ' + error.message);
          done();
        });

        const helper = newPromiseHelper(db);

        var check1 = false, check2 = false;

        const tx = helper.newBatchTransaction();
        tx.executeStatement('CREATE TABLE tt(a,b)');
        // syntax error:
        tx.executeStatement('INSRT INTO tt (?,?) VALUES', [101, 'Alice']);
        tx.commit().then(() => {
          expect().fail('Unexpected batch tx success');
          done();
        }, (error) => {
          // EXPECTED RESULT:
          expect(check1).to.be.ok();
          expect(error).to.be.ok();
          expect(error.message).to.be.ok();
          check2 = true;

          db.readTransaction(function(tx) {
            tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
              // NOT EXPECTED:
              expect().fail('Unexpected result: table tt exists');
              done();
            });
          }, function(error) {
            // EXPECTED RESULT:
            expect(error).to.be.ok();
            expect(error.message).to.be.ok();
            done();
          });
        });

        expect(check2).not.to.be.ok();
        check1 = true;
      });

      it('Batch helper tx abort & check', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        // Pre-cleanup in separate transaction:
        db.transaction(function(tx) {
          tx.executeSql('DROP TABLE IF EXISTS tt');
        }, function(error) {
          expect().fail('Unexpected pre-cleanup error: ' + error.message);
          done();
        });

        const helper = newPromiseHelper(db);

        const tx = helper.newBatchTransaction();
        tx.executeStatement('CREATE TABLE tt(a,b)');
        tx.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
        tx.abort().then(() => {
          db.readTransaction(function(tx) {
            tx.executeSql('SELECT * FROM tt', null, function(ignored, rs) {
              // NOT EXPECTED:
              expect().fail('Unexpected result: table tt exists');
              done();
            });
          }, function(error) {
            // EXPECTED RESULT:
            expect(error).to.be.ok();
            expect(error.message).to.be.ok();
            done();
          });
        }, (error) => {
          // NOT EXPECTED:
          expect().fail('Unexpected abort failure');
          done();
        });
      });

      it('executeStatement/abort/commit after abort should throw', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        const helper = newPromiseHelper(db);

        const tx = helper.newBatchTransaction();
        tx.executeStatement('DROP TABLE IF EXISTS tt');
        tx.executeStatement('CREATE TABLE tt(a,b)');
        tx.abort();

        try {
          tx.executeStatement('SELECT 1');
          // should not get here:
          expect().fail('executeStatement after abort did not throw');
        } catch(ex) {
          expect(ex).to.be.ok();
          expect(ex.message).to.be('Invalid state');
        }

        try {
          tx.abort();
          // should not get here:
          expect().fail('abort after abort did not throw');
        } catch(ex) {
          expect(ex).to.be.ok();
          expect(ex.message).to.be('Invalid state');
        }

        try {
          tx.commit();
          // should not get here:
          expect().fail('commit after abort did not throw');
        } catch(ex) {
          expect(ex).to.be.ok();
          expect(ex.message).to.be('Invalid state');
        }

        done();
      });

      it('executeStatement/commit/abort after commit should throw', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        const helper = newPromiseHelper(db);

        var check1 = false;

        const tx = helper.newBatchTransaction();
        tx.executeStatement('DROP TABLE IF EXISTS tt');
        tx.executeStatement('CREATE TABLE tt(a,b)');
        tx.commit().then(() => {
          expect(check1).to.be.ok();
          done();
        });

        try {
          tx.executeStatement('SELECT 1');
          // should not get here:
          expect().fail('executeStatement after abort did not throw');
        } catch(ex) {
          expect(ex).to.be.ok();
          expect(ex.message).to.be('Invalid state');
        }

        try {
          tx.commit();
          // should not get here:
          expect().fail('commit after abort did not throw');
        } catch(ex) {
          expect(ex).to.be.ok();
          expect(ex.message).to.be('Invalid state');
        }

        try {
          tx.abort();
          // should not get here:
          expect().fail('abort after abort did not throw');
        } catch(ex) {
          expect(ex).to.be.ok();
          expect(ex.message).to.be('Invalid state');
        }

        check1 = true;
      });

    });
  }
});
