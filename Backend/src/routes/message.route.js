import { Router } from 'express';
import {
    getUserForSidebar,
    getMessages,
    markMessagesAsSeen,
    sendMessage
} from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const messageRouter = Router();

messageRouter.route('/user').get(verifyJWT, getUserForSidebar);
messageRouter.route('/:id').get(verifyJWT, getMessages);
messageRouter.route('mark/:id').put(verifyJWT, markMessagesAsSeen);
messageRouter.route('/send/:id').post(verifyJWT, sendMessage);

export default messageRouter;