const controller = require('./controller');
const moment = require('moment');
const lodash = require('lodash');
const userType = require('../libs/config/listType/userType');

module.exports = class userCtrl extends controller {
    constructor(ctx) {
        super(ctx);
        // this.ctx = ctx;
    }

    /**
     * Lay danh sach user
     */
    async listUser() {
        try {
            let listUser = await this.model.users.findAll({ plain: true });
            this.ctx.body = listUser.get();
        } catch (error) {
            console.log(error);
        }

    }

    /**
     * Thuc hien them moi user
     */
    async insertUser() {

        //validate
        let validate = await this.validate(this.getBody(), {
            'account': 'required',
            'password': 'required|min:6|max:30',
            'name': 'required',
            'email': 'required|email',
            'phone': 'required|phone',
            'gender': 'required|userGender',
        }, {
                'account.required': 'account không được bỏ trống',
                'name.required': 'name không được bỏ trống',
                'email.required': 'email không được bỏ trống',
                'phone.required': 'phone không được bỏ trống',
                'email.email': 'email không đúng định dạng',
                'gender.required': 'gender không được bỏ trống',
                'gender.userGender': 'gender không đúng định dạng',
                'password.required': 'password không được bỏ trống',
                'password.min': 'password không được nhỏ hơn 6 ký tự',
                'password.max': 'password không được quá 30 ký tự',
                'phone.phone': 'phone không đúng định dạng',
            });

        if (validate.fails()) {
            this.response(validate.messages(), 422);
            return false;
        }
        try {
            //thuc hien insert
            let newUser = await this.model.users.create({
                'account': this.getInput('account'),
                'password': this.myFunc.makehash(this.getInput('password')),
                'name': this.getInput('name'),
                'email': this.getInput('email'),
                'phone': this.getInput('phone'),
                'avatar': null,
                'status': userType.CONST_STATUS_AVAILABLE,
                'createdAt': moment().format('YYYY-MM-DD HH:hh:ss'),
                'updatedAt': moment().format('YYYY-MM-DD HH:hh:ss'),
            });

            this.response({ status: true, id: newUser.id });

        } catch (error) {
            this.response({ status: false }, 422);
        }
    }

    /**
     * Thuc hien cap nhat user
     * @param {*} id 
     */
    async updateUser(id) {

        //validate
        let validate = await this.validate(lodash.merge({ id: id }, this.getBody()), {
            'id': 'required|exists:users,id',
            'name': 'required',
            'gender': 'required|userGender',
            'email': 'required|email',
            'phone': 'required|numeric',
        }, {
                'id.required': 'id không được bỏ trống',
                'id.exists': 'id không tồn tại',
                'gender.required': 'gender không được bỏ trống',
                'gender.userGender': 'gender không đúng định dạng',
                'email.required': 'gender không được bỏ trống',
                'email.email': 'email không đúng định dạng',
                'phone.required': 'phone không được bỏ trống',
                'phone.numeric': 'phone không đúng định dạng',
            });

        if (validate.fails()) {
            console.log(validate.messages());
            this.response(validate.messages(), 422);
            return false;
        }
        try {
            //thuc hien insert
            let userInfo = this.modal.users.findOne({
                where: { id: id }
            });
            userInfo.name = this.getInput('name');
            userInfo.gender = this.getInput('gender');
            userInfo.email = this.getInput('email');
            userInfo.phone = this.getInput('phone');

            await userInfo.save();
            this.response({ status: true });

        } catch (error) {
            this.response({ status: false }, 422);
        }
    }

    /**
     * Thuc hien xoa user
     * @param {*} id 
     */
    async deleteUser(id) {
        //validate
        let validate = await this.validate({ id: id }, {
            'id': 'required|exists:users,id',
        }, {
                'id.required': 'id không được bỏ trống',
                'id.exists': 'id không tồn tại'
            });

        if (validate.fails()) {
            this.response(validate.messages(), 422);
            return false;
        }
        //thuc hien xoa
        try {
            let userInfo = this.modal.users.findOne({
                where: { id: id }
            });
            await userInfo.destroy();
            this.response({ status: true });
        } catch (error) {
            this.response(error, 422);
        }
    }
}