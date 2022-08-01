import { Server, Socket } from "socket.io";
import logger from './middlewares/logging'

const NAMESPACE = "SOCKET"
const EVENTS = {
  connection: "connection",
  CLIENT: {
    ENTER_BOOK_ROOM: "ENTER BOOK ROOM",
    SEND_ROOM_MESSAGE: "SEND_ROOM_MESSAGE",
    JOIN_ROOM: "JOIN_ROOM",
    UPDATED_HIGHLIGHTS: "UPDATED_HIGHLIGHTS"
  },
  SERVER: {
    ROOMS: "ROOMS",
    JOINED_ROOM: "JOINED_ROOM",
    ROOM_MESSAGE: "ROOM_MESSAGE",
    NEW_HIGHLIGHTS: "NEW_HIGHLIGHTS"
  },
};

// Maps book to the number of Reading the book
const bookRoom: Record<string, Array<string>> = {};

function socket({ io }: { io: Server }) {
  logger.info(NAMESPACE, `Sockets enabled`);

  io.on("connection", (socket: Socket) => {
    logger.info(NAMESPACE, `User connected ${socket.id}`);

    // When a user enters a Book
    socket.on(EVENTS.CLIENT.ENTER_BOOK_ROOM, (bookId, user) => {
      console.log({bookId});

      // If book room is empty, initialize new arr, otherwise, push user into room
      if (bookRoom[bookId])
        bookRoom[bookId].push(socket.id);
      else
        bookRoom[bookId] = [socket.id]
        

      socket.join(bookId);

      socket.to(bookId).emit(EVENTS.SERVER.JOINED_ROOM, {
        socketId : socket.id,
        user: user
      });

      // // broadcast an event saying there is a new room
      // socket.broadcast.emit(EVENTS.SERVER.ROOMS, rooms);

      // // emit back to the room creator with all the rooms
      // socket.emit(EVENTS.SERVER.ROOMS, rooms);
      // // emit event back the room creator saying they have joined a room
      // socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });

    /*
     * When a user sends a room message
     */

    // socket.on(
    //   EVENTS.CLIENT.SEND_ROOM_MESSAGE,
    //   ({ roomId, message, username }) => {
    //     const date = new Date();

    //     socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
    //       message,
    //       username,
    //       time: `${date.getHours()}:${date.getMinutes()}`,
    //     });
    //   }
    // );

    /*
     * When a user joins a room
     */
    socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
      socket.join(roomId);

      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
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