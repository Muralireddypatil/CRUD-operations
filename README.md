This​‍​‌‍​‍‌​‍​‌‍​‍‌ project is typical of the CRUD Information System that small electronic stores usually need to manage their electronic products inventories. It offers functionalities such as adding new products, showing existing products, modifying product details, and deleting either separate entries or the entire list. A JavaScript frontend is used in the application to talk directly with a Node.js and Express backend by REST API calls. All the information is stored in a SQLite database that makes the project portable and runnable on any local machine.

The frontend interface intends to be a user-friendly and straightforward tool with input fields for product name, Seller, and price. These inputs work with the API via the Fetch API that enables the application to update data dynamically without the need for a page refresh. The backend is responsible for all CRUD operations and data validation. Also, it coordinates with the SQLite database to get the product information that is to be stored or retrieved. This project has a neat folder structure that server files, frontend files, and JavaScript logic are separated for better organisation.



The backend provides API routes for all CRUD operations. Besides, it includes endpoints for getting the next available ID as well as for the server health check. The frontend is backed by these API routes and facilitates the user commands from UI to the database.

As for the deployment on Render, the only thing that needs to be done is to provide the build and start commands with “npm install” and “node server/server.js” respectively. There are no environment variables since SQLite keeps the data in a local file. Thus, the deployment process is pretty much straightforward.

The entire project is aimed at showcasing the author’s knowledge of API-based architecture, DOM manipulation, and backend integration using ​‍​‌‍​‍‌​‍​‌‍​‍‌JavaScript.

In this project I only created Api's so rest of the code i have done last time that means semester 1. you can have a look at my repository [Murali8327] that i did 8 months ago.

