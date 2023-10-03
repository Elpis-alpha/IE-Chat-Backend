// Import Statements
import './middleware/init';
import './db/mongoose';
import './oauth/googlePassport';
import hbs from 'hbs';
import path from 'path';
import express, { Express } from 'express';
import dotenv from 'dotenv';
import chalk from 'chalk';
import delay from './middleware/delay';
import _404Router from './routers/404.routes';
import oauthRouter from './oauth/oauth.routes';
import normalRouter from './routers/normal.routes';
import userRouter from './routers/user.routes';
import chatRouter from './routers/chat.routes';
import corsConfig from './middleware/corsConfig';
import { format } from 'date-fns';
import { cloudinaryConfig } from './helpers/cloudinary';
import passport from 'passport';
import expressSess from './middleware/expressSess';

dotenv.config();
// Acquires the port on which the application runs
const port = process.env.PORT

// Reterieves the application production status
const isProduction = process.env.IS_PRODUCTION === 'true'

// Acquire an instance of Express
const app: Express = express();

// Automatically allow incomming incoming cors
app.use(corsConfig)

// Obtain the public path
const publicPath = path.join(__dirname, '../public')

// Obtain the views path
const viewsPath = path.join(__dirname, '../template/views')

// Obtain the partials path
const partialsPath = path.join(__dirname, '../template/partials')

// Sets the view engine to HBS
app.set('view engine', 'hbs')

// Automatically serve view hbs files
app.set('views', viewsPath)

// Automatically serve partials as hbs files
hbs.registerPartials(partialsPath)

// Automatically serve public (static) files
app.use(express.static(publicPath))

// Automatically parse incoming requests and 20mb limit
app.use(express.json({ limit: "50mb" }))

// Automatically parse form body and encodes
app.use(express.urlencoded({ extended: true }))

// One second delay for local development
if (!isProduction) { app.use(delay) }

// cloudinary setup
app.use(cloudinaryConfig);

// Express session for passport
app.use(expressSess)

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

// Automatically allows normal routes
app.use(normalRouter)

// Automatically allows user routes
app.use("/api/user", userRouter)

// Automatically allows chat routes
app.use("/api/chat", chatRouter)

// Automatically allows oauth routes
app.use("/api/oauth", oauthRouter)

// Automatically allows 404 routes
app.use(_404Router)

// Listening Server
app.listen(port, () => {
  console.log(chalk.hex('#009e00')(`Server started successfully on port ${port}`));
  console.log(chalk.cyanBright(`Server time: ${format(new Date(), "d/MM/yyyy - hh:mmaaa")}`));
})