import express from 'express';
import {getAllUsers,createNewUser,updateUser,deleteUser,getSingleUser} from '../../controllers/CRUD/usersController.js'; // Use .js extension

const router = express.Router();

router.route('/')
    .get(getAllUsers)
    .post(createNewUser)
    .patch(updateUser)
    .delete(deleteUser);

router.route('/:id')
    .get(getSingleUser);

export default router;
