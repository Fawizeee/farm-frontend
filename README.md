# Mufu Farm UI

Production-level React frontend for Mufu Catfish Farm with dynamic data from backend API.

## Features

- **Dynamic Product Catalog** - Products loaded from database
- **Real-time Order Management** - Submit orders directly to backend
- **Admin Dashboard** - Complete admin panel with authentication
- **Testimonials** - Customer testimonials loaded from database
- **Contact Form** - Messages saved to database
- **Responsive Design** - Works on all devices
- **Loading States** - User-friendly loading indicators
- **Error Handling** - Graceful error messages

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

For production, update the API URL to your backend server.

### 3. Run Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
src/
├── components/
│   ├── js/
│   │   ├── HomePage.js          # Landing page
│   │   ├── OrderPage.js         # Product catalog & cart
│   │   ├── ContactPage.js       # Contact information & form
│   │   ├── AboutPage.js         # About the farm
│   │   ├── AdminLogin.js        # Admin authentication
│   │   ├── AdminHome.js         # Admin dashboard
│   │   ├── AdminOrdersPage.js   # Order management
│   │   ├── CartModal.js         # Shopping cart & checkout
│   │   ├── Navbar.js            # Navigation bar
│   │   ├── Footer.js            # Footer component
│   │   └── Testimonials.js      # Customer testimonials
│   └── css/                     # Component styles
├── services/
│   ├── apiClient.js             # Axios configuration
│   ├── productService.js        # Product API calls
│   ├── orderService.js          # Order API calls
│   ├── testimonialService.js    # Testimonial API calls
│   ├── contactService.js        # Contact form API calls
│   ├── adminService.js          # Admin dashboard API calls
│   └── authService.js           # Authentication API calls
├── App.js                       # Main app component
└── index.js                     # Entry point
```

## Available Scripts

- `npm start` - Run development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Features by Page

### Home Page
- Hero section with call-to-action
- Features showcase
- Dynamic testimonials from database

### Order Page
- Product catalog loaded from API
- Real-time availability status
- Shopping cart with quantity controls
- Order submission with payment proof
- Pending orders tracking

### Admin Portal
- Secure login with JWT authentication
- Dashboard with statistics:
  - Total orders
  - Revenue tracking
  - Product availability
- Order management:
  - View all orders
  - Update order status
  - Customer information
- Real-time data updates

### Contact Page
- Location details
- Contact form with API integration
- Success/error feedback

## API Integration

All data is dynamically loaded from the backend API:

- **Products** - `GET /api/products`
- **Orders** - `POST /api/orders`, `GET /api/orders`
- **Testimonials** - `GET /api/testimonials`
- **Contact** - `POST /api/contact`
- **Admin Auth** - `POST /api/admin/login`
- **Dashboard Stats** - `GET /api/admin/dashboard-stats`

## Authentication

Admin pages use JWT token authentication:
1. Login via Admin Portal
2. Token stored in localStorage
3. Automatically included in API requests
4. Protected routes redirect to login if unauthenticated

Default admin credentials (backend):
- Username: `admin`
- Password: `admin123`

## Production Deployment

### Option 1: Static Hosting (Netlify, Vercel, etc.)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder

3. Set environment variables on hosting platform:
   ```
   REACT_APP_API_URL=https://your-api-domain.com
   ```

4. Configure redirects for React Router (create `public/_redirects`):
   ```
   /*    /index.html   200
   ```

### Option 2: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]
EXPOSE 3000
```

Build and run:
```bash
docker build -t mufu-farm-ui .
docker run -p 3000:3000 -e REACT_APP_API_URL=http://your-api mufu-farm-ui
```

### Option 3: Nginx

1. Build the app: `npm run build`

2. Configure nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:8000;
    }
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Optimizations

- Code splitting with React.lazy (ready for implementation)
- Image optimization
- API response caching
- Loading states to improve perceived performance

## Future Enhancements

- Image upload for payment proofs (Cloudinary integration ready in backend)
- Push notifications for order updates
- Customer order tracking without login
- Product images
- Advanced filtering and search
- Real-time notifications using WebSockets

## Support

For issues or questions, contact: info@mufufarm.com
