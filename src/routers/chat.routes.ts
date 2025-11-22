import express, { Router } from 'express';
import auth from '../middleware/auth'
import * as routes from '../controllers/chat.controller';
import { multerUploads } from '../helpers/multer';
const router: any = express.Router()

// Sends post request to find or create new dialogue
router.post('/dialogue/find-or-create', auth, routes.findOrCreateDialogue)

// Sends post request to create a new group
router.post('/group/create', auth, multerUploads, routes.createGroup)

// Sends get request to get a group
router.get('/room/get', auth, routes.getGroup)

// Sends get request to get all rooms
router.get('/room/get-all', auth, routes.getRooms)

// Sends get request to get all messages
router.get('/room/get-messages', auth, routes.getMessages)

// Sends post request to set block status
router.post('/room/set-block-status', auth, routes.setBlockGroup)

// send post request to add a group member
router.post('/group/add-member', auth, routes.addGroupMember)

// Sends delete request to delete a group
router.delete('/room/delete', auth, routes.deleteGroup)

// Sends post request to create and upload the users profile avatar
// router.post('/avatar/upload', auth, multerUploads, routes.saveUserImage)

export default router