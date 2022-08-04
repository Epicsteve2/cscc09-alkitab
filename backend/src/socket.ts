import { Server, Socket } from "socket.io";
import logger from './middlewares/logging'

const NAMESPACE = "SOCKET"
const EVENTS = {
  connection: "connection",
  CLIENT: {
    ENTER_BOOK_ROOM: "ENTER BOOK ROOM",
    UPDATED_HIGHLIGHTS: "UPDATED_HIGHLIGHTS"
  },
  SERVER: {
    NEW_HIGHLIGHTS: "NEW_HIGHLIGHTS"
  },
};

// Maps book to readers
const bookRoom: Record<string, Array<string>> = {};

// Maps reader to book
const whichBook: Record<string, string> = {};

function socket({ io }: { io: Server }) {
  logger.info(NAMESPACE, `Sockets enabled`);

  io.on("connection", (socket: Socket) => {
    logger.info(NAMESPACE, `User connected ${socket.id}`);

    // When a user enters a Book
    socket.on(EVENTS.CLIENT.ENTER_BOOK_ROOM, (bookId) => {

      // If book room is empty, initialize new arr, otherwise, push user into room
      if (bookRoom[bookId])
        bookRoom[bookId].push(socket.id);
      else
        bookRoom[bookId] = [socket.id]
        

      socket.join(bookId);
      whichBook[socket.id] = bookId;

    });

    socket.on('disconnect', () => {
      logger.info(NAMESPACE, `User ${socket.id} left`);
      const bookId = whichBook[socket.id];
      if (bookId){
        socket.leave(bookId);
        const index = bookRoom[bookId].indexOf(socket.id);
        bookRoom[bookId].splice(index, 1)

      }
    });


    /*
     * When sends pageHighlight Updates
     */
    socket.on(EVENTS.CLIENT.UPDATED_HIGHLIGHTS, (bookId, page, pageHighlights) => {
      logger.info(NAMESPACE, `book: ${bookId} recived update on page: ${page}`);

      socket.to(bookId).emit(EVENTS.SERVER.NEW_HIGHLIGHTS, {
        page: page,
        pageHighlights: pageHighlights
      });
    });

  });


}

export default socket;