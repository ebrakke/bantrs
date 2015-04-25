'use strict';

var UserModel = require('../models/UserModel');
var AuthCtrl = require('./AuthCtrl');
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var e = require('./errors');
var Q = require('q');
var Validator = require('../validate');


/* UserCtrl Constructor */
var UserCtrl = function () {}


 /* Create a new user
 * Input: userData = {username, password, email}
 * Return: User object with username, email, uid, authToken
 */
UserCtrl.create = function(userData, callback) {
    var d = Q.defer();
    var user = new UserModel(userData);

    /* Validate user creation fields */
    var validationFailed = Validator.user(user);
    if (validationFailed) {
        e.invalidUserData.msg = validationFailed;
        d.reject(e.invalidUserData, null);
        return d.promise;
    }

    // Hash the password and forget it
    user.password = bcrypt.hashSync(user.password, 8);
    /* Send the request to create the user */
    user.create()
    .then(function() {
        delete user.password;
        user._auth = makeAuth(user._uid);
        user.createAuthToken()
        .then(function() {
            d.resolve(user);
        })
        .fail(function(err) {
            d.reject(err);
        })
    })
    .fail(function(err) {
        d.reject(err);
    });
    return d.promise;
}

/* Update user
	 @param {string[]} newInfo - new username, pw, email
*/
UserCtrl.update = function(user, newInfo) {
    var d = Q.defer();
    user.username = newInfo.username ? newInfo.username : user.username;
    user.password = newInfo.password ? newInfo.password : null;
    user.email = newInfo.email ? newInfo.email : user.email;

    /* Validate user update fields */
    var validationFailed = Validator.user(user);
    if (validationFailed) {
        e.invalidUserData.msg = validationFailed;
        d.reject(e.invalidUserData, null);
        return d.promise;
    }

    user.password = user.password ? bcrypt.hashSync(user.password, 8): null;
    user.update()
    .then(function() {
        if(user.password) { // They changed there password, update the auth token
            delete user.password;
            user._auth = makeAuth(user._uid);
            user.updateAuth()
            .then(function() {
                d.resolve();
            })
            .fail(function(err) {
                d.reject(err);
            });
        } else {
            delete user.password;
            d.resolve();
        }
    })
    .fail(function(err) {
        d.reject(err);
    });
    return d.promise;
}

UserCtrl.getRoomObjects = function(username) {
    var d = Q.defer();
    UserModel.getByUsername(username)
    .then(function(user) {
        user.getRooms()
        .then(function() {
            user.getRoomObjects()
            .then(function(roomObjs) {
                d.resolve(roomObjs);
            })
            .fail(function(err) {
                d.reject(err);
            })
        })
        .fail(function(err) {
            d.reject(err)
        })
    })
    .fail(function(err) {
        d.reject(err);
    })
    return d.promise;
}

/* Get a user by username*/
UserCtrl.getByUsername = function(username) {
    var d = Q.defer();
    UserModel.getByUsername(username)
    .then(function(user) {
        user.getRooms()
        .then(function() {
            d.resolve(user);
        })
        .fail(function(err) {
            d.reject(err)
        });
    })
    .fail(function(err) {
        d.reject(err);
    });
    return d.promise;
}

/* Get a user by id */
UserCtrl.getById = function(id) {
    var d = Q.defer();
    UserModel.getById(id)
    .then(function(user) {
        user.getRooms()
        .then(function() {
            d.resolve(user);
        })
        .fail(function(err) {
            d.reject(err);
        });
    })
    .fail(function(err) {
        d.reject(err);
    });
    return d.promise;
}

UserCtrl.delete = function(user) {
    var d = Q.defer();
    user.delete()
    .then(function() {
        d.resolve();
    })
    .fail(function(err) {
        d.reject(err);
    })
    return d.promise;
}

var makeAuth = function(id) {
    return crypto.createHash('sha1').update(id).update(Math.random().toString(32)).digest('hex');
}

module.exports = UserCtrl;
