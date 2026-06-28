# API Requirements

Purpose: replace the current local/mock data and AsyncStorage session flow with production APIs without changing the app's existing UX.

## 1. Platform Standards

- Base URL must replace `static://a1property-local` from `src/config/base-config.ts`.
- Use HTTPS + JSON, ISO-8601 timestamps, stable string IDs, and bearer-token auth after OTP verification.
- All list endpoints should support pagination: `page`, `limit`, `total`, `hasMore`.
- All upload flows must support `PDF`, `JPG`, `PNG`, plus property `image` and `video`.
- Enum values should match the app exactly from `src/constants/appConstants.ts`.

## 2. Auth and Profile

- Required endpoints: `POST /auth/otp/send`, `POST /auth/otp/verify`, `GET /auth/session`, `POST /users/profile`, `PATCH /users/me`, `POST /auth/logout`, `DELETE /users/me`.
- Required fields: `mobile`, `otp`, `selectedRole`, `name`, `email`, `city`, optional `avatar`.
- Rules: mobile is 10 digits, OTP is 6 digits, roles are `buyer|seller|broker`.
- `POST /auth/otp/verify` should return token/session state and whether profile completion is still required.

### Suggested response shapes

`POST /auth/otp/send`

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "mobile": "9998887776",
    "expiresAt": "2026-06-11T12:00:00.000Z"
  }
}
```

`POST /auth/otp/verify`

```json
{
  "success": true,
  "data": {
    "verified": true,
    "token": "jwt-or-access-token",
    "refreshToken": "optional-refresh-token",
    "requiresProfileCompletion": true,
    "selectedRole": "buyer"
  }
}
```

`GET /auth/session` or profile completion response

```json
{
  "success": true,
  "data": {
    "isLoggedIn": true,
    "token": "jwt-or-access-token",
    "selectedRole": "buyer",
    "user": {
      "id": "user-1",
      "name": "Aarav Khanna",
      "mobile": "9998887776",
      "email": "aarav.khanna@example.com",
      "city": "Lucknow",
      "role": "buyer",
      "avatar": "https://cdn.example.com/avatar.jpg"
    }
  }
}
```

## 3. Properties

- Required endpoints: `GET /properties`, `GET /properties/{id}`, `POST /properties`, `PATCH /properties/{id}`, `PATCH /properties/{id}/status`, `DELETE /properties/{id}`, `GET /users/me/properties`.
- Filters required by UI: `search`, `category`, `minPrice`, `maxPrice`, `minArea`, `maxArea`, `propertyType`, `bhk`, `facing`, `city`, `readyToMoveOnly`, `verifiedOnly`, `ownerOnly`.
- Property payload must support: title, description, price, area, type, category, listing type, BHK, facing, road width, furnishing, construction year, floor info, ready state, status, amenities, verified flag, owner summary, location, media, documents, featured flag.
- Upload endpoints are needed for property media/documents, either multipart directly or presigned upload URLs plus metadata save.

### Property model

```json
{
  "id": "property-1",
  "title": "Gomti Nagar Residential Plot",
  "description": "Corner plot near main road.",
  "price": 4500000,
  "areaSqFt": 1800,
  "propertyType": "Plot",
  "category": "Verified",
  "listingType": "Sell",
  "bhk": "3 BHK",
  "facing": "East",
  "roadWidthFt": 25,
  "furnishing": "Semi Furnished",
  "constructionYear": 2021,
  "floorNumber": 1,
  "totalFloors": 2,
  "readyState": "Ready To Move",
  "status": "Active",
  "amenities": ["Parking", "Water Supply"],
  "verified": true,
  "ownerType": "Owner",
  "owner": {
    "id": "user-2",
    "name": "Rajesh Sharma",
    "mobile": "9998887776",
    "email": "rajesh@example.com",
    "role": "seller",
    "city": "Lucknow",
    "avatar": ""
  },
  "location": {
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "district": "Lucknow",
    "area": "Gomti Nagar",
    "address": "Sector 4",
    "pincode": "226010",
    "latitude": 26.8467,
    "longitude": 80.9462
  },
  "media": [
    {
      "id": "media-1",
      "type": "image",
      "uri": "https://cdn.example.com/property-1/photo-1.jpg",
      "thumbnail": "https://cdn.example.com/property-1/thumb-1.jpg"
    }
  ],
  "documents": [
    {
      "id": "doc-1",
      "name": "sale-deed.pdf",
      "type": "PDF",
      "uri": "https://cdn.example.com/property-1/sale-deed.pdf",
      "uploadedAt": "2026-06-11T12:00:00.000Z",
      "status": "uploaded"
    }
  ],
  "createdAt": "2026-06-11T12:00:00.000Z",
  "updatedAt": "2026-06-11T12:00:00.000Z",
  "featured": true
}
```

## 4. Saved and Property Interaction State

- The app currently tracks `favourite`, `interested`, `contacted`, and `recentlyViewed` in `src/store/savedStore.ts`, but there is no service layer yet.
- Required endpoints: `GET /users/me/property-interactions`, `POST /users/me/property-interactions`, `DELETE /users/me/property-interactions/{type}/{propertyId}`.
- Interaction types required: `favourite`, `interested`, `contacted`, `recentlyViewed`.

### Interaction model

```json
{
  "propertyId": "property-1",
  "type": "favourite",
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

## 5. Leads

- Required endpoints: `GET /leads`, `GET /leads/{id}`, `PATCH /leads/{id}/status`, `PATCH /leads/{id}/follow-up`, `POST /leads/{id}/remarks`, `PATCH /leads/{id}/remarks/{remarkId}`, `DELETE /leads/{id}/remarks/{remarkId}`, `DELETE /leads/{id}`.
- Lead data must include buyer summary, linked property summary, status, follow-up date, remarks, status history, and created date.
- Backend should scope leads to the logged-in seller/broker portfolio.

### Lead model

```json
{
  "id": "lead-1",
  "buyer": {
    "id": "user-3",
    "name": "Sneha Verma",
    "mobile": "9876543210",
    "email": "sneha@example.com",
    "role": "buyer",
    "city": "Lucknow",
    "avatar": ""
  },
  "property": {
    "id": "property-1",
    "title": "Gomti Nagar Residential Plot",
    "price": 4500000,
    "location": {
      "city": "Lucknow",
      "state": "Uttar Pradesh",
      "area": "Gomti Nagar"
    }
  },
  "status": "New",
  "lastRemark": "Requested call back",
  "followUpDate": "2026-06-20",
  "remarks": [
    {
      "id": "remark-1",
      "text": "Requested call back",
      "addedBy": "Current User",
      "date": "2026-06-11T12:00:00.000Z"
    }
  ],
  "history": [
    {
      "id": "lead-history-1",
      "status": "New",
      "updatedBy": "Current User",
      "updatedAt": "2026-06-11T12:00:00.000Z",
      "note": ""
    }
  ],
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

## 6. Loans

- Required endpoints: `GET /loan-banks`, `GET /loan-banks/{id}`, `GET /loan-requests`, `GET /loan-requests/{id}`, `POST /loan-requests`, `PATCH /loan-requests/{id}`, `PATCH /loan-requests/{id}/status`, `POST /loan-requests/{id}/documents`, `DELETE /loan-requests/{id}/documents/{docId}`, remark CRUD, `DELETE /loan-requests/{id}`.
- Loan request fields: preferred bank, applicant identity, contact, income, employment type, loan amount, down payment, tenure, interest rate, property details, status, documents, remarks, history.
- Validation: down payment must be `>= 0` and `< loanAmount`.
- Optional but useful: `POST /loan/emi/calculate`.

### Loan bank model

```json
{
  "id": "bank-1",
  "name": "HDFC Bank",
  "interestRate": 8.5,
  "processingFee": "0.5%",
  "eligibility": "Salaried and self-employed",
  "maxLoanAmount": 8000000,
  "turnaroundTime": "7 days",
  "contactPerson": "Ankit Singh",
  "phone": "9876543210",
  "whatsapp": "9876543210",
  "city": "Lucknow",
  "highlights": ["Quick approval", "Low documentation"]
}
```

### Loan request model

```json
{
  "id": "loan-1",
  "preferredBankId": "bank-1",
  "applicantName": "Aarav Khanna",
  "mobile": "9998887776",
  "email": "aarav.khanna@example.com",
  "monthlyIncome": 90000,
  "employmentType": "Salaried",
  "loanAmount": 5000000,
  "downPayment": 500000,
  "tenureYears": 20,
  "interestRate": 8.5,
  "propertyDetails": "2 BHK flat in Noida Sector 62",
  "status": "New",
  "documents": [],
  "remarks": [],
  "history": [],
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

## 7. Legal

- Required endpoints: `GET /legal-teams`, `GET /legal-requests`, `GET /legal-requests/{id}`, `POST /legal-requests`, `PATCH /legal-requests/{id}`, `PATCH /legal-requests/{id}/status`, `POST /legal-requests/{id}/documents`, `DELETE /legal-requests/{id}/documents/{docId}`, remark CRUD, `DELETE /legal-requests/{id}`.
- Legal request types: `Property Verification`, `Property Registration`.
- Registration requests additionally require `buyerName` and `preferredRegistrationDate`.
- Team records must expose contact info, city, specialization, and highlights.

### Legal team model

```json
{
  "id": "legal-team-1",
  "name": "A1 Legal Associates",
  "specialization": "Property Verification",
  "city": "Lucknow",
  "phone": "9876543210",
  "whatsapp": "9876543210",
  "email": "team@example.com",
  "experience": "10 years",
  "highlights": ["Registration support", "Document review"]
}
```

### Legal request model

```json
{
  "id": "legal-1",
  "type": "Property Verification",
  "assignedTeamId": "legal-team-1",
  "applicantName": "Aarav Khanna",
  "ownerName": "Rajesh Sharma",
  "buyerName": "Sneha Verma",
  "propertyDetails": "Residential plot in Gomti Nagar",
  "location": {
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "area": "Gomti Nagar"
  },
  "preferredRegistrationDate": "2026-06-20",
  "status": "Submitted",
  "documents": [],
  "remarks": [],
  "history": [],
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

## 8. Construction

- Required endpoints: `GET /construction/packages`, `GET /construction/materials`, `GET /construction/suppliers`, `GET /construction/contractors`, `GET /construction/quotes`, `POST /construction/quotes`, `GET /construction/quotes/{id}`, `DELETE /construction/quotes/{id}`, `GET /construction/requests`, `POST /construction/requests`, `DELETE /construction/requests/{id}`.
- Quote inputs: `plotSizeSqFt`, `builtUpAreaSqFt`, `floors`, `quality`.
- Quote outputs: `materialCost`, `labourCost`, `totalCost`, `estimatedTimelineMonths`.
- Additional shortlist endpoints are needed for saved materials, shortlisted suppliers, and shortlisted contractors.

### Construction package model

```json
{
  "id": "package-1",
  "name": "Standard",
  "costPerSqFt": 1800,
  "materialQuality": "Mid-range branded materials",
  "labourIncluded": true,
  "timeline": "10-12 months",
  "features": ["Structure", "Electrical", "Plumbing"]
}
```

### Construction quote model

```json
{
  "id": "quote-1",
  "plotSizeSqFt": 1200,
  "builtUpAreaSqFt": 1200,
  "floors": 2,
  "quality": "Standard",
  "materialCost": 2400000,
  "labourCost": 900000,
  "totalCost": 3300000,
  "estimatedTimelineMonths": 10,
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

### Construction request model

```json
{
  "id": "construction-request-1",
  "customerName": "Aarav Khanna",
  "mobile": "9998887776",
  "location": {
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "area": "Standard construction"
  },
  "quoteId": "quote-1",
  "documents": [],
  "remarks": [],
  "history": [
    {
      "id": "construction-history-1",
      "status": "Submitted",
      "updatedBy": "Aarav Khanna",
      "updatedAt": "2026-06-11T12:00:00.000Z"
    }
  ]
}
```

## 9. Support

- Required endpoints: `GET /support/tickets`, `GET /support/tickets/{id}`, `POST /support/tickets`, `PATCH /support/tickets/{id}`, `PATCH /support/tickets/{id}/status`, `POST /support/tickets/{id}/documents`, `DELETE /support/tickets/{id}/documents/{docId}`, remark CRUD, `DELETE /support/tickets/{id}`.
- Required fields: `issueType`, optional `relatedProperty`, `subject`, `description`, `status`, `documents`, `remarks`, `history`.

### Support ticket model

```json
{
  "id": "ticket-1",
  "issueType": "Property Listing",
  "relatedProperty": "property-1",
  "subject": "Unable to upload property",
  "description": "Submission fails on final step",
  "status": "Open",
  "documents": [],
  "remarks": [],
  "history": [
    {
      "id": "support-history-1",
      "status": "Open",
      "updatedBy": "User",
      "updatedAt": "2026-06-11T12:00:00.000Z"
    }
  ],
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

## 10. Notifications

- Required endpoints: `GET /notifications`, `PATCH /notifications/{id}/read`, `PATCH /notifications/read-all`, `DELETE /notifications/{id}`.
- Filters required: `category`, optional unread-only behavior.
- Categories used by the app: `Properties`, `Legal`, `Loans`, `Construction`, `Offers`.

### Notification model

```json
{
  "id": "notification-1",
  "title": "Property approved",
  "message": "Your listing is now live.",
  "category": "Properties",
  "isRead": false,
  "createdAt": "2026-06-11T12:00:00.000Z"
}
```

## 11. Aggregate / Dashboard Endpoints

- Optional but recommended: `GET /dashboard/home`, `GET /dashboard/profile`, `GET /dashboard/services`.
- These can reduce client-side recomputation for featured/latest properties, unread counts, ticket counts, request counts, and shortlist totals.

## 12. Common Shared Models

### Uploaded document

```json
{
  "id": "doc-1",
  "name": "sale-deed.pdf",
  "type": "PDF",
  "uri": "https://cdn.example.com/docs/sale-deed.pdf",
  "uploadedAt": "2026-06-11T12:00:00.000Z",
  "status": "uploaded"
}
```

### Remark

```json
{
  "id": "remark-1",
  "text": "Internal note",
  "addedBy": "Support Team",
  "date": "2026-06-11T12:00:00.000Z"
}
```

### Status history item

```json
{
  "id": "history-1",
  "status": "In Review",
  "updatedBy": "Finance Team",
  "updatedAt": "2026-06-11T12:00:00.000Z",
  "note": "Documents validated"
}
```

### Standard list response

```json
{
  "success": true,
  "data": {
    "items": [],
    "page": 1,
    "limit": 20,
    "total": 0,
    "hasMore": false
  },
  "message": "Success"
}
```

### Standard error response

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "mobile": ["Mobile number must be 10 digits"]
  }
}
```

## 13. Important Implementation Notes

- The UI needs the full property filter behavior from `src/utils/propertyUtils.ts`, which is broader than the current mock `propertyApi` filtering.
- File upload is a real backend requirement across profile, properties, loans, legal, and support.
- Call, WhatsApp, share, and local calculator logic are client-side; those do not require backend support unless analytics or audit logging is desired.
- The current splash/auth flow expects a session bootstrap path compatible with `GET /auth/session`.
- Status transitions should preserve history arrays because all detail screens render status history directly.
