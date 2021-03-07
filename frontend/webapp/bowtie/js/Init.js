// urlParams is null when used for embedding
window.urlParams = window.urlParams || {};

// Base path of the web app
window.BASE_PATH = '/app/bowtie'

// Public global variables
window.MAX_REQUEST_SIZE = window.MAX_REQUEST_SIZE  || 10485760;
window.MAX_AREA = window.MAX_AREA || 15000 * 15000;

// URLs for save and export
window.EXPORT_URL = window.EXPORT_URL || '/export';
window.LOCAL_SAVE_URL = window.LOCAL_SAVE_URL || '/save';
window.OPEN_URL = window.OPEN_URL || '/open';
window.RESOURCES_PATH = window.RESOURCES_PATH || 'resources';
window.RESOURCE_BASE = window.RESOURCE_BASE || window.RESOURCES_PATH + '/grapheditor';
window.STENCIL_PATH = window.STENCIL_PATH || 'stencils';
window.IMAGE_PATH = window.IMAGE_PATH || 'images';
window.STYLE_PATH = window.STYLE_PATH || 'styles';
window.CSS_PATH = window.CSS_PATH || 'styles';
window.OPEN_FORM = window.OPEN_FORM || 'common/open.html';
window.RISK_FORM = window.RISK_FORM || 'common/risk_computation.html';


// Sets the base path, the UI language via URL param and configures the
// supported languages to avoid 404s. The loading of all core language
// resources is disabled as all required resources are in grapheditor.
// properties. Note that in this example the loading of two resource
// files (the special bundle and the default bundle) is disabled to
// save a GET request. This requires that all resources be present in
// each properties file since only one file is loaded.
window.mxBasePath = window.mxBasePath || '../lib/mxgraph/src';
window.mxLanguage = window.mxLanguage || urlParams['lang'];
window.mxLanguages = window.mxLanguages || ['de'];

window.ROOT_PAGE = window.ROOT_PAGE || '/app/bowtie'
window.LOGIN_PAGE = window.LOGIN_PAGE || '/app/bowtie/common/authentication.html#login';
window.REGISTER_PAGE = window.REGISTER_PAGE || '/app/bowtie/common/authentication.html#register';
window.RESET_PWD_PAGE = window.RESET_PWD_PAGE || '/app/bowtie/common/authentication.html#password-reset';
window.ACCOUNT_PAGE = window.ACCOUNT_PAGE || '/app/bowtie/common/my_account.html';

// Customer driven project specifics
window.LOGIN = window.LOGIN || 'http://localhost:8000/api/user/token/';
window.USER_INFO = window.USER_INFO || 'http://localhost:8000/api/user/me/';
window.REGISTER = window.REGISTER || 'http://localhost:8000/api/user/create/';
window.PWD_RESET = window.PWD_RESET || 'http://localhost:8000/api/user/reset/';
window.DELETE_ACCOUNT = window.DELETE_ACCOUNT || 'http://localhost:8000/api/user/delete/';
window.CONFIRM_EMAIL = window.CONFIRM_EMAIL || 'http://localhost:8000/api/user/confirm/';
window.CREATE_2FA_CODE = window.CREATE_2FA_CODE || 'http://localhost:8000/api/user/totp/create/';
window.VALIDATE_2FA = window.VALIDATE_2FA || 'http://localhost:8000/api/user/totp/verify/';

/* window.REGISTER_FORM = window.REGISTER_FORM || 'register_old.html';
window.ROLE_URL = window.ROLE_URL || '/role';
window.USER_GRAPHS = window.USER_GRAPHS || '/user/graph';
window.SAVE_URL = window.SAVE_URL || '/graph';
window.TEMPLATE_GRAPHS = window.TEMPLATE_GRAPHS || '/template/graph';*/