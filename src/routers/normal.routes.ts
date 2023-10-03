import express, { Router } from 'express';
import { frontendLocation, host, siteName, emailAddress as adminEmail } from '../_env';

const sitePackage = {
  adminEmail, frontendLocation, siteName, host,
  description: `The backend side of ${siteName}`,
}

const router: Router = express.Router()

router.get('/', async (req, res) => {
  res.render('index', {
    ...sitePackage
  })
})

export default router