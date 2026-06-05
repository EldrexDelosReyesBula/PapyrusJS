# Unified DB API

This module details the unified database engine driver supporting sync and async database endpoints.

---

## DB Initializer

Instantiates a transaction-safe persistent dataset connection.

### Default Engine Selection
```javascript
// Configure default engine globally (defaults to 'local')
papyr.db.use('sqlite');

// Collection will now automatically use the default engine
const store = papyr.db(collectionName);
```

### Signature
```javascript
const store = papyr.db(collectionName, engine)
```

### Parameters
* `collectionName` (String): Namespace identifier.
* `engine` (String): Storage provider endpoint override. Supported values:
  * `'local'` (Default): Persistent LocalStorage wrapper (Synchronous).
  * `'session'`: Tab-bounded SessionStorage wrapper (Synchronous).
  * `'indexeddb'`: Client asynchronous Object Store (Asynchronous).
  * `'sqlite'`: Relational SQL client driver (SQL.js or WebSQL cordova plugin) (Asynchronous).
  * `'supabase'`: Remote Supabase database (requires `registerSupabase`) (Asynchronous).
  * `'firebase'`: Remote Firestore database (requires `registerFirebase`) (Asynchronous).
  * `'postgres'` / `'mysql'` / `'mongodb'`: Modular relational/document backend gateways (Asynchronous).


---

## Available CRUD Operations

The DB client returns identical API signatures across all engines. Operations support both synchronous properties (cached in state) and direct asynchronous promises.

### Query and Read Methods

* **`list()` / `listAsync()`**: Fetch all documents in the collection:
  ```javascript
  // Synchronous (retrieved from reactive cache state)
  let records = store.list();
  
  // Asynchronous (direct database query)
  let records = await store.listAsync();
  ```
* **`find(id)` / `findAsync(id)`**: Locate a document by its unique ID:
  ```javascript
  let record = store.find("k8s9x2");
  let record = await store.findAsync("k8s9x2");
  ```
* **`query(options)` / `queryAsync(options)`**: Executes queries with filters, sorting parameters, offsets, and limits:
  ```javascript
  let results = await store.queryAsync({
      filter: { role: 'admin', active: true },
      sort: { field: 'createdAt', direction: 'desc' },
      limit: 10,
      offset: 0
  });
  ```
  * Note: `filter` can also accept a custom callback function: `filter: (item) => item.age > 18`.

### Write Methods

* **`insert(item)` / `insertAsync(item)`**: Inserts a new document. Generates a unique Base36 ID and a `createdAt` timestamp automatically:
  ```javascript
  let newRecord = await store.insertAsync({ name: "Alice", email: "alice@example.com" });
  console.log(newRecord.id); // Base36 string id
  ```
* **`update(id, data)` / `updateAsync(id, data)`**: Merges changes into an existing document and adds/updates an `updatedAt` timestamp:
  ```javascript
  await store.updateAsync("k8s9x2", { active: false });
  ```
* **`delete(id)` / `deleteAsync(id)`**: Purges a record from the store:
  ```javascript
  await store.deleteAsync("k8s9x2");
  ```
* **`clear()` / `clearAsync()`**: Completely resets the database collection:
  ```javascript
  await store.clearAsync();
  ```

---

## Reactive DB Watchers

Observe changes across the database collection:

```javascript
let store = papyr.db("settings", "indexeddb");

// Triggers immediately with initial list, and on write modifications
const unsubscribe = store.watch((currentItems) => {
    console.log("Database updated! Total items:", currentItems.length);
});

// Call returned function to unsubscribe
unsubscribe();
```

---

## Register Custom Drivers

You can register custom database engines:

```javascript
// Register a custom in-memory mock engine
papyr.db.registerDriver("mock", (collectionName) => {
    let mockStore = [];
    return {
        getAsync: async () => mockStore,
        insertAsync: async (item) => { mockStore.push(item); },
        updateAsync: async (id, data) => {
            mockStore = mockStore.map(item => item.id === id ? { ...item, ...data } : item);
        },
        deleteAsync: async (id) => {
            mockStore = mockStore.filter(item => item.id !== id);
        },
        clearAsync: async () => { mockStore = []; }
    };
});

// Instantiate using custom identifier
const testStore = papyr.db("test_collection", "mock");
```
