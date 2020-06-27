'use strict';
const myFunc = require('../libs/myFunc');

module.exports = (sequelize, DataTypes) => {
    var Op = sequelize.Op;
    var users = sequelize.define('users', {
        account: DataTypes.STRING,
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        email: DataTypes.STRING,
        phone: DataTypes.STRING,
        avatar: DataTypes.STRING,
        isAdmin: DataTypes.BOOLEAN,
        status: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,

    }, {
            scopes: {
                filterName: (name) => {
                    if (!myFunc.isEmpty(name)) {
                        return {
                            where: {
                                name: { [Op.like]: '%' + name + '%' }
                            }
                        }
                    }

                    return {};
                },
                filterStatus: (status) => {
                    return {
                        where: {
                            status: status
                        }
                    }
                },
                filterAccount: (account) => {
                    return {
                        where: {
                            account: { [Op.eq]: account }
                        }
                    }
                },
                filterEmail: (email) => {
                    return {
                        where: {
                            email: email
                        }
                    }
                },
                filterPhone: (phone) => {
                    if (!myFunc.isEmpty(phone)) {
                        return {
                            where: {
                                phone: { [Op.like]: '%' + phone + '%' }
                            }
                        }
                    }

                    return {}
                },
                filterIsAdmin: () => {
                    return {
                        where: {
                            isAdmin: true
                        }
                    }
                }
            }
        });
    users.associate = function (models) {
        // associations can be defined here
    };
    return users;
};