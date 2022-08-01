

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

## GET: /api/library/book/:id/cover
Returns a Img file: cover image for specified book




\
\
\
\
\
\


# Sharing Books

## POST: /api/sharedbooks/share
share a book from 1 user to another

- Body Fields
  - **bookId:** bookId 
  - **sharer:** user's username *(if not logged in)
  - **sharee:** username of user to who you wish to share to
 
## GET:  /api/sharedbooks
Get the all the books shared to the user
- Query
    - **user:** for which you want to get shared books *(if not logged in)


\
\
\
\
\


# Book Posts
## interface (BookPost):
> { \
>    _id: string \
>    bookName: string \
>    numberOfOwners: number \
> }


## GET: /api/bookpost/
Get bookpostings

 
## POST: /api/bookpost/create
Create a new bookposting

- Body
    - **bookName:** name of the book for this posting

## POST: /api/bookpost/:id/incrmentReaders
Create a new bookposting

- Params
    - **id:** id of book post to increment



