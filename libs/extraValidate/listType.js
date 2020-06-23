const userType = require('../config/listType/userType');

module.exports = {
    userStatus: async (value) => {
        return userType.existStatus([value]);
    },
    userGender: async (value) => {
        return userType.existGender([value]);
    },
}