import express, { Router } from 'express';
import auth from '../middleware/auth'
import * as routes from '../controllers/user.controller';
import { multerUploads } from '../helpers/multer';
const router: any = express.Router()

// Sends post request to create new user
router.post('/create', routes.createUser)

// Sends post request to check user google token
router.post('/check-google', routes.checkGoogleToken)

// sends patch request to edit auth user
router.patch('/edit', auth, routes.editUser)

// Sends post request to log user in
router.post('/login', routes.loginUser)

// Sends post request to log user out
router.post('/logout', auth, routes.logoutUser)

// sends get request to fetch auth user
router.get('/get', auth, routes.getUser)

// sends get request to find a user
router.get('/find', routes.findUser)

// sends get request to filter users
router.get('/filter', routes.filterUser)

// Sends post request to create and upload the users profile avatar
router.post('/avatar/upload', auth, multerUploads, routes.saveUserImage)

// Sends delete request to delete the users profile avatar
router.delete('/avatar/remove', auth, routes.removeUserImage)

export default router