

# Library 

## POST: /api/library/book
Upload a Epub file/book for the user

- * multipart form data
- Body Fields
- name: <epub file>
- *(if not logged in) user: user's username

## GET: /api/library/book/:id
Get certain pages of a book

- Params
- id: the id of the book
- Query
- page: the Xth page of the book
- limit: the number of pages starting from page X
- EX
- http://localhost:3000/api/library/book/62d427782c9ec7171afeba1d?page=0&limit=5

## GET: /api/library/
Get the all the books (library) of a user
Query
-*(if not logged in) user: for which you want to get the library of

