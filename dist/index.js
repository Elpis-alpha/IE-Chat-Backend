"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import Statements
require("./middleware/init");
require("./db/mongoose");
require("./oauth/googlePassport");
const hbs_1 = __importDefault(require("hbs"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const chalk_1 = __importDefault(require("chalk"));
const delay_1 = __importDefault(require("./middleware/delay"));
const _404_routes_1 = __importDefault(require("./routers/404.routes"));
const oauth_routes_1 = __importDefault(require("./oauth/oauth.routes"));
const normal_routes_1 = __importDefault(require("./routers/normal.routes"));
const user_routes_1 = __importDefault(require("./routers/user.routes"));
const chat_routes_1 = __importDefault(require("./routers/chat.routes"));
const corsConfig_1 = __importDefault(require("./middleware/corsConfig"));
const date_fns_1 = require("date-fns");
const cloudinary_1 = require("./helpers/cloudinary");
const passport_1 = __importDefault(require("passport"));
const expressSess_1 = __importDefault(require("./middleware/expressSess"));
dotenv_1.default.config();
// Acquires the port on which the application runs
const port = process.env.PORT;
// Reterieves the application production status
const isProduction = process.env.IS_PRODUCTION === 'true';
// Acquire an instance of Express
const app = (0, express_1.default)();
// Automatically allow incomming incoming cors
app.use(corsConfig_1.default);
// Obtain the public path
const publicPath = path_1.default.join(__dirname, '../public');
// Obtain the views path
const viewsPath = path_1.default.join(__dirname, '../template/views');
// Obtain the partials path
const partialsPath = path_1.default.join(__dirname, '../template/partials');
// Sets the view engine to HBS
app.set('view engine', 'hbs');
// Automatically serve view hbs files
app.set('views', viewsPath);
// Automatically serve partials as hbs files
hbs_1.default.registerPartials(partialsPath);
// Automatically serve public (static) files
app.use(express_1.default.static(publicPath));
// Automatically parse incoming requests and 20mb limit
app.use(express_1.default.json({ limit: "50mb" }));
// Automatically parse form body and encodes
app.use(express_1.default.urlencoded({ extended: true }));
// One second delay for local development
if (!isProduction) {
    app.use(delay_1.default);
}
// cloudinary setup
app.use(cloudinary_1.cloudinaryConfig);
// Express session for passport
app.use(expressSess_1.default);
// Setup passport
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Automatically allows normal routes
app.use(normal_routes_1.default);
// Automatically allows user routes
app.use("/api/user", user_routes_1.default);
// Automatically allows chat routes
app.use("/api/chat", chat_routes_1.default);
// Automatically allows oauth routes
app.use("/api/oauth", oauth_routes_1.default);
// Automatically allows 404 routes
app.use(_404_routes_1.default);
// Listening Server
app.listen(port, () => {
    console.log(chalk_1.default.hex('#009e00')(`Server started successfully on port ${port}`));
    console.log(chalk_1.default.cyanBright(`Server time: ${(0, date_fns_1.format)(new Date(), "d/MM/yyyy - hh:mmaaa")}`));
});
