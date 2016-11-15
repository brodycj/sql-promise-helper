const expect = require('expect.js');

const openDatabase = require('../node_modules/websql/lib/index.js');
const cordovaTestwrapper = require('../test/cordova-test-wrapper.js');

const batchHelper = require('../dist/index.cjs.js').batchHelper;

const implLabels = ['Web SQL API', 'Cordova plugin API'];

describe('Basic', function() {
  const openTestDatabase = openDatabase;

  for (var i=0; i<implLabels.length; ++i) {
    const openDatabase = (i === 0) ? openTestDatabase : (name, ignored1, ignored2, ignored3) => {
      return cordovaTestwrapper(openTestDatabase(name, '1.0', 'Test', 1));
    }

    describe(implLabels[i], function() {
      it('Batch helper success (TBD test timing)', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        const helper = batchHelper(db, onsuccess, function(error) {
          expect().fail('Unexpected batch failure with error message: ' + error.message);
          done();
        });

        helper.executeStatement('DROP TABLE IF EXISTS tt');
        helper.executeStatement('CREATE TABLE tt(a,b)');
        helper.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
        helper.commit();

        function onsuccess() {
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
        }
      });

      it('Batch helper error (TBD test timing)', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        // Pre-cleanup in separate transaction:
        db.transaction(function(tx) {
          tx.executeSql('DROP TABLE IF EXISTS tt');
        }, function(error) {
          expect().fail('Unexpected pre-cleanup error: ' + error.message);
          done();
        });

        const helper = batchHelper(db, function() {
          expect().fail('Unexpected batch success');
          done();
        }, onerror);

        helper.executeStatement('CREATE TABLE tt(a,b)');
        // syntax error:
        helper.executeStatement('INSRT INTO tt (?,?) VALUES', [101, 'Alice']);
        helper.commit();

        // EXPECTED RESULT:
        function onerror(error) {
          expect(error).to.be.ok();
          expect(error.message).to.be.ok();

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
        }
      });

      it('Batch helper abort (TBD test timing)', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        // Pre-cleanup in separate transaction:
        db.transaction(function(tx) {
          tx.executeSql('DROP TABLE IF EXISTS tt');
        }, function(error) {
          expect().fail('Unexpected pre-cleanup error: ' + error.message);
          done();
        });

        const helper = batchHelper(db, function() {
          expect().fail('Unexpected batch success');
          done();
        }, onerror);

        helper.executeStatement('CREATE TABLE tt(a,b)');
        helper.executeStatement('INSERT INTO tt VALUES(?,?)', [101, 'Alice']);
        helper.abort();

        // EXPECTED RESULT:
        function onerror(error) {
          expect(error).to.be.ok();
          expect(error.message).to.be('Aborted');

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
        }
      });

    });
  }
});
