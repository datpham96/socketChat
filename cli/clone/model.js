'use strict';

module.exports = (sequelize, DataTypes) => {
    var Op = sequelize.Op;
    var table = sequelize.define('table', {


    }, {
            scopes: {

            }
        });
    table.associate = function (models) {
        // associations can be defined here
    };
    return table;
};