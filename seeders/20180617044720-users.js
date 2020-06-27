'use strict';
const myFunc = require("../libs/myFunc");
const moment = require("moment");

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.bulkInsert('users', [{
            account: 'admin',
            password: myFunc.makehash('123456'),
            name: 'Trần Đức Quang',
            email: 'quangtd@newtel.vn',
            avatar: null,
            isAdmin: true,
            status: "AVAILABLE",
            createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
            updatedAt: moment().format('YYYY-MM-DD HH:mm:ss')
          }], {});
    },

    down: (queryInterface, Sequelize) => {
        let Op = Sequelize.Op;
        return queryInterface.bulkDelete('users', {
            'account': 'admin'
        }, {});
    }
};
