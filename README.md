<h1 align="center"># 🚀 LocalAid – Hyperlocal Help & Resource Sharing Platform</h1>

###

<p align="left">> A full-stack MERN application that enables people to **request or offer help** within their nearby area using real-time updates and location-based discovery.</p>

###

<h2 align="left">## 🌍 About the Project</h2>

###

<p align="left">In many cities and towns, people struggle to find **quick, local assistance** for urgent needs such as medical help, food, tools, or services.  <br>**LocalAid** bridges this gap by connecting users **within a limited geographic radius**, ensuring help reaches fast and locally.</p>

###

<h2 align="left">## 🧠 Engineering Highlights</h2>

###

<p align="left">-Designed **AI-assisted trend summarization** to extract meaningful insights from geospatial data<br>- Implemented **real-time bidirectional communication** using WebSockets<br>- Optimized backend performance by executing location filtering directly in MongoDB<br>- Built scalable REST APIs with clear separation of concerns<br>- Ensured secure user actions via JWT middleware and authorization checks</p>

###

<h2 align="left">## ✨ Key Features</h2>

###

<p align="left">
### 📍 Hyperlocal Discovery<br>- Location-based feed using MongoDB **GeoJSON + geospatial indexes**<br>- Radius-filtered posts handled at database level for performance<br><br>
### 🤖 AI Trend Summary<br>- AI analyzes nearby posts to generate **human-readable community insights**<br>- Highlights **most requested** and **most offered** categories<br>- Reduces cognitive load for users and improves engagement<br><br>
### 💬 Real-Time User Chat<br>- One-to-one chat between users using **Socket.io**<br>- Low-latency messaging with persistent conversation state<br>- Enables instant coordination without leaving the platform<br><br>
### ⚡ Real-Time Events<br>- New post alerts<br>- Post fulfillment updates<br>- Karma / reputation updates<br>- Chat notifications</p>

###

<h2 align="left">## 🛠️ Tech Stack</h2>

###

<p align="left">
### Frontend<br>- React.js<br>- Tailwind CSS<br>- Axios<br>- Socket.io Client<br><br>
### Backend<br>- Node.js<br>- Express.js<br>- MongoDB (GeoJSON + `$near` queries)<br>- Mongoose<br>- JWT Authentication<br>- Multer (Image Uploads)<br>- Socket.io<br><br>
### Deployment<br>- Frontend: Vercel<br>- Backend: Render<br>- Database: MongoDB Atlas</p>

###

<h2 align="left">## 🧠 System Architecture</h2>

###

<p align="left">React Client<br>|<br>| REST APIs + WebSockets<br>|<br>Node.js + Express Server<br>|<br>| Mongoose ODM<br>|<br>MongoDB (Geospatial Indexes)</p>

###

<h2 align="left">## 📍 Location & AI Flow</h2>

###

<p align="left">1. User location captured via browser Geolocation API  <br>2. Posts stored as GeoJSON points in MongoDB  <br>3. Geospatial aggregation groups nearby posts  <br>4. AI generates concise, user-friendly trend summaries  <br>5. Results delivered in real time to connected clients</p>

###

<h2 align="left">## 💬 Chat Flow</h2>

###

<p align="left">1. User initiates chat from a post  <br>2. Socket.io establishes persistent connection  <br>3. Messages transmitted in real time  <br>4. Conversation state synced across clients</p>

###

<h2 align="left">## 🔐 Authentication Flow</h2>

###

<p align="left">1. User registers / logs in  <br>2. JWT token generated on server  <br>3. Token stored securely on client  <br>4. Protected routes validated via middleware</p>

###

<h2 align="left">## 📸 Screenshots</h2>

###

<p align="left">Landing Page</p>

###

<div align="center">
  <img height="200" src="./screenshots/LandingPage.png"  />
</div>

###

<p align="left">Login Page</p>

###

<div align="center">
  <img height="200" src="./screenshots/LoginPage.png"  />
</div>

###

<p align="left">Register Page</p>

###

<div align="center">
  <img height="200" src="./screenshots/RegisterPage.png"  />
</div>

###

<p align="left">Home Page</p>

###

<div align="center">
  <img height="200" src="./screenshots/HomePage.png"  />
</div>

###

<p align="left">Create Post Page- Where user can add offer post or request post with images</p>

###

<div align="center">
  <img height="200" src="./screenshots/CreatePost.png"  />
</div>

###

<p align="left">Post Cards in homepage - Realtime post display in user accounts within 5kms of range.</p>

###

<div align="center">
  <img height="200" src="./screenshots/PostCards.png"  />
</div>

###

<p align="left">Image Display Panel of users post images</p>

###

<div align="center">
  <img height="200" src="./screenshots/ImageDisplay.png"  />
</div>

###

<p align="left">Chatbox - Can directly message the post maker from the message button in post cards</p>

###

<div align="center">
  <img height="200" src="./screenshots/ChatBox.png"  />
</div>

###

<p align="left">Map Pins- Realtime colored pins to display different posts in the near by area</p>

###

<div align="center">
  <img height="200" src="./screenshots/MapPins.png"  />
</div>

###

<p align="left">AI powered trend banner - Gives overall post summary to the users</p>

###

<div align="center">
  <img height="200" src="./screenshots/TrendBanner.png"  />
</div>

###

<p align="left">Profile Page - Helps handle posts made by the logged in user</p>

###

<div align="center">
  <img height="200" src="./screenshots/ProfilePage.png"  />
</div>

###

<p align="left">Karma Points Reward System- When a post is marked complete by the logged-in user , they can reward points to the helper.</p>

###

<div align="center">
  <img height="200" src="./screenshots/KarmaReward.png"  />
</div>

###

<h2 align="left">## 🚀 Live Demo</h2>

###

<p align="left">🔗 **Frontend:** https://your-frontend-url  <br>🔗 **Backend API:** https://your-backend-url</p>

###

<h2 align="left">## 🚧 Future Improvements</h2>

###

<p align="left">Push notifications<br>Admin moderation dashboard<br>Comments on posts<br>Post expiration & auto-cleanup</p>

###

<h2 align="left">## 👨‍💻 Author</h2>

###

<p align="left">Aryan Jarial<br><br>GitHub: https://github.com/your-username<br>LinkedIn: https://linkedin.com/in/your-profile</p>

###

<h2 align="left">## Tech used in the project</h2>

###

<div align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" height="40" alt="javascript logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="40" alt="react logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" height="40" alt="nodejs logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" height="40" alt="mongodb logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" height="40" alt="express logo"  />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/socketio/socketio-original.svg" height="40" alt="socketio logo"  />
</div>

###