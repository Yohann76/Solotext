# Security 

Currently, I have implemented an authentication solution using JSON Web Tokens (JWT) that authenticates requests made by members. Each request is validated with a JWT token which allows the system to securely identify the user making the request as well as their assigned role. This ensures that only authenticated users can access protected endpoints and that their permissions are correctly enforced based on their roles.

Password encrypt : Bcrypt

Role : admin, prenium, user