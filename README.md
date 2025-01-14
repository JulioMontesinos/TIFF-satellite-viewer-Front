**TIFF Satellite Viewer**

This project is a web application designed for managing and visualizing shapes on maps with features like rectangle and polygon creation, deletion, modification, and persistence. The application uses OpenLayers for optimal map interaction and integrates with a public CartoCDN map for an intuitive user experience.

Production URL:
https://tiff-satellite-viewer-front.vercel.app
________________

**Features**

    Shape Management:
        Create rectangles and polygons of any size and shape.
        Modify and delete individual shapes or clear all shapes at once.
        Changes are persisted in the database or mock data storage.

    Map Interaction:
        Leveraged OpenLayers for better usability compared to Leaflet.
        Integrated a public CartoCDN basemap for seamless navigation.

    Data Persistence:
        Immediate persistence in MongoDB when using a database.
        Mock data persists between sessions but resets when the server restarts.

    Backend Security:
        Middleware protects backend routes, ensuring no unauthorized access via tools like Postman.
        Token-based protection limits access to the application.
        Placeholder user (userID: 12345) supports future user authentication and session management.
		
		
_________________

**Project Organization**

The project is split into frontend and backend for a clear and maintainable structure:

    Frontend: Built with reusable components for user interaction.
    Backend: Features middleware for route protection and easy extensibility for future user management.
	
_________________

**Future Enhancements**

User Authentication:

    Implement unique user tokens to manage access and data securely.
    Support user-specific shapes, permissions, and data ownership.
    Add a user-friendly design for account creation and login, or integrate a service like Auth0 for simplified authentication.

Session Management:

    Enable session persistence to avoid frequent re-login when refreshing the page.

Improved Design:

    Enhance the application's UI for a more modern and intuitive experience.
    Introduce drag-and-drop functionality for shapes, allowing users to move them dynamically across the map.

Other Features:

    Add support for creating and modifying shapes directly through interactive gestures.
    Provide additional customization options for shape properties and behaviors.

Security Enhancements
  
    Rate Limiting: Implement server-side mechanisms to restrict the number of requests per user/IP to prevent abuse (e.g., no more than 100 requests per minute).
    Double-Click Prevention: Block repeated actions triggered by multiple clicks by disabling UI elements immediately after the first interaction.
    Data Consistency: Add debounce or throttle mechanisms to ensure consistent database updates and prevent race conditions caused by simultaneous requests.
    Error Handling: Enhance server and client-side error handling to gracefully manage invalid requests or interruptions.
	
________________

**Setup Instructions**

Local Development:

    1. Prepare the Environment:
        Open two terminals:
          Navigate to the frontend folder in one terminal.
          Navigate to the backend folder in another terminal.

    2. Run Development Servers:
        In both terminals, execute: npm run dev.
        Open http://localhost:5173/ to access the application.

    3. Database Configuration:
        By default, the backend uses mock data (DATA_SOURCE=mock).
        To switch to a MongoDB database:
            Rename the file backend/.env.example to .env.
            Edit the newly renamed .env file:
                Set DATA_SOURCE=mongodb.
                Add your MongoDB connection string to MONGODB_URI.
                Set JWT_SECRET to any alphanumeric string for token generation.
        No changes are needed in the frontend/.env file, but make sure to rename frontend/.env.example to .env for consistency.


________________

**Production Deployment:**

Separate Deployment:

    Deploy the frontend and backend as independent applications.

Environment Variables:

    Update the environment variables in your hosting platforms:
        Replace localhost:XXX with the respective production URLs for the backend and frontend.
		
			
