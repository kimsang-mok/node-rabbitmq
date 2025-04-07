import express from "express";
import homeRouter from "./src/modules/home/home.route";
import userRouter from "./src/modules/users/user.route";

const router = express.Router();

const routes = [
  {
    path: "/home",
    route: homeRouter,
  },
  {
    path: "/user",
    route: userRouter,
  },
];

// iterate over the defaultRoutes array and apply each route to the router
routes.forEach((each) => {
  router.use(each.path, each.route);
});

export default router;
