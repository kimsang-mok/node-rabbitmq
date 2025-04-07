import express from "express";

import homeController from "./home.controller";

const router = express.Router();

router.route("/say-hello").get(homeController.sayHello);

export default router;
