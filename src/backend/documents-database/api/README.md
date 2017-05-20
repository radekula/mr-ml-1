documents-database
==================

---

## Description

A service for storing and managing any type of documents.

---

## API description

---

### __GET http://{service_addr:port}/document/{document_id}__
Method for getting document data by id.

**Status codes:**

| HTTP code | Description |
|:---|:---|
| 200 | Document found |
| 404 | Document not found |
| 500 | Service error |

**Example result:**

```
{
  "id": string,
  "title": string,
  "file_name": string,
  "create_date": "YYYY-MM-DD HH:MM:SS",
  "description": string,
  "owner": [
    string
  ],
  "metadata": [
    {
      "name": string,
      "value": string
    }
  ],
  "thumbnail": base64,
  "data": base64
}
```

**Basic fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| id | Document id | T |
| title | Document title | T |
| file_name | Document's file name | F |
| create_date | Document's create date and time | T |
| description | Document's description | F |
| owner | Document's owners - array of owners IDs | F |
| metadata | Document's metadata values | F |
| thumbnail | Thumbnail of a document | F |
| data | Document's data | T |

**Methadata fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| name | Name of value | T |
| value | Value | F |

---

### __PUT http://{service_addr:port}/document__
Method for adding new document to database. Document data is send in request body.

**Status codes:**

| HTTP code | Description |
|:---|:---|
| 200 | Document added |
| 400 | Bad request - body is not compliant with schema |
| 500 | Service error |

**Example body:**
```
{
  "title": string,
  "file_name": string,
  "description": string,
  "owner": [
    string
  ],
  "metadata": [
    {
      "name": string,
      "value": string
    }
  ],
  "thumbnail": base64,
  "data": base64
}
```

**Basic fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| title | Document title | T |
| file_name | Document's file name | F |
| description | Document's description | F |
| owner | Document's owners - array of owners IDs | F |
| metadata | Document's metadata values | F |
| thumbnail | Thumbnail of a document | F |
| data | Document's data | T |

**Methadata fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| name | Name of value | T |
| value | Value | F |

**Return data:**

```
{
  "id": string
}
```

| Field | Description |
|:---|:---|
| id | New document id |

---

### __POST http://{service_addr:port}/document/{document_id}__
Method for update document in database.

**Status codes:**

| HTTP code | Description |
|:---|:---|
| 200 | Document updated |
| 404 | Document not found |
| 500 | Service error |

**Example Body:**

```
{
  "title": string,
  "file_name": string,
  "create_date": "YYYY-MM-DD HH:MM:SS",
  "description": string,
  "owner": [
    string
  ],
  "metadata": [
    {
      "name": string,
      "value": string
    }
  ],
  "thumbnail": base64,
  "data": base64
}
```

**Basic fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| title | Document title | T |
| file_name | Document's file name | F |
| create_date | Document's create date and time | T |
| description | Document's description | F |
| owner | Document's owners - array of owners IDs | F |
| metadata | Document's metadata values | F |
| thumbnail | Thumbnail of a document | F |
| data | Document's data | T |

**Methadata fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| name | Name of value | T |
| value | Value | F |

---

### __DELETE http://{service_addr:port}/document/{document_id}__
Method for removing document from database.

**Status codes:**

| HTTP code | Description |
|:---|:---|
| 200 | Document deleted |
| 404 | Document not found |
| 500 | Service error |

---

### __GET http://{service_addr:port}/documents{?params}__
Method for searching documents from database. This will return documents matching search criteria. Documents data is not returned.

**Status codes:**

| HTTP code | Description |
|:---|:---|
| 200 | Documents found |
| 404 | Documents not found |
| 500 | Service error |

**Example result:**

```
[
  {
    "id": string,
    "title": string,
    "file_name": string,
    "create_date": "YYYY-MM-DD HH:MM:SS",
    "description": string,
    "owner": [
      string
    ],
    "metadata": [
      {
        "name": string,
        "value": string
      }
    ],
    "thumbnail": base64
  }
]
```

**Basic fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| id | Document id | T |
| title | Document title | T |
| file_name | Document's file name | F |
| create_date | Document's create date and time | T |
| description | Document's description | F |
| owner | Document's owners - array of owners IDs | F |
| metadata | Document's metadata values | F |
| thumbnail | Thumbnail of a document | F |

**Methadata fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| name | Name of value | T |
| value | Value | F |


---

### POST http://{service_addr:port}/documents
Method for searching documents in database. This will return documents matching search criteria. Documents data is not returned.


**Status codes:**

| HTTP code | Description |
|:---|:---|
| 200 | Documents found |
| 404 | Documents not found |
| 500 | Service error |

**Example result:**

```
[
  {
    "id": string,
    "title": string,
    "file_name": string,
    "create_date": "YYYY-MM-DD HH:MM:SS",
    "description": string,
    "owner": [
      string
    ],
    "metadata": [
      {
        "name": string,
        "value": string
      }
    ],
    "thumbnail": base64
  }
]
```

**Basic fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| id | Document id | T |
| title | Document title | T |
| file_name | Document's file name | F |
| create_date | Document's create date and time | T |
| description | Document's description | F |
| owner | Document's owners - array of owners IDs | F |
| metadata | Document's metadata values | F |
| thumbnail | Thumbnail of a document | F |

**Methadata fields:**

| Field | Description | Not empty |
|:---|:---|:---|
| name | Name of value | T |
| value | Value | F |


