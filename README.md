This is the robust RESTful API that powers the E-Shop platform, built using Node.js, TypeScript, and Express. It handles secure user authentication, complex product management, and payment processing.

🌐 Live API Endpoint
The backend is successfully deployed and can be accessed at:

🚀 Production URL: 

🚀 Technologies Used
Runtime: Node.js & Express
Language: TypeScript
Database: MongoDB & Mongoose
Auth: JWT (JSON Web Tokens)
Payments: COD system
Security: Crypto (MD5 Hashing for verification) & Bcrypt
🛠️ Key Features
User Authentication: Secure Login and Registration flow with JWT.
Order Management: Create orders, update status, and track history.
Payment Integration: Secure MD5 hash generation for PayHere Sandbox verification.
Storage: Integrated with Cloudinary for product image hosting.
Security: Environment variable protection and password hashing.
📦 Getting Started
1️⃣ Prerequisites
Node.js (v16 or higher)
MongoDB connection string (Atlas or Local)
2️⃣ Installation
git clone{https://github.com/dilum-shamilka/E-Shop-Backend.git} 
cd E-Shop-Backend
npm install
npm run dev