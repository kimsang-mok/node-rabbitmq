import express from "express";
import userController from "./user.controller";

const router = express.Router();

router.route("/").post(userController.createUser);
router.route("/delay").post(userController.createUserWith5sDelay);
router.route("/dynamic-delay").post(userController.createUserWithDynamicDelay);

export default router;
