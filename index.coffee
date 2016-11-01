export batchHelper = (db, onsuccess, onerror) ->
  # local state (null if not valid):
  statements = []

  return {
    executeStatement: (sql, values) ->
      if !statements
        throw new Error 'Invalid state'

      if (!!values)
        statements.push [sql, values]
      else
        statements.push sql

    abort: () ->
      if !statements
        throw new Error 'Invalid state'

      statements = null
      onerror new Error 'Aborted'

    commit: () ->
      if !statements
        throw new Error 'Invalid state'

      if (!!db.sqlBatch)
        db.sqlBatch statements, onsuccess, onerror
      else
        db.transaction (tx) ->
          for st in statements
            if st.constructor is Array
              tx.executeSql st[0], st[1]
            else
              tx.executeSql st
        , onerror, onsuccess
    }
