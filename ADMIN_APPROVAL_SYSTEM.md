# Restaurant Application Approval System

## Overview
The GrubStack application now includes a complete admin approval system for restaurant applications. This system allows administrators to review, approve, or reject restaurant registration requests.

## How It Works

### 1. Restaurant Registration Process
- Restaurants register through `/restaurant/register`
- Applications are created with `status: 'pending'`
- Restaurants see a "Pending Approval" badge on their dashboard
- They cannot access full functionality until approved

### 2. Admin Approval Process
- Admins access the approval dashboard at `/admin/dashboard`
- View all restaurant applications with filtering and search
- Review application details including:
  - Restaurant name and owner information
  - Contact details (email, phone)
  - Address and cuisine type
  - Business description
- Approve or reject applications with reasons

### 3. Application States
- **Pending**: New application awaiting review
- **Approved**: Application approved, restaurant can operate
- **Rejected**: Application rejected with reason

## Access Points

### For Restaurants
- **Registration**: `http://localhost:8081/restaurant/register`
- **Dashboard**: `http://localhost:8081/restaurant/dashboard` (shows pending status)

### For Admins
- **Admin Dashboard**: `http://localhost:8081/admin/dashboard`
- **Access**: Click "Admin" button in the main header

## Features

### Admin Dashboard Features
- **Statistics**: Total, pending, approved, and rejected applications
- **Search**: Search by restaurant name, owner, or email
- **Filtering**: Filter by application status
- **Detailed View**: Click any application to see full details
- **Bulk Actions**: Approve or reject applications with reasons
- **Real-time Updates**: Status changes reflect immediately

### Restaurant Dashboard Features
- **Status Indicator**: Shows "Pending Approval" badge when not approved
- **Limited Access**: Some features may be restricted until approved
- **Status Updates**: Real-time status updates

## Technical Implementation

### Frontend Components
- `AdminDashboardPage.tsx`: Main admin interface
- `RestaurantRegisterPage.tsx`: Restaurant registration form
- `RestaurantDashboardPage.tsx`: Restaurant dashboard with status
- Updated routing in `Index.tsx` for admin routes

### Data Structure
```typescript
interface RestaurantApplication {
  id: number;
  restaurantName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  cuisine: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}
```

## Demo Data
The system includes mock data for demonstration:
- 3 sample restaurant applications
- Different statuses (pending, approved, rejected)
- Realistic restaurant information

## Future Enhancements
- Backend API integration for real data persistence
- Email notifications for status changes
- Document upload for restaurant verification
- Advanced filtering and sorting options
- Audit trail for approval decisions
- Bulk approval/rejection functionality

## Usage Instructions

1. **Start the application**: `npm run dev` or `npx vite --host --port 8081`
2. **Register a restaurant**: Go to restaurant registration
3. **Access admin panel**: Click "Admin" button in header
4. **Review applications**: View and manage restaurant applications
5. **Approve/Reject**: Use the action buttons to approve or reject applications

The system is now fully functional for testing restaurant application workflows!
