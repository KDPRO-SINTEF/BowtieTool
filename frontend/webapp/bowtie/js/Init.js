// urlParams is null when used for embedding
window.urlParams = window.urlParams || {};
window.API_DOMAIN = window.API_DOMAIN || 'http://localhost:8000';

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
window.SEARCH_DIAGRAM = window.SEARCH_DIAGRAM || 'common/diagram_search.html';


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
window.LOGIN_PAGE = window.LOGIN_PAGE || '/app/bowtie/common/authentication#login';
window.REGISTER_PAGE = window.REGISTER_PAGE || '/app/bowtie/common/authentication#register';
window.RESET_PWD_PAGE = window.RESET_PWD_PAGE || '/app/bowtie/common/authentication#password-reset';
window.ACCOUNT_PAGE = window.ACCOUNT_PAGE || '/app/bowtie/common/my_account';
window.STATISTICS_PAGE = window.STATISTICS_PAGE || '/app/bowtie/common/statistics';

// Customer driven project specifics
window.LOGIN = window.LOGIN || window.API_DOMAIN + '/api/user/token';
window.USER_INFO = window.USER_INFO || window.API_DOMAIN + '/api/user/me';
window.REGISTER = window.REGISTER || window.API_DOMAIN + '/api/user/create';
window.PWD_RESET = window.PWD_RESET || window.API_DOMAIN + '/api/user/password/reset';
window.DELETE_ACCOUNT = window.DELETE_ACCOUNT || window.API_DOMAIN + '/api/user/delete';
window.CONFIRM_EMAIL = window.CONFIRM_EMAIL || window.API_DOMAIN + '/api/user/confirm';
window.CREATE_2FA_CODE = window.CREATE_2FA_CODE || window.API_DOMAIN + '/api/user/totp/create';
window.VALIDATE_2FA = window.VALIDATE_2FA || window.API_DOMAIN + '/api/user/totp/verify';
window.CHECK_2FA_STATUS = window.CHECK_2FA_STATUS || window.API_DOMAIN + '/api/user/test/totp';
window.LOGIN_2FA = window.LOGIN_2FA || window.API_DOMAIN + '/api/user/totp/login';
window.VERIFY_2FA_ENABLED = window.VERIFY_2FA_ENABLED || window.API_DOMAIN + '/api/user/totp/verify';
window.DISABLE_2FA = window.DISABLE_2FA || window.API_DOMAIN + '/api/user/totp/disable';
window.UPDATE_PASSWORD = window.UPDATE_PASSWORD || window.API_DOMAIN + '/api/user/password/update';

//URL for statistics
window.STATISTICS = window.STATISTICS || window.API_DOMAIN + '/api/diagram/stats';

// URLs for diagram save & get from backend
window.SAVE_URL = window.SAVE_URL || window.API_DOMAIN + '/api/diagram/private';
window.UPDATE_URL = window.UPDATE_URL || window.API_DOMAIN + '/api/diagram/'; // {id}
window.PUBLIC_DIAGS_URL = window.PUBLIC_DIAGS_URL || window.API_DOMAIN + '/api/diagram/public/list';
window.PRIVATE_DIAGS_URL = window.PRIVATE_DIAGS_URL || window.API_DOMAIN + '/api/diagram/private/list';

//URL to share diagrams
window.SHARE_DIAGRAM = window.SHARE_DIAGRAM || window.API_DOMAIN + '/api/diagram/share/'; // + {graphid}


/* window.REGISTER_FORM = window.REGISTER_FORM || 'register_old.html';
window.ROLE_URL = window.ROLE_URL || '/role';
window.USER_GRAPHS = window.USER_GRAPHS || '/user/graph';
window.SAVE_URL = window.SAVE_URL || '/graph';
window.TEMPLATE_GRAPHS = window.TEMPLATE_GRAPHS || '/template/graph';*/
