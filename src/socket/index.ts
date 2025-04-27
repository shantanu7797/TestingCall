// import cookie from "cookie";
// import User from "../database/model/User";
// import { Namespace, Socket } from "socket.io";
// import { ChatEventEnum } from "../constants";
// import { Server } from "http";
// import { Application, Request } from "express";
// import { BadTokenError } from "../core/ApiError";
// import JWT from "../core/JWT";
// import userRepo from "../database/repositories/userRepo";
// import colorsUtils from "../helpers/colorsUtils";
// import { Types } from "mongoose";

// declare module "socket.io" {
//   interface Socket {
//     user?: User;
//   }
// }

// // handles the join chat event ie; when a user join a room
// const mountJoinChatEvent = (socket: Socket): void => {
//   socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
//     colorsUtils.log("info", "user joined a chat room. chatId: " + chatId);
//     socket.join(chatId); // join the user to a chat between or group chat
//   });
// };

// // handle the start Typing event
// const mountStartTypingEvent = (socket: Socket): void => {
//   socket.on(ChatEventEnum.START_TYPING_EVENT, (chatId: string) => {
//     socket.in(chatId).emit(ChatEventEnum.START_TYPING_EVENT, chatId);
//   });
// };

// // handle the stop Typing event
// const mountStopTypingEvent = (socket: Socket): void => {
//   socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
//     socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
//   });
// };

// // function to initialize the socket io
// const initSocketIo = (io: any): void => {
//   io.on("connection", async (socket: Socket) => {
//     try {
//       // get the token from the cookies or the handshake auth header
//       const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
//       let token = cookies?.accessToken || socket.handshake.auth?.token;

//       console.log("Socket connection attempt with token:", token);

//       // throw an error if the token is not found
//       if (!token) {
//         throw new BadTokenError("Token not found");
//       }

//       // decode the token
//       const decodedToken = await JWT.validateToken(token);

//       // get user info
//       const userId = new Types.ObjectId(decodedToken.sub);
//       const user = await userRepo.findById(userId);

//       if (!user) {
//         throw new BadTokenError("Invalid token");
//       }

//       socket.user = user;
//       socket.join(user._id.toString());
//       socket.emit(ChatEventEnum.CONNECTED_EVENT);
//       colorsUtils.log(
//         "info",
//         "🤝 User connected. userId: " + user._id.toString()
//       );

//       mountJoinChatEvent(socket);
//       mountStartTypingEvent(socket);
//       mountStopTypingEvent(socket);

//       // disconnect event
//       socket.on(ChatEventEnum.DISCONNECTED_EVENT, () => {
//         if (socket.user?._id) {
//           socket.leave(socket.user._id.toString());
//         }
//       });
//     } catch (error) {
//       socket.emit(
//         ChatEventEnum.SOCKET_ERROR_EVENT,
//         "something went wrong while connecting to socket"
//       );
//     }
//   });
// };

// const emitSocketEvent = (
//   req: Request,
//   roomId: string,
//   event: ChatEventEnum,
//   payload: any
// ): void => {
//   const io = req.app.get("io") as Namespace;
//   io.in(roomId).emit(event, payload);
// };

// export { initSocketIo, emitSocketEvent };









import cookie from "cookie";
import User from "../database/model/User";
import { Namespace, Socket } from "socket.io";
import { ChatEventEnum } from "../constants";
import { Request } from "express";
import { BadTokenError } from "../core/ApiError";
import JWT from "../core/JWT";
import userRepo from "../database/repositories/userRepo";
import colorsUtils from "../helpers/colorsUtils";
import { Types } from "mongoose";

declare module "socket.io" {
  interface Socket {
    user?: User;
  }
}

// --- Chat Events ---
const mountJoinChatEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
    colorsUtils.log("info", "user joined a chat room. chatId: " + chatId);
    socket.join(chatId);
  });
};

const mountStartTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.START_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.START_TYPING_EVENT, chatId);
  });
};

const mountStopTypingEvent = (socket: Socket): void => {
  socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
    socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
  });
};

