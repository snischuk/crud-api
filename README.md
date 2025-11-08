# CRUD API

## Description
Simple CRUD API using an in-memory database.

## API Endpoints

### `GET /api/users`
- Get all users  
- `200` — success  

### `GET /api/users/{userId}`
- Get user by id  
- `200` — found  
- `400` — invalid id  
- `404` — not found  

### `POST /api/users`
- Create new user  
- `201` — created  
- `400` — missing required fields  

### `PUT /api/users/{userId}`
- Update user  
- `200` — updated  
- `400` — invalid id  
- `404` — not found  

### `DELETE /api/users/{userId}`
- Delete user  
- `204` — deleted  
- `400` — invalid id  
- `404` — not found  

### User object
```json
{
  "id": "uuid",
  "username": "string (required)",
  "age": "number (required)",
  "hobbies": ["array of strings or empty"]
}
