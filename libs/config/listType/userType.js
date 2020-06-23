const underscore = require('underscore');

let type = {
    status: {
        available: 'available',
        disabled: 'disabled',
        deleted: 'deleted',
    },
    gender: {
        male: 'male',
        female: 'female',
    }
};

const userType = {
    'CONST_STATUS_AVAILABLE': type.status.available,
    'CONST_STATUS_DISABLED': type.status.disabled,
    'CONST_STATUS_DELETED': type.status.deleted,
    'CONST_GENDER_MALE': type.gender.male,
    'CONST_GENDER_FEMALE': type.gender.female,
    'listStatus': [
        {
            code: type.status.available,
            name: "Hoạt động"
        },
        {
            code: type.status.disabled,
            name: "Dừng hoạt động"
        },
        {
            code: type.status.deleted,
            name: "Đã xóa"
        },
    ],
    'listGender': [
        {
            code: type.gender.male,
            name: "Nam"
        },
        {
            code: type.gender.female,
            name: "Nữ"
        }
    ],
    existStatus: (arrStatus) => {
        let listStatusCode = underscore.pluck(userType.listStatus, 'code');
        let result = true;
        underscore.each(arrStatus, (item, key) => {
            if(listStatusCode.indexOf(item) == -1){
                result = false;
            }
        });
        return result;
    },
    existGender: (arrGender) => {
        let listGenderCode = underscore.pluck(userType.listGender, 'code');
        let result = true;
        underscore.each(arrGender, (item, key) => {
            if(listGenderCode.indexOf(item) == -1){
                result = false;
            }
        });
        return result;
    }
}

module.exports = userType;