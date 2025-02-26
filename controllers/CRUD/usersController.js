import {User} from '../../models/User.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';

// @desc Get all users
// @route Get /users
// @access Private 
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean();
    if (!users?.length) {
        return res.status(400).json({ message: 'No users found' });
    }
    res.json(users);
});

// @desc Create a user
// @route Post /users
// @access Private 
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Hash password
    const hashedPwd = await bcrypt.hash(password, 10);

    const userObject = { username, password: hashedPwd, email };

    try {
        // Create new user and store
        const user = await User.create(userObject);
        res.status(201).json({ message: `New user ${username} created` });
    } catch (error) {
        // Handle unique constraint violation error
        if (error.code === 11000 && error.keyPattern && error.keyPattern.ID) {
            return res.status(409).json({ message: 'Duplicate ID' });
        }
        res.status(400).json({ message: 'Invalid user data received' });
    }
});

// @desc Update a user
// @route Patch /users
// @access Private 
const updateUser = asyncHandler(async (req, res) => {
    const { _id, username, active, password, email } = req.body;

    if (!username || !_id) {
        return res.status(400).json({ message: 'ID and User Name Required' });
    }

    const user = await User.findOne({ _id }).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    const duplicate = await User.findOne({ _id }).lean().exec();
    if (duplicate && duplicate?._id.toString() !== _id) {
        return res.status(409).json({ message: 'Duplicate username' });
    }

    user.username = username;
    user.active = active;
    user.email = email;

    if (password) {
        user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.json({ message: `${updatedUser.username} updated` });
});

// @desc Delete a user
// @route DELETE /users
// @access Private 
const deleteUser = asyncHandler(async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    const user = await User.findOne({ _id }).exec();

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    await user.deleteOne();

    const reply = `Username ${user.username} with ID ${user._id} deleted`;

    res.json(reply);
});

// @desc Get a single user by ID
// @route GET /users/:userID
// @access Private 
const getSingleUser = asyncHandler(async (req, res) => {
    const { _id } = req.params;

    if (!_id) {
        return res.status(400).json({ message: 'User ID Required' });
    }

    try {
        const user = await User.findOne({ _id })
            .populate({
                path: 'timeTable',
                select: 'title subjects -_id'
            })
            .select('-password')
            .lean()
            .exec();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

export {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser,
    getSingleUser
};
