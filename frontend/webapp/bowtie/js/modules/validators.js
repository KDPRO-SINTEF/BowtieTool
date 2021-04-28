/**
 * Error messages
 * Missing = user didn't fill the field in question
 * Invalid = the field value doesn't match the established rules
 * Incorrect = the field value is wrong compared to the real/expected one
 *
 * @type {string}
 */

const MissingUsernameErr = 'Username is required.';
const MissingEmailErr = 'Email is required.';
const MissingPasswordErr = 'Password is required.';
const MissingPasswordConfirmErr = 'Confirm your password.';
const MissingTotpErr = '6-digit code is required.';

const InvalidUsernameErr = 'Invalid username.';
const InvalidEmailErr = 'Invalid email.';
const InvalidPasswordErr = 'This password is too weak.';
const InvalidPasswordConfirmErr = 'Typed passwords don\'t match.';
const InvalidTotpErr = MissingTotpErr;

const IncorrectPasswordErr = 'Incorrect password.';
export const IncorrectCredentialsErr = 'Incorrect credentials provided.';
const IncorrectTotpErr = 'Incorrect 6-digit code.';

export const isEmpty = function(field) {
    return (field.value === '');
}

export const isMissing = function(field) {
    return (field.error === 'missing');
}

export const isInvalid = function(field) {
    return (field.error === 'invalid');
}

export const isIncorrect = function(field) {
    return (field.error === 'incorrect');
}

const validEmail = function(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return (re.test(email));
}

const validPassword = function(password) {
    if (password.length < 9) {
        return false;
    } else {
        const reLowerLetters = /[a-z]+/;
        const reUpperLetters = /[A-Z]+/;
        const reDigits = /[0-9]+/;
        const reSpecialChars = /[()[\]{}|\\`~!@#$%^&*_\-+=;:\'\",<>./?]+/;
        return (reLowerLetters.test(password) && reUpperLetters.test(password) && reDigits.test(password) && reSpecialChars.test(password));
    }
}

const validTotp = function(totp) {
    const re = /[0-9]{6}/;
    return (totp.length === 6 && re.test(totp));
}

const validPasswordConfirm = function(password, passwordConfirm) {
    return (password === passwordConfirm);
}

export const validField = function (fieldType, value, value_2 = '') {
    if (fieldType === 'email') {
        return validEmail(value);
    } else if (fieldType === 'password') {
        return validPassword(value);
    } else if (fieldType === 'passwordConfirm')
        return validPasswordConfirm(value, value_2);
    else if (fieldType === 'totp') {
        return validTotp(value);
    } else if (fieldType === 'username') {
        return true;
    }
    return false;
}

export const inError = function(field) {
    return (field.error !== '' && field.value === '');
}

export const credentialsInError = function(emailField, passwordField) {
    return (emailField.error === 'credentials' && passwordField.error === 'credentials');
}

export const getErrorMessage = function (field, fieldType) {
    switch(fieldType) {
        case 'username':
            return chooseErrorMessage(field, MissingUsernameErr, InvalidUsernameErr);
            break;
        case 'email':
            return chooseErrorMessage(field, MissingEmailErr , InvalidEmailErr);
            break;
        case 'password':
            return chooseErrorMessage(field, MissingPasswordErr, InvalidPasswordErr, IncorrectPasswordErr);
            break;
        case 'passwordConfirm':
            return chooseErrorMessage(field, MissingPasswordConfirmErr, InvalidPasswordConfirmErr);
            break;
        case 'totp':
            return chooseErrorMessage(field, MissingTotpErr, InvalidTotpErr, IncorrectTotpErr);
            break;
    }
}

const chooseErrorMessage = function (field, missingMsg, invalidMsg, incorrectMsg = '') {
    if (isMissing(field)) {
        return missingMsg;
    } else if (isInvalid(field)) {
        return invalidMsg;
    } else if (isIncorrect(field)) {
        return incorrectMsg;
    }
    return '';
}
