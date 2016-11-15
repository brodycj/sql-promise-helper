module.exports = function(db) {
  return {
    transaction: function(f, ok, error) {
      db.transaction(f, ok, error);
    },
    readTransaction: function(f, ok, error) {
      db.readTransaction(f, ok, error);
    },
    executeSql: function(sql, params, ok, error) {
      db.transaction(function(tx) {
        tx.executeSql(sql, params, function(ignored, rs) {
          ok(rs);
        });
      }, error);
    },
    sqlBatch: function(batch, ok, error) {
      db.transaction(function(tx) {
        for (var i=0; i<batch.length; ++i) {
          const e = batch[i];
          const hasParams = e instanceof Array;
          const sql = hasParams ? e[0] : e;
          const params = hasParams ? e[1] : null;
          tx.executeSql(sql, params);
        }
      }, error, ok);
    }
  }
}
