const express = require("express");
const { registerStudent, loginStudent,upload, changeUserPassword, deleteUser, updateUser } = require("./controllers/userController");
const { validateToken } = require("../middlewares/authMiddleware");
const { addPost, uploadPost, deletePost, updatePost, viewFeed, likeButton } = require("./controllers/postContoller");
const { followButton} = require("./controllers/followerController");

const router = express.Router();

router.post("/register",upload.single("profilePhoto"),registerStudent);
router.post("/login",loginStudent);
router.post("/changePassword",validateToken,changeUserPassword);
router.delete("/delete",validateToken,deleteUser);
router.put("/update",validateToken,upload.single("profilePhoto"),updateUser);

router.post("/post/add",validateToken,uploadPost.single("post"),addPost);
router.delete("/post/delete/:postID",validateToken,deletePost);
router.put("/post/update/:postID",validateToken,updatePost);

router.get("/post/viewFeed",validateToken,viewFeed);
router.get("/post/likeButton/:postID",validateToken,likeButton);

router.put("/followButton/:fID",validateToken,followButton);
// router.get("/unfollow/:toUnfollowID",validateToken,unfollowOne);

router.get("/testing",validateToken);

module.exports = router;
