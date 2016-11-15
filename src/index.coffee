executeBatch = (db, statements, onsuccess, onerror) ->
  if !!db.sqlBatch
    db.sqlBatch statements, onsuccess, onerror
  else
    db.transaction (tx) ->
      for st in statements
        if st.constructor is Array
          tx.executeSql st[0], st[1]
        else
          tx.executeSql st
    , onerror, onsuccess
  return

newBatchTransaction = (db) ->
  # local state (null if not valid):
  statements = []

  # return batch tx object:
  {
    executeStatement: (sql, values) ->
      if !statements
        throw new Error 'Invalid state'

      if !!values
        statements.push [sql, values]
      else
        statements.push sql
      return

    abort: ->
      if !statements
        throw new Error 'Invalid state'

      statements = null
      return

    commit: ->
      if !statements
        throw new Error 'Invalid state'

      mystatements = statements
      statements = null

      # return promise object:
      new Promise (resolve, reject) ->
        executeBatch db, mystatements, resolve, reject
        return
  }

export newBatchHelper = (db) ->
  # Batch helper object:
  {
    newBatchTransaction: -> newBatchTransaction db
  }
