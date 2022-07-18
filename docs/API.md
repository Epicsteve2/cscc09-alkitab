

# Library 

## POST: /api/library/book
Upload a Epub file/book for the user

* multipart form data
- Body Fields
  - **book:** epub file of the book
  - **username:** user's username *(if not logged in)

## GET: /api/library/book/:id
Get certain pages of a book

- Params
  - **id:** the id of the book
- Query
  - **page:** the Xth page of the book
  - **limit:** the number of pages starting from page X
- EX
  - Get first 5 pages of the book
  - http://localhost:3000/api/library/book/62d427782c9ec7171afeba1d?page=0&limit=5

## GET: /api/library/
Get the all the books (library) of a user
- Query
    - **user:** for which you want to get the library of *(if not logged in)