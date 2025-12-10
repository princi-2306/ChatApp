import { Router } from 'express';
import {
    getUserForSidebar,
    getMessages,
    markMessagesAsSeen,
    sendMessage,
    editMessage,
    reactToMessage,
    getEditHistory
} from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const messageRouter = Router();

// Existing routes
messageRouter.route('/user').get(verifyJWT, getUserForSidebar);
messageRouter.route('/:chatId').get(verifyJWT, getMessages);
messageRouter.route('/mark/:id').put(verifyJWT, markMessagesAsSeen);
messageRouter.route('/sent').post(verifyJWT, upload.array('files', 10), sendMessage);

// NEW: Edit message route
messageRouter.route('/edit/:messageId').put(verifyJWT, editMessage);

// NEW: React to message route
messageRouter.route('/react/:messageId').post(verifyJWT, reactToMessage);

// NEW: Get edit history route
messageRouter.route('/history/:messageId').get(verifyJWT, getEditHistory);

export default messageRouter;