const {
    respondFailed,
    respondSuccess,
    throwError, respondSuccessWithData
} = require("../../managers/responseManager");
const {PrimaryUserModel, TemporaryUserModel} = require("../../models/userModels");
const {initOTP, getJWT, verifyOTP} = require("../../helpers/authHelper");
const {getGreeting} = require("../../managers/timeManager");




  
/**
 * 1st return parameter -> user
 * 2nd return parameter -> failed (code)
 * 3rd return parameter -> error
 * */
const userLogin = async (num, res, callback, session = false) => {
    try {
        if (!num) {
            callback(null);
            return respondFailed(res, "000");
        }

        if (num.length !== 10) {
            callback(null);
            return respondFailed(res, "001");
        }

        const user = await PrimaryUserModel.findOne({num});
        if (!user) {
            callback(null);
            return respondFailed(res, "102");
        }

        if (session) {
            callback(null);
            if (user.completed === false) {
                return respondFailed(res, "201");
            }

            // if ((user.role === 0 || user.role === 3) && user.completed === true) {
            if ((user.role === 0 || user.role === 4)) {
                return respondFailed(res, "202");
            }
        }

        if (user.role === 5) {
            callback(null);
            return respondFailed(res, "203");
        }

        callback(user.toObject());

    } catch (err) {
        callback(null);
        return throwError(res, err);
    }
}

const login = async (req, res) => {
    let {num, otp} = req.body;

    await userLogin(num, res, async (user) => {
        try {
            if (!user) return;
            if (!otp) {
                await initOTP(num)
                return respondSuccess(res);
            }

            await verifyOTP(num, otp, (code) => {
                if (code) {
                    return respondFailed(res, code);
                }

                respondSuccessWithData(res, {token: getJWT(num),id:user._id});
            })


        } catch (err) {
            throwError(res, err);
        }
    });

}

const sessionLogin = (req, res) => {
    let data = {
        fName: req.user.fName,
        lName: req.user.lName,
        greeting: getGreeting(),
        role: req.user.role,
        num: req.user.num,
        dp: req.user.dp,
        id:req.user._id
    }
    respondSuccessWithData(res, data)
}

module.exports = {
    userLogin, login, sessionLogin
}
