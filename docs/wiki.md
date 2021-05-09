# Bowtie++ wiki

Bowtie++ is a **Web application** supporting security and safety risk analysis using bowtie diagrams.

- [Bowtie++ wiki](#Bowtie++-wiki)
    - [Project's background](#Project%E2%80%99s-background)
    - [Requirements](#Requirements)
    - [Installation](#Installation)
        - [Development mode](#Development-mode)
        - [Deployment mode](#Deployment-mode)
    - [Installation on other types of processors](/uYcJUkHTRL2xvk34Hb4m9w)
        - [Example for the raspberry PI (AMR32)](#Example-for-the-raspberry-PI-(ARM32))
    - [Technical documentation](#Technical-documentation)
        - [Software architecture](#Software-architecture)
            - [test](#app-module)
        - [Frontend](#Frontend)
        - [Backend](#Backend)

## Project's background

Bowtie++ is an evolution of Bowtie+ which was mainly based on [grapheditor](#Licenses). Grapheditor is an implementation example of a diagram editor made with the mxgraph library. You'll find the official GitHub repository of mxGraph in the Licenses part of this wiki.

## Requirements

- x86 64-bit architectured processor, more installation details for other processor types [here](#Installation-on-other-types-of-processors).
- Docker engine and docker compose : installation guide on the official website https://docs.docker.com/
- A recent browser that supports javascript modules (please refer to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules for more information). **IE is not supported**.

**Windows users** may have to manually enable hardware virtualization in their BIOS settings to run docker containers.

## Installation

### Development mode

<span style="color: #dc3545">WARNING:</span> only for development puposes, DO NOT use this configuration as a deployment model.

```bash
git clone https://github.com/bmoulkaf/BowtieTool
cd BowtieTool
```

**Configuring the backend .env file**

The Django REST API requires an environment file located at `backend/app/app/.env`. This file contains sentivive data, such as secret keys. **Be sure to make it accessible only to authorized persons**. An example of a typical `.env` file is given at `backend/app/app/.env.example`.

If you need more information about how to fill in this file, check the [technical documentaion](#app-module).

**Configuring server ip addresses**

By default, both the frontend and backend are meant to run on your localhost. Here are the steps to run them on custom ip addresses.

Update the `.env` and set the ip adresses and ports on which your servers (frontend and backend) run:

```
STATIC_SERVER_HOST=localhost
STATIC_SERVER_PORT=8080
API_SERVER_HOST=localhost
API_SERVER_PORT=8000
```

Update the file `backend/app/app/settings.py` like this:

```python
# Add all of the servers form wich the requests will come
CORS_ORIGIN_WHITELIST = [
    'http://localhost:8080',
]
```

In `frontend/webapp/bowtie/js/env.js`, update the following variables to match the server ip on which the backend is installed and the port it listens to.

```javascript=2
const API_SERVER_HOST = 'localhost';
const API_SERVER_PORT = '8000';
```

You're now ready to launch the application.

**Launch Bowtie++**

You can either launch the whole app or just the frontend or backend part of Bowtie++. You can use the `start.sh` script to do that. At the root of the project:

```bash
./start.sh                # Launch the whole app
./start.sh frontend       # Launch the frontend
./start.sh backend        # Launch the backend
```

The script simply uses the `docker-compose up` command to launch the containers.

**Stop bowtie++**

You can stop the app with the `stop.sh` script. At the root of the project:

```bash
./stop.sh                # Stop the whole app launched with ./start.sh
./stop.sh frontend       # Stop the frontend launched with ./start.sh frontend
./stop.sh backend        # Stop the backend launched with ./start.backend
```

The script simply uses `docker container kill` to stop the containers.

### Deployment mode



## Installation on other types of processors

Base docker images used for Bowtie++ have their equivalent for other types of processor architecture. You can find them on the official docker pages for each images.
- https://hub.docker.com/_/python/
- https://hub.docker.com/_/nginx/
- https://hub.docker.com/_/postgres

### Example for the raspberry PI (ARM32)

**Update the Dockerfiles**

All given path are relative to the `app` directory in the project root folder.

`frontend/Dockerfile`
```dockerfile=
FROM arm32v7/nginx:stable-alpine
```

`backend/Dockerfile`
```dockerfile=
FROM arm32v7/python:3.7-alpine
```

**Update the docker-compose.yml files**

`backend/docker-compose.yml`
```yaml=16
  db:
    image: arm32v7/postgres:10-alpine
```

`docker-compose.yml`
```yaml=30
  db:
    image: arm32v7/postgres:10-alpine
```

## Technical documentation

### Software architecture

Bowtie++ is composed of two main parts:

- The frontend: a set of static HTML, CSS and Javascript files
- The backend: A REST API communicating with an SQL database

The following image represents the software architecture of the application.

![](https://i.imgur.com/CsTOhUD.png)


### Frontend

As mentionned previoulsy, [grapheditor](#Licenses) is the foundation of Bowtie++. Grapheditor is a complex application mainly made with javascript to build the diagram editor (no real HTML file that describes the UI), which makes it hard to get into, maintain and upgrade.

Bowtie++ wrap the diagram editor into an SPA (*Single Page Application*)  to speed up the navigation between main pages and be able to save the state of the editor (current diagram), wtihout having to reload it every time the user come back editing.

**Vuejs** has been the choosen framework to build Bowtie++ because it can be incrementally (and easily) integrated to an existing Web application. Vue-router and Vuex has been added to make Bowtie++ behave as an SPA.

**Display layout**

A Vue component defines the home page and contains the diagram editor thanks to an `<iframe>` html tag. This component is always displayed so that the state of the editor is saved and never reloaded while the user is navigating though the application. Components managed by Vue-router that represents independant pages (login, register, etc.) are displayed at the top of the home one. The same applies to the navigation bar. You can think of the display layout as being composed of 3 main layers:

![](https://i.imgur.com/ICYyr3Q.png)

**Layer 1** : home page that integrates the diagram editor in an `<iframe>` html tag.
**Layer 2** : Pages managed by Vue-router.
**Layer 3** : Navigation bar.

**File structure**

A part of the frontend file structure is describes by the following image.

```
/
 |-- css                                
 |-- html                # Plain html pages
 |-- js                                
 |   |-- editor          # Js files inherited from Bowtie+ (so as grapheditor)
 |   |-- modules
 |   |-- risk
 |   `-- env.js
 |-- [...]
 |-- lib
 |-- vue
 |   |-- components      # Components integrated in views or pages
 |   |-- pages           # Components representing "pages", manage by Vue-router
 |   |-- views           # Vue() objects associated with html pages in html/
 |   |-- AppVue.js       # Main Vue instance mounted on index.html
 |   |-- router.js       # Vue router
 |   `-- store.js        # Vuex store object
 `-- index.html
```

**Pages integration with Vuejs**

As the main Vue instance, AppVue is mounted on the `index.html` and manages the app logic with the router and the Vuex store object.

![](https://i.imgur.com/fEEecoL.png)

### Backend

For the backend of BowTie++, we opted for a REST API for a maximum of flexibility and reusability. In the REST API, data is not tied to resources or methods, so REST can handle multiple types of calls, return different data formats. This allows us to meet the needs of our primary client, but also the needs of all potential users of the open-source project. It also eases the remake of the Frontend service, or the addition of a new one on top of our web application, such as a Desktop or mobile applications.

Django and Django REST framework (DRF) were chosen for backend frameworks, as they are "Hard to learn, easy to use". They provide many handful tools that make the developer's life a lot easier.
One of the main features of this choice is the easy  serialization: when Django and DRF are coupled with Django's ORM, serialization becomes the matter of just a few lines of code.

![](https://imgur.com/V3011X6.png)

The 3 main features of the application are separated in different modules also known as "applications" in Django. Each of these applications have a directory containing the tests of the implementation logic. The configuration for the project was also encapsulated in an application. 

```
/
 |-- app           # application configuration files
 |-- core          # database models
 |-- diagram       # diagram management API logic                 
 |-- user          # user account management API logic
 `-- logs          # directory for storing logs of the application(mandatory) 
```

#### App module
This module is used for the configuration of the project. There are two important configuration files - `setting.py` and `.env`. There is also a file called `urls.py` that defines the base url prefixes for the API services and a deployment configuration file called `wsgi.py`.  Here is the structure of the module 

```
app/
 |-- settings.py                
 |-- .env                              
 |-- .env.example               
 |-- urls.py
 |-- envexampleset.sh               
 `-- wsgi.py               
```

##### <span>settings.py</span>
In this file are defined all the installed libraries and middlewares used for the project. In the file are also configured the CORS policy, database user credentials, authentication schemes and variables, email service of the application, logging, static files directory, the language and the timezone used by the application. All these configurations are then set in the application environment and are used across all other modules. Some of the values of the configuration variables are defined in the .env file. 
More information on how to properly configure this file: https://docs.djangoproject.com/en/2.2/ref/settings/


##### .env
This file is used to set the values of some variables in `settings.py` which are considered to contain sensitive information (e.g., the application secret key, salt used for password hashing, authentication token validity timeout). 
Encapsulating the environment variables in a file gives flexability to the developpers to modify the variable values. 
This file is shared between developers and its presence is mandatory in order to start the application. We have created a file named .env.example which shows all the necessary variables whose values have to be configured before launching the application. In order to update the file we have created a script which automatically updates the content of .env.example from .env (envexampleset.sh). We suggest using the python secrets module for generation of secrets for all the variables starting with "SECRET" (encrypting and hashing) or ending with "SALT" (hashing).
More information on how to generate secrets: https://docs.python.org/3/library/secrets.html
Here is an overview of the .env.example file for the current state of the project:

```
SECRET_KEY = 
SECRET_KEY_RESET = # key for generation of tokens used for password reset links 
SECRET_KEY_CONFIRM = # key for tokens used for email confirmation links 
SECRET_KEY_TOTP = # key for two-factor authentication token generation 
TOTP_CONFIRM_SALT = # salt for two-factor token generation
SALT_CONFIRM_MAIL = # salt for email confirm token generation
SALT_RESET_PASSWORD = # salt for password reset token generation
PASSWORD_RESET_TIMEOUT = # validity of the password reset token
TOTP_CONFIRM_RESET_TIMEOUT = # validity of the two-factor authentication confirmation token
AUTHENTICATION_TOKEN_EXPIRE_HOURS = # time in hours for the authentication token expiration
AUTHENTICATION_TOKEN_EXPIRE_SECONDS = # time in secods for the authentication token expiration
EMAIL_BACKEND = # SMTP server for the email service
SHARE_BY_EMAIL_ACTIVATED =
EMAIL_HOST =
EMAIL_HOST_USER =
EMAIL_HOST_PASSWORD =
EMAIL_PORT =
EMAIL_USE_TLS =
STATIC_SERVER_HOST=
STATIC_SERVER_PORT=
API_SERVER_HOST=
API_SERVER_PORT=
WEB_PROTOCOL=
SHARE_BY_EMAIL_ACTIVATED=
```
##### <span>urls.py</span>
This file defines all of the url prefixes used by API services in the other modules. 

#### Core module
This module defines the database models used in the application. These models can be found in the `models.py` file. The unit tests of the functionalities can be found in the sub-directory of this module named tests. Here is the structure of the module:

```
core/
 |-- managment                
 |-- migrations      # Django ORM engine migrations directory
 |-- tests           # test directory
 |-- __init__.py     # python config file
 |-- admin.py        # admin application model                
 |-- apps.py         # Django module configuration file
 `-- models.py       # database models
```

#### User module
This module defines the API user management (CRUD) and authentication logics (token authentication, two-factor authentication, password validators, API ressources permissions). There is also a test directory in which can be found unit tests of all the functionalities.
Here is the structure of the module:
```
user/ 
 |-- tests               # test directory
 |-- views.py            # API CRUD logic authentication                
 |-- __init__.py         # python config file
 |-- serializers.py      # Database serialization and deserialization logic
 |-- apps.py             # Django module configuration file
 |-- validators.py       # password and username validators
 |-- totpviews.py        # two-factor authentication logic
 |-- urls.py             # url suffixes for the API
 |-- autnentication.py   # token generation logic 
 `-- customPermission.py # permission logic for accessing API ressources
```

Useful information about the libraries used for this module:
- https://django-otp-official.readthedocs.io/en/stable/
- https://simpleisbetterthancomplex.com/tutorial/2016/08/24/how-to-create-one-time-link.html
- https://github.com/SmileyChris/django-old/blob/master/django/contrib/auth/tokens.py
- https://www.django-rest-framework.org/api-guide/permissions/
- https://docs.djangoproject.com/en/3.2/topics/auth/passwords/

#### Diagram module 
This module defines the API routes for diagram management, the main file is `views.py` and it contains all the logic for our REST API.
Here is the structure of the module:
```
diagram/ 
 |-- tests           # test directory
 |-- views.py        # API with REST Logic for diagram's routes
 |-- __init__.py     # Python config file
 |-- serializers.py  # Database serialization and deserialization for diagram model
 |-- apps.py         # Django module configuration file
 `-- urls.py         # url suffixes for the API
```

Two librairies are used for this module:
- Taggit, to manage diagram's tags: https://django-taggit.readthedocs.io/en/latest/api.html
- Django-reversion, to manage diagram's versioning: https://django-reversion.readthedocs.io/en/stable/

## Licenses

### Frontend

- axios: https://github.com/axios/axios
- Vuejs: https://vuejs.org/
- Bootstrap: https://getbootstrap.com/
- Vue Material: https://vuematerial.io/
- mxGraph (and grapheditor): https://github.com/jgraph/mxgraph

### Backend 

- Django REST: https://www.django-rest-framework.org/
- PostreSQL: https://www.postgresql.org/
- Django: https://www.djangoproject.com/
