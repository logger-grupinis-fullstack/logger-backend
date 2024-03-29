const User = require("../models/userModel.js")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    })
}

class UserService {
    async registerUser(firstName, email, password){
        if (!firstName || !email || !password){
            throw new Error('Please fill all fields')
        }

        const userExists = await User.findOne({ email });

        if (userExists){
            throw new Error("User already exists");
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            firstName,
            email,
            password: hashedPassword,
        })

        return {
            _id: user.id,
            firstName: user.firstName,
            email: user.email,
            token: generateToken(user._id),
            role: user.role,
        }
    }

    async loginUser(email, password){
        const user = await User.findOne({ email });

        if(!user){
            throw new Error("User not found")
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid){
            throw new Error("Invalid credentials")
        }

        return {
            _id: user.id,
            firstName: user.firstName,
            email: user.email,
            token: generateToken(user._id),
        }
    }

    async logoutUser(userId){
        return { message: "Logged out sucessfully"}
    }
}

module.exports = new UserService()