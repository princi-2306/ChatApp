import { Router } from 'express';
import {
    getUserForSidebar,
    getMessages,
    markMessagesAsSeen,
    sendMessage
} from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js'; // Import multer

const messageRouter = Router();

messageRouter.route('/user').get(verifyJWT, getUserForSidebar);
messageRouter.route('/:chatId').get(verifyJWT, getMessages);
messageRouter.route('/mark/:id').put(verifyJWT, markMessagesAsSeen);
// UPDATED: Add file upload middleware
messageRouter.route('/sent').post(verifyJWT, upload.array('files', 10), sendMessage); // Max 10 files

export default messageRouter;
