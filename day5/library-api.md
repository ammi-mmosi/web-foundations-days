# Library Books REST API

This document describes a REST API for managing the books in a library.

The main resource is `/books`.

## 1. List All Books

- **Method:** GET
- **Path:** `/books`
- **Description:** Returns a list of all books in the library.
- **Request Body:** None
- **Success Status Code:** `200 OK`

Example request:

`GET /books`

## 2. Get One Book

- **Method:** GET
- **Path:** `/books/{id}`
- **Description:** Returns one book using its unique ID.
- **Request Body:** None
- **Success Status Code:** `200 OK`

Example request:

`GET /books/42`

## 3. Create a Book

- **Method:** POST
- **Path:** `/books`
- **Description:** Creates a new book in the library.
- **Success Status Code:** `201 Created`
- **Example Request Body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958
}
```

## 4. Update a Book

- **Method:** PUT
- **Path:** `/books/{id}`
- **Description:** Updates an existing book using its unique ID.
- **Success Status Code:** `200 OK`
- **Example Request Body:**

```json
{
  "title": "Things Fall Apart",
  "author": "Chinua Achebe",
  "year": 1958
}
```

Example request:

`PUT /books/42`

## 5. Delete a Book

- **Method:** DELETE
- **Path:** `/books/{id}`
- **Description:** Deletes a book using its unique ID.
- **Request Body:** None
- **Success Status Code:** `204 No Content`

Example request:

`DELETE /books/42`

## 6. List Books by Author

- **Method:** GET
- **Path:** `/books?author={author}`
- **Description:** Returns books written by a specific author using the `author` query parameter.
- **Request Body:** None
- **Success Status Code:** `200 OK`

Example request:

`GET /books?author=Chinua%20Achebe`

This request returns books written by Chinua Achebe.

# Error Codes

## 400 Bad Request

- **Status Code:** `400 Bad Request`
- **Meaning:** The request contains invalid or incomplete data.
- **Example:** A user attempts to create a book without providing a title.

Example invalid request body:

```json
{
  "author": "Chinua Achebe",
  "year": 1958
}
```

The server could respond with `400 Bad Request` because the required title is missing.

## 404 Not Found

- **Status Code:** `404 Not Found`
- **Meaning:** The requested resource could not be found.
- **Example:** A user requests a book ID that does not exist.

Example:

`GET /books/9999`

If book 9999 does not exist, the server responds with `404 Not Found`.