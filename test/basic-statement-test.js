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
      it('Single statement success', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        const helper = newPromiseHelper(db);

        helper.executeStatement('SELECT UPPER(?) as upperText', ['Test string']).then((rs) => {
          expect(rs).to.be.ok();
          expect(rs.rows).to.be.ok();
          expect(rs.rows.length).to.be(1);
          const item = rs.rows.item(0);
          expect(item).to.be.ok();
          expect(item.upperText).to.be('TEST STRING');
          done();
        }, (error) => {
          expect().fail('unexpected error with message: ' + error.message);
          done();
        });
      });

      it('Single statement syntax error', function(done) {
        const db = openDatabase('test.db', '1.0', 'Test', 1);

        const helper = newPromiseHelper(db);

        helper.executeStatement('SLCT 1').then((rs) => {
          expect().fail('Unexpected success');
          done();
        }, (error) => {
          expect(error).to.be.ok();
          expect(error.message).to.be.ok();
          done();
        });
      });

    });
  }
});
