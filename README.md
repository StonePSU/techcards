# techcards
=======
# template-server
A base server template for a product.  Contains base api's for authentication, registration and user CRUD.

## Setup
After copying this repo, a .env file needs to be setup so that it works properly.  Note that you must have a Cloudinary account to configure some of the settings.  Cloudinary is used for hosting the profile image in this project.  The following keys must be included in the file:
1. NODE_ENV=dev
2. MONGODB_URL=\<set to your mongo db instance>
3. JWT_KEY=\<create your app's jwt key>
4. CLOUDINARY_CLOUD=\<get from your cloudinary dashboard>
5. CLOUDINARY_APIKEY=\<get from your cloudinary dashboard>
6. CLOUDINARY_APISECRET=\<get from your cloudinary dashboard>

## APIs
### Authentication
The following APIs are included for registration and authentication.

#### Register User
POST /api/signup  

**Sample Payload**  
{  
  "firstName": "Test",  
  "lastName": "Test",  
  "emailAddress": "test@test.com",  
  "password": "Test1234",  
  "phoneNumber": "555-555-5555"  
}  

### Login
POST /api/login  

**Sample Payload**  
{  
  "emailAddress": "test@test.com",  
  "password": "Test1234"  
}  

### User Management
The following API's are included for basic CRUD on users.

#### Get All Users
GET /api/users

#### Get single user
GET /api/users/:id

#### Update single user
PATCH /api/users/:id  

**Sample Payload**  
{  
    "firstName": "Matty"  
}  

#### Delete single user
DELETE /api/users/:id  

#### Update profile image
POST /api/users/:id/profileImage  

Body must be form data with a key 'avatar'.  

#### Change Password
POST /api/users/:id/changePassword

**Sample Payload**  
{  
  "originalPassword": "Test1234",  
  "password": "Test2345"  
}