// --- WebRTC Events ---
// const mountWebRTCEvents = (io: any, socket: Socket): void => {
//   // Offer from caller
//   socket.on("call-user", ({ to, offer }) => {
//     io.to(to).emit("call-made", {
//       from: socket.user?._id.toString(),
//       offer,
//     });
//   });

//   // Answer from callee
//   socket.on("make-answer", ({ to, answer }) => {
//     io.to(to).emit("answer-made", {
//       from: socket.user?._id.toString(),
//       answer,
//     });
//   });

//   // ICE Candidate from either party
//   socket.on("ice-candidate", ({ to, candidate }) => {
//     io.to(to).emit("ice-candidate", {
//       from: socket.user?._id.toString(),
//       candidate,
//     });
//   });

//   // End call
//   socket.on("end-call", ({ to }) => {
//     io.to(to).emit("call-ended", {
//       from: socket.user?._id.toString(),
//     });
//   });
// };
// --- WebRTC Events ---
const mountWebRTCEvents = (io: any, socket: Socket): void => {
  // 1️⃣ Frontend emits "newOffer"
  socket.on("newOffer", ({ newOffer, sendToUserId }) => {
    console.log(`🔔 newOffer from ${socket.user?._id} → ${sendToUserId}`);
    io.to(sendToUserId).emit("newOfferAwaiting", {
      offer: newOffer,
      offererUserId: socket.user?._id.toString(),
    });
  });

  // 2️⃣ Frontend emits "newAnswer"
  socket.on("newAnswer", ({ answer, offererUserId }) => {
    console.log(`🔔 newAnswer from ${socket.user?._id} → ${offererUserId}`);
    io.to(offererUserId).emit("answerResponse", answer);
  });

  // 3️⃣ Frontend emits "sendIceCandidateToSignalingServer"
  socket.on(
    "sendIceCandidateToSignalingServer",
    ({ iceCandidate, iceUserId }) => {
      console.log(`🔔 ICE from ${socket.user?._id} → ${iceUserId}`);
      io.to(iceUserId).emit("receivedIceCandidateFromServer", iceCandidate);
    }
  );
  

  // (Optional) you can still support the old events too:
  socket.on("call-user", ({ to, offer }) => {
    io.to(to).emit("call-made", { from: socket.user?._id.toString(), offer });
  });
  socket.on("make-answer", ({ to, answer }) => {
    io.to(to).emit("answer-made", { from: socket.user?._id.toString(), answer });
  });
  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.user?._id.toString(), candidate });
  });
};


// --- Socket.IO Initialization ---
const initSocketIo = (io: any): void => {
  io.on("connection", async (socket: Socket) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers?.cookie || "");
      let token = cookies?.accessToken || socket.handshake.auth?.token;

      console.log("Socket connection attempt with token:", token);

      if (!token) {
        throw new BadTokenError("Token not found");
      }

      const decodedToken = await JWT.validateToken(token);
      const userId = new Types.ObjectId(decodedToken.sub);
      const user = await userRepo.findById(userId);

      if (!user) {
        throw new BadTokenError("Invalid token");
      }

      socket.user = user;
      socket.join(user._id.toString());
      socket.emit(ChatEventEnum.CONNECTED_EVENT);

      colorsUtils.log("info", "🤝 User connected. userId: " + user._id.toString());

      // Mount all event handlers
      mountJoinChatEvent(socket);
      mountStartTypingEvent(socket);
      mountStopTypingEvent(socket);
      mountWebRTCEvents(io, socket); // NEW

      // Handle disconnection
      socket.on(ChatEventEnum.DISCONNECTED_EVENT, () => {
        if (socket.user?._id) {
          socket.leave(socket.user._id.toString());
        }
      });
    } catch (error) {
      socket.emit(
        ChatEventEnum.SOCKET_ERROR_EVENT,
        "something went wrong while connecting to socket"
      );
    }
  });
};

// --- Utility to emit server-side events ---
const emitSocketEvent = (
  req: Request,
  roomId: string,
  event: ChatEventEnum,
  payload: any
): void => {
  const io = req.app.get("io") as Namespace;
  io.in(roomId).emit(event, payload);
};

export { initSocketIo, emitSocketEvent };
