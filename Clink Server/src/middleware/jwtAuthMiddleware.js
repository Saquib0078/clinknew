const jwt = require('jsonwebtoken');
const {
    respondDeclared,
    MISSING_PARAMETERS_MSG,
    throwError,
    respondFailed, respondSuccess
} = require("../managers/responseManager");
const {userLogin} = require("../auth/user/userLogin");

const verifyJwt = async (req, res, next, session = true) => {
    let token = req.headers.authorization;

    if (!token) {
        return respondDeclared(res, MISSING_PARAMETERS_MSG);
    }
    
    token = req.headers.authorization.replace("Bearer ", "");

    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const verified = jwt.verify(token, jwtSecretKey);
        if (!verified) {
            return respondFailed(res, "302")
        }

        await userLogin(verified.num, res, (user) => {
            if (!user) {
                return;
            }
            req.user = user;
            req.user.isAdmin = req.user.role === 2 || req.user.role === 3;
            req.user.isSuperAdmin = req.user.role === 3;
            next();
        }, session);

    } catch (e) {
        if (e.message === "jwt expired") {
            return respondFailed(res, "302");
        }
        throwError(res, e);
    }
}

const verifyJwtUnSession = async (req, res, next) => {
    await verifyJwt(req, res, next, false);
}

module.exports = {
    verifyJwt, verifyJwtUnSession
}