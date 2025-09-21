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
messageRouter.route('/:chatId').get(verifyJWT, getMessages);
messageRouter.route('/mark/:id').put(verifyJWT, markMessagesAsSeen);
messageRouter.route('/sent').post(verifyJWT, sendMessage);

export default messageRouter;